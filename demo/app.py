# -*- coding: utf-8 -*-
"""지능형 정보 시스템 · 통합 데모 서버 (단일 통합 셸).

통합 담당(PM) 관점:
  파트 A(VLM 비전)와 파트 B(하이브리드 RAG/에이전트)를 하나의 AI 에이전트 허브로 묶어
  와이어프레임 8개 화면(메인/질의/이미지/검색/공공데이터/보고서/데이터관리/업무자동화)을
  단일 웹앱으로 제공한다.

설계 원칙:
  · 의존성 0(표준 라이브러리 http.server)으로 구동 — 데모 안정성 최우선.
  · 비전은 vlm_bridge 경유(실제 VLM 패키지 → 폴백). RAG/에이전트는 Hybrid_RAG/src 직접 호출.
  · 키(GEMINI/VOYAGE/DATAGO) 없이도 끝까지 동작, 키가 있으면 자동 승격.

실행:  python app.py   →  http://localhost:8000
"""
from __future__ import annotations

import base64
import csv
import json
import math
import os
import sys
import tempfile
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

ROOT = os.path.dirname(os.path.abspath(__file__))
HRAG = os.path.join(ROOT, "Hybrid_RAG")
HRAG_SRC = os.path.join(HRAG, "src")
WEB = os.path.join(ROOT, "web")
SAMPLES = os.path.join(ROOT, "data", "samples")
REPORT_PATH = os.path.join(ROOT, "report_output.docx")

for p in (HRAG_SRC, ROOT):
    if p not in sys.path:
        sys.path.insert(0, p)

# ── 백엔드 모듈 (파트 B: 하이브리드 RAG / 에이전트) ───────────────────
import agent          # noqa: E402
import regions        # noqa: E402
import review as review_mod  # noqa: E402
from retrieve import Index   # noqa: E402
from schema import connect, log_query  # noqa: E402

try:
    import report as report_mod   # python-docx 필요
    _HAS_DOCX = True
except Exception:
    report_mod = None
    _HAS_DOCX = False

# ── 비전 브리지 (파트 A) ─────────────────────────────────────────────
import vlm_bridge      # noqa: E402

_IDX: Index | None = None
_VISION_CACHE: dict = {}


# ─────────────────────────────────────────── 부트스트랩
def ensure_db():
    """rag.db 없으면 normalized.jsonl(263건)로 적재. 검수상태 1회 시드."""
    db_path = os.path.join(HRAG, "rag.db")
    if not os.path.exists(db_path):
        import ingest
        data = os.path.join(HRAG, "data", "normalized.jsonl")
        if not os.path.exists(data):
            data = os.path.join(HRAG, "data", "sample_daejeon.jsonl")
        print(f"[부트스트랩] rag.db 생성 중 … ({os.path.basename(data)})")
        ingest.ingest(data, db_path)
    _seed_reviews(db_path)


def _seed_reviews(db_path: str):
    """검수 상태를 1회 시드 — 데이터관리/KPI 화면이 살아있도록.
    이미 시드됨(=비-pending 존재)이면 건너뜀(멱등)."""
    import hashlib
    conn = connect(db_path)
    counts = {r["review_status"]: r["c"] for r in conn.execute(
        "SELECT review_status, COUNT(*) c FROM unified_doc GROUP BY review_status")}
    if any(k != "pending" for k in counts):
        conn.close()
        return
    rows = [dict(r) for r in conn.execute(
        "SELECT doc_id, title, domain, region_name FROM unified_doc")]
    ts = datetime.now(timezone.utc).isoformat(timespec="seconds")
    # 결정론적 분포: ≈78% 승인 / ≈18% 대기 / ≈4% 반려
    for r in rows:
        h = int(hashlib.md5(r["doc_id"].encode()).hexdigest(), 16) % 100
        st = "approved" if h < 78 else ("pending" if h < 96 else "rejected")
        conn.execute("UPDATE unified_doc SET review_status=?, updated_at=? WHERE doc_id=?",
                     (st, ts, r["doc_id"]))
    # 대표 변경이력 몇 건(화면 G changelog) — set_review_status가 로그를 남김
    from schema import set_review_status
    picks = [r for r in rows if "비전" in (r["title"] or "") or "포트홀" in (r["title"] or "")][:3]
    picks += [r for r in rows if r.get("domain") == "재난안전"][:2]
    for i, r in enumerate(picks):
        stt = "approved" if i % 3 != 2 else "rejected"
        set_review_status(conn, r["doc_id"], stt, ts, note="검수 확정")
    conn.commit()
    conn.close()
    print("[부트스트랩] 검수 상태 시드 완료")


