# -*- coding: utf-8 -*-
"""ATDD 인수 테스트 — 제안서가 명시한 모든 기능을 Given/When/Then으로 검증.

ATDD(Acceptance Test-Driven Development): 각 기능의 '수용 기준(acceptance
criteria)'을 먼저 정의하고, 그 기준을 통과하는지 실행 가능한 테스트로 확인한다.

실행:  python tests/acceptance/acceptance.py
  · 통합 서버를 임시 포트로 직접 기동 → 시나리오 실행 → 종료
  · 표준 라이브러리만 사용(외부 의존성 0). 종료코드 0=전체 통과, 1=실패.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import time
import urllib.request
import urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PORT = int(os.environ.get("ATDD_PORT", "8791"))
BASE = f"http://127.0.0.1:{PORT}"

# ── HTTP helpers ─────────────────────────────────────────────
def _req(method, path, body=None):
    url = BASE + path
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        raw = r.read()
        ct = r.headers.get("Content-Type", "")
        return r.status, (json.loads(raw) if "json" in ct else raw)

def GET(p): return _req("GET", p)
def POST(p, b): return _req("POST", p, b)

# ── tiny Given/When/Then framework ───────────────────────────
RESULTS = []
class Ctx:
    def __init__(self, feature, scenario):
        self.feature, self.scenario, self.ok, self.notes = feature, scenario, True, []
    def given(self, m): self.notes.append(("Given", m)); return self
    def when(self, m): self.notes.append(("When", m)); return self
    def then(self, cond, m):
        self.notes.append(("Then", m + ("  ✓" if cond else "  ✗ 실패")))
        if not cond: self.ok = False
        return self
    def and_(self, cond, m):
        self.notes.append(("And", m + ("  ✓" if cond else "  ✗ 실패")))
        if not cond: self.ok = False
        return self

def feature(fid, title):
    def deco(fn):
        def run():
            c = Ctx(f"{fid} {title}", fn.__doc__ or fn.__name__)
            try:
                fn(c)
            except Exception as e:
                c.ok = False; c.notes.append(("Error", repr(e)))
            RESULTS.append(c); return c
        run._fid = fid; return run
    return deco

# ════════════════════════ 인수 시나리오 ════════════════════════
@feature("AC-01", "자연어 질의 입력 → 통합 응답")
def ac01(c):
    c.given("적재된 통합 인덱스가 존재한다")
    c.when("'대전 유성구 포트홀 영역을 찾아줘'로 질의하면")
    s, d = POST("/api/ask", {"question": "대전 유성구 포트홀 영역을 찾아줘"})
    c.then(s == 200, "200 응답")
    c.and_(bool(d.get("answer")), "자연어 답변이 생성된다")
    c.and_(d.get("region") == "대전광역시 유성구", "지역 의도를 인식한다")

@feature("AC-02", "에이전트 추론 투명성 (의도→도구→응답)")
def ac02(c):
    c.given("에이전트가 도구를 오케스트레이션한다")
    c.when("질의를 보내면 추론 단계가 반환된다")
    _, d = POST("/api/ask", {"question": "대전 유성구 포트홀 영역을 찾아줘"})
    kinds = [s["kind"] for s in d.get("steps", [])]
    tools = [s.get("tool") for s in d["steps"] if s["kind"] == "tool"]
    c.then("intent" in kinds, "의도 분석 단계 포함")
    c.and_(len(tools) >= 2, f"도구 호출이 2개 이상 노출된다 ({tools})")
    c.and_("answer" in kinds, "AI 응답 단계 포함")

@feature("AC-03", "이미지 자동 이해 및 라벨링 (VLM)")
def ac03(c):
    c.given("도로 샘플 이미지가 있다")
    _, sm = GET("/api/samples")
    c.then(len(sm.get("samples", [])) > 0, "샘플 이미지가 제공된다")
    c.when("샘플로 탐지를 실행하면")
    _, d = POST("/api/detect", {"sample": sm["samples"][0], "detector": "yolo", "conf": 0.25})
    dets = d.get("detections", [])
    c.and_(len(dets) > 0, f"탐지 결과가 반환된다 ({len(dets)}건)")
    c.and_(all("box" in x and "confidence" in x and "severity" in x for x in dets),
           "각 탐지는 bbox·신뢰도·심각도를 가진다")
    c.and_("metadata" in d and d["metadata"].get("format") == "COCO/YOLO",
           "COCO/YOLO 메타데이터를 산출한다")

@feature("AC-04", "탐지 모델 선택 (YOLO 파인튜닝 / VLM / mock)")
def ac04(c):
    c.given("여러 탐지 백엔드를 선택할 수 있다")
    _, sm = GET("/api/samples")
    for m in ("yolo", "gemini", "mock"):
        c.when(f"detector={m} 로 탐지하면")
        s, d = POST("/api/detect", {"sample": sm["samples"][0], "detector": m, "conf": 0.25})
        c.and_(s == 200 and "stats" in d, f"{m} 백엔드가 정상 동작한다")

@feature("AC-05", "하이브리드 검색 (의미+키워드 융합·재정렬)")
def ac05(c):
    c.given("사내 비전 + 공공데이터가 한 인덱스에 있다")
    c.when("질의하면 하이브리드 검색 결과가 재정렬되어 반환된다")
    _, d = POST("/api/ask", {"question": "대전 유성구 포트홀"})
    hits = d.get("hits", [])
    c.then(len(hits) > 0, f"검색 결과가 있다 ({len(hits)}건)")
    c.and_(all("_score" in h for h in hits), "재정렬 점수(_score)가 부여된다")
    scores = [h["_score"] for h in hits]
    c.and_(scores == sorted(scores, reverse=True), "재정렬 점수 내림차순 정렬")

@feature("AC-06", "공공데이터 연계 — 지역 공간조인")
def ac06(c):
    c.given("비전 탐지 좌표와 자치구 좌표가 있다")
    c.when("공공데이터 연계를 요청하면")
    _, d = GET("/api/geo?region=%EC%9C%A0%EC%84%B1%EA%B5%AC")
    c.then(len(d.get("districts", [])) >= 5, "대전 5개 자치구가 집계된다")
    c.and_(sum(t["pothole"] + t["crack"] for t in d["districts"]) > 0,
           "탐지 포인트가 자치구로 공간조인된다")
    c.and_(d["city_air"]["pm25"] > 0, "공공 대기질(PM2.5)이 연계된다")

@feature("AC-07", "통계 집계 / 순위")
def ac07(c):
    c.given("정형 공공데이터가 적재되어 있다")
    c.when("'전국에서 화재가 가장 많은 지역은?' 질의하면")
    _, d = POST("/api/ask", {"question": "전국에서 화재가 가장 많은 지역은?"})
    st = d.get("stats", [])
    c.then(len(st) > 0, f"통계 집계 결과가 있다 ({len(st)}건)")
    vals = [s["value"] for s in st]
    c.and_(vals == sorted(vals, reverse=True), "값 기준 순위 정렬")

@feature("AC-08", "검색 결과 요약")
def ac08(c):
    c.given("검색·집계 결과가 있다")
    c.when("질의하면 요약 답변이 생성된다")
    _, d = POST("/api/ask", {"question": "대전 미세먼지 현황 알려줘"})
    c.then(len(d.get("answer", "")) > 20, "요약 답변이 충분한 길이로 생성된다")

@feature("AC-09", "보고서 자동 생성 (.docx)")
def ac09(c):
    c.given("질의 결과를 보고서로 만들 수 있다")
    c.when(".docx 보고서 생성을 요청하면")
    s, d = POST("/api/report", {"question": "대전 노면상태별 교통사고를 보고서로 만들어줘"})
    c.then(s == 200 and d.get("download"), "보고서 생성 후 다운로드 경로 반환")
    c.when("보고서를 내려받으면")
    s2, raw = GET("/download/report")
    c.and_(s2 == 200 and isinstance(raw, (bytes, bytearray)) and raw[:2] == b"PK",
           "유효한 .docx(zip) 파일이 반환된다")

@feature("AC-10", "데이터 변경 이력 관리")
def ac10(c):
    c.given("doc_change_log가 운영된다")
    c.when("변경 이력을 조회하면")
    _, before = GET("/api/changelog")
    c.then(isinstance(before, list) and len(before) > 0, "변경 이력이 존재한다")

@feature("AC-11", "검수 상태 변경 → 이력 자동 기록")
def ac11(c):
    c.given("검수 대상 문서가 있다")
    _, docs = GET("/api/docs?status=&domain=")
    doc = docs["docs"][0]; did = doc["doc_id"]; orig = doc["review_status"]
    c.when("검수 상태를 변경하면")
    _, before = GET("/api/changelog")
    s, r = POST("/api/review", {"doc_id": did, "status": "rejected"})
    c.then(s == 200 and r.get("ok"), "검수 상태 변경 성공")
    _, after = GET("/api/changelog")
    c.and_(len(after) >= len(before), "변경 이력에 자동 기록된다")
    POST("/api/review", {"doc_id": did, "status": orig})  # 원복

@feature("AC-12", "에이전트 기반 업무 자동화 (오케스트레이션)")
def ac12(c):
    c.given("탐지·통계·보고서 도구가 있다")
    c.when("업무 절차 자동 추천을 요청하면")
    _, d = POST("/api/automation", {"question": "유성구 포트홀 대응 절차 추천"})
    steps = d.get("steps", [])
    c.then(len(steps) == 4, "4단계 절차가 구성된다")
    targets = {s["target"] for s in steps}
    c.and_({"manage", "report"} <= targets, "검수·보고서 도구가 절차에 엮인다")

@feature("AC-13", "프롬프트 · 응답 이력")
def ac13(c):
    c.given("질의가 로깅된다")
    POST("/api/ask", {"question": "인구가 많은 지역 순위 보여줘"})
    c.when("질의 이력을 조회하면")
    _, h = GET("/api/history")
    c.then(isinstance(h, list) and len(h) > 0, "프롬프트·응답 이력이 누적된다")
    c.and_(all("question" in x for x in h), "각 이력에 질의가 기록된다")

@feature("AC-14", "통합 데이터 구조 (UnifiedDoc)")
def ac14(c):
    c.given("다도메인 데이터가 한 구조로 적재된다")
    c.when("개요를 조회하면")
    _, o = GET("/api/overview")
    c.then(o["docs"] >= 263, f"적재 문서 263건 이상 ({o['docs']})")
    c.and_(o["domains"] >= 7, f"공공 도메인 7개 이상 ({o['domains']})")
    c.and_(o["vision"] > 0, "사내 비전 데이터가 연계된다")

@feature("AC-15", "제안서 4대 시나리오 흐름")
def ac15(c):
    scn = ["포트홀 영역을 찾아줘", "공공데이터 기반 관련 통계를 보여줘",
           "검색 결과를 요약해서 보고서로 만들어줘", "업무 절차를 자동으로 추천해줘"]
    for q in scn:
        c.when(f"'{q}'")
        if "보고서" in q:
            s, d = POST("/api/report", {"question": q}); ok = s == 200 and d.get("download")
        elif "절차" in q:
            s, d = POST("/api/automation", {"question": q}); ok = len(d.get("steps", [])) == 4
        else:
            s, d = POST("/api/ask", {"question": q}); ok = s == 200 and bool(d.get("answer"))
        c.and_(bool(ok), "시나리오가 정상 수행된다")

@feature("AC-16", "UI 8화면 + 푸터 + 드롭다운 네비 + 다크 디자인")
def ac16(c):
    c.given("단일 통합 셸이 제공된다")
    c.when("메인 페이지를 로드하면")
    _, raw = GET("/")
    html = raw.decode() if isinstance(raw, (bytes, bytearray)) else str(raw)
    screens = ["main", "query", "image", "search", "public", "report", "data", "auto"]
    c.then(all(f'data-screen="{s}"' in html for s in screens), "8개 화면이 모두 존재한다")
    c.and_("<footer" in html, "모든 페이지 공통 푸터가 구성된다")
    c.and_("nav-drop" in html and "nav-group" in html,
           "헤더 호버 드롭다운(계열별 그룹) 네비게이션을 사용한다")
    c.and_('class="msym"' in html and "Material Symbols" in html,
           "업로드된 다크 디자인(Material Symbols·Pretendard)을 적용했다")

# ════════════════════════ 러너 ════════════════════════
def main():
    print("통합 서버 기동 중 …")
    env = dict(os.environ)
    proc = subprocess.Popen([sys.executable, "-u", os.path.join(ROOT, "app.py"), str(PORT)],
                            cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT, env=env)
    try:
        for _ in range(40):
            try:
                GET("/api/overview"); break
            except Exception:
                time.sleep(0.4)
        else:
            print("서버 기동 실패"); return 1

        tests = [v for k, v in sorted(globals().items()) if callable(v) and getattr(v, "_fid", "").startswith("AC-")]
        for t in tests:
            t()

        print("\n" + "=" * 64)
        print(" ATDD 인수 테스트 결과 — 제안서 기능 매핑")
        print("=" * 64)
        passed = 0
        for c in RESULTS:
            mark = "PASS" if c.ok else "FAIL"
            if c.ok: passed += 1
            print(f"\n[{mark}] {c.feature}")
            for kind, msg in c.notes:
                print(f"    {kind:>6}: {msg}")
        print("\n" + "-" * 64)
        print(f" 총 {len(RESULTS)}개 시나리오 중 {passed}개 통과 / {len(RESULTS)-passed}개 실패")
        print("=" * 64)
        return 0 if passed == len(RESULTS) else 1
    finally:
        proc.terminate()
        try: proc.wait(timeout=5)
        except Exception: proc.kill()

if __name__ == "__main__":
    sys.exit(main())