def get_idx() -> Index:
    global _IDX
    if _IDX is None:
        _IDX = Index()
    return _IDX


# ─────────────────────────────────────────── 공통 유틸
def _provider() -> str:
    try:
        import llm
        return "gemini" if llm.gemini_available() else "offline"
    except Exception:
        return "offline"


def _intent_flt(intent: dict) -> dict:
    flt = {}
    if intent.get("domain"):
        flt["domain"] = intent["domain"]
    if intent.get("sigungu_cd"):
        flt["sigungu_cd"] = intent["sigungu_cd"]
    elif intent.get("sido_cd"):
        flt["sido_cd"] = intent["sido_cd"]
    return flt


def _plan(question: str):
    """report._plan 과 동일 로직(보고서 없을 때도 동작하도록 자체 구현)."""
    if report_mod:
        return report_mod._plan(question)
    intent = agent.analyze_intent(question)
    flt = _intent_flt(intent)
    metric, label = agent.DOMAIN_METRIC.get(intent["domain"] or "교통안전", ("count", "건수"))
    group_by = "surface" if "노면" in question else (
        "roadtype" if "도로종류" in question else "region_name")
    return intent, flt, metric, label, group_by


def _is_vision(question: str, domain: str | None) -> bool:
    kw = ["포트홀", "균열", "파임", "이미지", "탐지", "라벨", "pothole", "crack", "도로 손상", "노면 파손"]
    return (domain == "도로시설") or any(k in question.lower() for k in [k.lower() for k in kw])


def _pick_sample() -> str | None:
    if os.path.isdir(SAMPLES):
        for n in sorted(os.listdir(SAMPLES)):
            if n.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                return os.path.join(SAMPLES, n)
    return None


def _vision_summary(question: str) -> dict | None:
    samp = _pick_sample()
    if not samp:
        return None
    key = os.path.basename(samp)
    if key not in _VISION_CACHE:
        _VISION_CACHE[key] = vlm_bridge.detect(samp, query=question, detector="mock", conf=0.25)
    v = _VISION_CACHE[key]
    return {"count": v["stats"]["count"], "severe": v["stats"]["severe"],
            "avg_conf": v["stats"]["avg_conf"], "backend": v["stats"]["backend"],
            "sample": key}


def _compose_answer(q, domain, region, hits, stats, vision, label) -> str:
    rgn, dom = region or "전국", domain or "공공데이터"
    parts = []
    if vision:
        parts.append(f"비전 탐지 결과 대상 이미지에서 {vision['count']}건을 탐지했습니다"
                     f"(심각 {vision['severe']}건, 평균 신뢰도 {int(vision['avg_conf']*100)}%).")
    if hits:
        nv = sum(1 for h in hits if h.get("source") == "gnsoft_vision")
        parts.append(f"하이브리드 검색(의미+키워드 융합·재정렬)으로 {dom} 관련 문서 {len(hits)}건"
                     f"(사내 비전 {nv} · 공공 {len(hits)-nv})을 찾았습니다.")
    if stats:
        top = stats[0]
        parts.append(f"{label} 집계에서 '{top['group']}'이(가) {int(top[list(top.keys())[1]]):,}로 가장 높습니다."
                     if False else
                     f"{label} 집계에서 '{top['group']}'이(가) {int(top['value']):,}로 가장 높습니다.")
    parts.append(f"({rgn}) 근거 출처를 함께 확인해 의사결정에 활용하세요.")
    return " ".join(parts)


def ask_payload(question: str) -> dict:
    idx = get_idx()
    intent, flt, metric, label, group_by = _plan(question)
    domain, region = intent.get("domain"), intent.get("region")

    steps = [{"kind": "intent", "label": "의도 분석",
              "text": f"도메인 = {domain or '전체'} · 지역 = {region or '전국'} · "
                      f"유형 = {'통계/순위' if intent.get('is_stats') else '검색'}"
                      f"{' + 보고서' if intent.get('is_report') else ''}"}]

    vision = None
    if _is_vision(question, domain):
        vision = _vision_summary(question)
        if vision:
            steps.append({"kind": "tool", "tool": "VLM · YOLO 탐지", "ok": True,
                          "label": "도구 호출 · 비전 이미지 탐지",
                          "text": f"{vision['count']}건 탐지 (심각 {vision['severe']}) · "
                                  f"backend={vision['backend']}"})

    hits = idx.hybrid_search(question, filters=flt, k=6)
    steps.append({"kind": "tool", "tool": "hybrid_search", "ok": True,
                  "label": "도구 호출 · 하이브리드 RAG 검색 + 재정렬",
                  "text": f"{len(hits)}건 검색 (Dense 임베딩 + Sparse BM25 → RRF 융합)"})

    agg_flt = dict(flt)
    if group_by == "region_name":
        agg_flt.pop("sido_cd", None)
        agg_flt.pop("sigungu_cd", None)
    raw_stats = idx.stats_query(metric, group_by, agg_flt)[:8]
    stats = [{"label": s["group"], "group": s["group"], "value": s.get(metric, 0)} for s in raw_stats]
    if stats:
        steps.append({"kind": "tool", "tool": "aggregate", "ok": True,
                      "label": "도구 호출 · 공공데이터 통계 집계",
                      "text": f"{label} · 그룹({group_by}) {len(stats)}건 집계"})

    answer = _compose_answer(question, domain, region, hits, stats, vision, label)
    steps.append({"kind": "answer", "label": "AI 응답 생성",
                  "text": f"{domain or '공공데이터'} · {region or '전국'} 통합 응답 + 출처 제시"})

    sources = sorted({h["provenance"].get("url", "") for h in hits if h["provenance"].get("url")})
    sources = [s for s in sources if s]

    # 질의 이력 기록
    try:
        ts = datetime.now(timezone.utc).isoformat(timespec="seconds")
        tools = [s.get("tool") for s in steps if s["kind"] == "tool"]
        conn = connect(idx.db_path)
        log_query(conn, ts, question, intent, tools, answer, _provider())
        conn.close()
    except Exception:
        pass

    return {"answer": answer, "provider": _provider(),
            "domain": domain, "region": region,
            "intent": {"domain": domain, "region": region,
                       "is_stats": intent.get("is_stats"), "is_report": intent.get("is_report")},
            "steps": steps, "vision": vision,
            "hits": hits, "stats": stats,
            "metric_label": label, "group_by": group_by, "sources": sources}


# ─────────────────────────────────────────── 메인 화면 개요(KPI)
def overview_payload() -> dict:
    idx = get_idx()
    doms = idx.domains()
    vcount = sum(1 for r in idx.rows if r.get("source") == "gnsoft_vision")
    counts = review_mod.status_counts()
    total = sum(counts.values()) or 1
    auto = round(counts.get("approved", 0) / total * 100)
    return {"docs": len(idx.rows), "domains": len(doms), "vision": vcount,
            "auto_rate": auto, "domain_list": doms,
            "vision_backend": vlm_bridge.backend_status(),
            "provider": _provider(), "docx": _HAS_DOCX}


# ─────────────────────────────────────────── 공공데이터 연계(지도/통계)
_DJ_GU_NAME = {"30110": "동구", "30140": "중구", "30170": "서구",
               "30200": "유성구", "30230": "대덕구"}


def _read_csv(name):
    path = os.path.join(HRAG, "data", "raw", name)
    if not os.path.exists(path):
        return []
    with open(path, encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def geo_payload(region: str = "유성구") -> dict:
    road = _read_csv("daejeon_road_status.csv")       # 자치구별 좌표/도로연장/포장률
    vis = _read_csv("vision_detections.csv")          # 비전 탐지 포인트(좌표)
    air = _read_csv("airquality.csv")

    districts = []
    for r in road:
        try:
            districts.append({
                "name": r.get("자치구"), "lat": float(r.get("위도")), "lng": float(r.get("경도")),
                "road_km": float(r.get("도로연장_km") or 0), "pave": float(r.get("포장률") or 0),
                "pothole": 0, "crack": 0})
        except Exception:
            continue

    points = []
    for v in vis:
        try:
            lat, lng = float(v.get("위도")), float(v.get("경도"))
        except Exception:
            continue
        cls = v.get("detected_class")
        points.append({"lat": lat, "lng": lng, "cls": cls,
                       "conf": float(v.get("confidence") or 0), "road": v.get("도로명")})
        # 최근접 자치구로 공간 조인
        if districts:
            d0 = min(districts, key=lambda d: (d["lat"]-lat)**2 + (d["lng"]-lng)**2)
            if cls == "pothole":
                d0["pothole"] += 1
            elif cls == "crack":
                d0["crack"] += 1

    ranking = sorted(districts, key=lambda d: (d["pothole"], d["crack"]), reverse=True)
    # 대전 대기질
    dj_air = next((a for a in air if (a.get("시도") or "").startswith("대전")), {})
    pm25 = float(dj_air.get("PM25") or 0) if dj_air else 0
    air_label = "좋음" if pm25 <= 15 else ("보통" if pm25 <= 35 else "나쁨")

    sel = next((d for d in districts if d["name"] == region), districts[0] if districts else {})
    lats = [d["lat"] for d in districts] or [36.35]
    lngs = [d["lng"] for d in districts] or [127.4]
    bounds = {"minLat": min(lats)-0.02, "maxLat": max(lats)+0.02,
              "minLng": min(lngs)-0.03, "maxLng": max(lngs)+0.03}
    return {"districts": districts, "points": points, "ranking": ranking[:5],
            "selected": sel, "city_air": {"pm25": pm25, "pm10": float(dj_air.get("PM10") or 0),
                                          "label": air_label},
            "bounds": bounds, "region": region}


# ─────────────────────────────────────────── 업무 자동화(오케스트레이션)
def automation_payload(question: str) -> dict:
    region = (agent.analyze_intent(question).get("region") or "유성구").replace("대전광역시 ", "")
    vision = _vision_summary(question or f"{region} 포트홀 찾아줘") or {"count": 0, "severe": 0}
    geo = geo_payload(region if region in _DJ_GU_NAME.values() else "유성구")
    top = geo["ranking"][0] if geo["ranking"] else {"name": region, "pothole": 0}
    steps = [
        {"n": 1, "title": "포트홀 탐지 결과 검수",
         "detail": f"비전 탐지 {vision['count']}건 중 심각 {vision['severe']}건 우선 확인",
         "tool": "VLM 탐지 → 데이터 관리(검수)", "target": "manage"},
        {"n": 2, "title": "공공 통계 대조",
         "detail": f"{top['name']} 등 자치구 포트홀·교통/노면 통계 교차 분석",
         "tool": "하이브리드 RAG · aggregate", "target": "public"},
        {"n": 3, "title": "우선 보수 구간 선정",
         "detail": "심각도·탐지건수·도로연장 가중 점수로 우선순위 산정",
         "tool": "공간 조인 · 랭킹", "target": "public"},
        {"n": 4, "title": "보수 요청 보고서 생성",
         "detail": ".docx 자동 작성 — 개요·탐지현황·공공데이터·통계·제언",
         "tool": "보고서 생성(report)", "target": "report"},
    ]
    return {"title": f"{region} 포트홀 대응", "region": region,
            "vision": vision, "ranking": geo["ranking"][:4], "steps": steps}


# ─────────────────────────────────────────── HTTP 핸들러
class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _send(self, code, body, ctype="application/json; charset=utf-8"):
        data = body if isinstance(body, (bytes, bytearray)) else \
            json.dumps(body, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _file(self, path, ctype):
        with open(path, "rb") as f:
            self._send(200, f.read(), ctype)

    def do_GET(self):
        u = urlparse(self.path)
        p, qs = u.path, parse_qs(u.query)
        if p in ("/", "/index.html"):
            return self._file(os.path.join(WEB, "index.html"), "text/html; charset=utf-8")
        if p == "/api/overview":
            return self._send(200, overview_payload())
        if p == "/api/domains":
            return self._send(200, get_idx().domains())
        if p == "/api/samples":
            names = [n for n in sorted(os.listdir(SAMPLES))
                     if n.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))] \
                if os.path.isdir(SAMPLES) else []
            return self._send(200, {"samples": names})
        if p.startswith("/samples/"):
            from urllib.parse import unquote
            name = os.path.basename(unquote(p))
            fp = os.path.join(SAMPLES, name)
            if os.path.exists(fp):
                ext = name.lower().rsplit(".", 1)[-1]
                ct = {"jpg": "image/jpeg", "jpeg": "image/jpeg",
                      "png": "image/png", "webp": "image/webp"}.get(ext, "application/octet-stream")
                return self._file(fp, ct)
            return self._send(404, {"error": "not found"})
        if p.startswith("/fonts/"):
            name = os.path.basename(p)
            fp = os.path.join(WEB, "fonts", name)
            if os.path.exists(fp):
                return self._file(fp, "font/woff2")
            return self._send(404, {"error": "not found"})
        if p == "/api/geo":
            return self._send(200, geo_payload((qs.get("region") or ["유성구"])[0]))
        if p == "/api/history":
            return self._send(200, agent.history(get_idx(), 30))
        if p == "/api/docs":
            status = (qs.get("status") or [None])[0]
            domain = (qs.get("domain") or [None])[0]
            return self._send(200, {"counts": review_mod.status_counts(),
                                    "docs": review_mod.list_docs(status, domain, limit=300)})
        if p == "/api/changelog":
            return self._send(200, review_mod.recent_changes(50))
        if p == "/download/report":
            if not os.path.exists(REPORT_PATH):
                return self._send(404, {"error": "보고서가 아직 생성되지 않았습니다."})
            with open(REPORT_PATH, "rb") as f:
                body = f.read()
            self.send_response(200)
            self.send_header("Content-Type",
                             "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
            self.send_header("Content-Disposition", 'attachment; filename="report.docx"')
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            return self.wfile.write(body)
        return self._send(404, {"error": "not found"})

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        try:
            payload = json.loads(self.rfile.read(length) or b"{}")
        except json.JSONDecodeError:
            return self._send(400, {"error": "invalid json"})
        p = urlparse(self.path).path

        if p == "/api/detect":
            return self._detect(payload)
        if p == "/api/review":
            doc_id = (payload.get("doc_id") or "").strip()
            status = (payload.get("status") or "").strip()
            if not doc_id or not status:
                return self._send(400, {"error": "doc_id, status 필요"})
            return self._send(200, review_mod.set_status(doc_id, status, payload.get("note") or "UI 검수"))
        if p == "/api/automation":
            return self._send(200, automation_payload((payload.get("question") or "").strip()))

        question = (payload.get("question") or "").strip()
        if not question:
            return self._send(400, {"error": "question 필요"})
        if p == "/api/ask":
            return self._send(200, ask_payload(question))
        if p == "/api/report":
            return self._report(question, payload.get("sections"))
        return self._send(404, {"error": "not found"})

    def _detect(self, payload):
        tmp = None
        try:
            sample = (payload.get("sample") or "").strip()
            if sample:
                path = os.path.join(SAMPLES, os.path.basename(sample))
                if not os.path.exists(path):
                    return self._send(400, {"error": "샘플을 찾을 수 없습니다."})
            elif payload.get("image_b64"):
                raw = payload["image_b64"].split(",", 1)[-1]
                data = base64.b64decode(raw)
                tf = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
                tf.write(data)
                tf.close()
                path = tf.name
                tmp = path
            else:
                return self._send(400, {"error": "이미지를 올려주세요."})
            res = vlm_bridge.detect(path, query=payload.get("query") or "포트홀 찾아줘",
                                    detector=payload.get("detector") or "mock",
                                    conf=float(payload.get("conf") or 0.25))
            if sample:
                res["sample_url"] = "/samples/" + sample
            return self._send(200, res)
        except Exception as e:
            return self._send(500, {"error": str(e)})
        finally:
            if tmp:
                try:
                    os.unlink(tmp)
                except Exception:
                    pass

    def _report(self, question, sections):
        if not _HAS_DOCX:
            return self._send(200, {"error": "python-docx 미설치 — 'pip install python-docx' 후 사용 가능",
                                    "download": None})
        try:
            path = report_mod.generate_report(question, get_idx(), REPORT_PATH)
            return self._send(200, {"path": os.path.basename(path), "download": "/download/report"})
        except Exception as e:
            return self._send(500, {"error": str(e)})


def main(port: int = 8000):
    print("=" * 60)
    print(" 지능형 정보 시스템 · 융합 데모 (VLM × 하이브리드 RAG × 에이전트)")
    print("=" * 60)
    ensure_db()
    get_idx()
    vb = vlm_bridge.backend_status()
    print(f"  · 비전 백엔드 : {'실제 VLM 패키지' if vb['vlm_package'] else '내장 폴백(mock)'}")
    print(f"  · LLM 라우터  : {_provider()}")
    print(f"  · 보고서(.docx): {'사용 가능' if _HAS_DOCX else '미설치(python-docx)'}")
    srv = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"\n  ▶  http://localhost:{port}   (Ctrl+C 종료)\n")
    srv.serve_forever()


if __name__ == "__main__":
    main(int(sys.argv[1]) if len(sys.argv) > 1 else 8000)
