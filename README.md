<p align="center">
  <img src="public/logo.svg" width="72" alt="TRIE 로고" />
</p>

<h1 align="center">TRIE · 지능형 정보 시스템 — Frontend</h1>

<p align="center">
  VLM 비전 · 하이브리드 RAG · AI 에이전트를 하나로 통합한<br/>
  생성형 AI 기반 지능형 정보 시스템의 <b>프론트엔드(Web UI)</b> 저장소입니다.
</p>

## 프로젝트 소개

TRIE는 도로·안전·교통 분야 실무자를 위한 지능형 정보 시스템입니다.
자연어 질의와 현장 이미지를 함께 입력하면 AI 에이전트가 최적의 검색 방식을 스스로 결정하고,
사내 지침서(Vector DB)와 공공데이터포털 API를 융합 탐색(하이브리드 RAG)한 뒤,
그 근거를 바탕으로 결재 가능한 실무 보고서까지 자동 작성합니다.

시스템은 세 파트로 구성되며, **이 저장소는 그중 프론트엔드**를 담당합니다.

| 파트 | 역할 | 저장소 |
|---|---|---|
| **Frontend (본 저장소)** | 사용자 화면 전체 — 검색·결과 시각화·보고서 편집·데이터/API 관리 | trie_FrontEnd |
| Backend | 인증(JWT), LLM 에이전트 라우팅, 하이브리드 RAG 파이프라인, 공공데이터 호출, 문서 파싱·임베딩 | 별도 저장소 |
| AI/Infra | VLM(이미지 분석)·YOLO, BGE-m3 임베딩, ChromaDB·PostgreSQL (오렌지파이 5 Plus 엣지 서버) | 별도 저장소 |

## 주요 기능 (기능 명세 매핑)

| 화면 (라우트) | 기능 | 명세 ID |
|---|---|---|
| 로그인 `/login` | 카카오 OAuth 로그인, 토큰 발급·만료 시 자동 재발급 | FNC-AUTH-01 |
| 통합 검색 `/` | 텍스트+이미지 멀티모달 질의, 이미지 리사이징·5MB 검증, 모호 질의 시 맞춤 템플릿 역제안, VLM 지연 시 텍스트 단독 전환 확인 | FNC-SRC-01·02 |
| 검색 결과 `/results` | 출처별 카드·아코디언, 원본 출처(Citation) 배지와 근거 스니펫 팝업, 공공 통계 차트/표 시각화 | FNC-SRC-03 · FNC-VIW-01·02 |
| 데이터 관리 `/data` | 사내 문서(PDF/DOCX) 드래그 앤 드롭 업로드(≤20MB), 파싱→임베딩 진행 표시, 지식 베이스 적재 현황 | FNC-DAT-01·02 |
| API 관리 `/catalog` | 공공데이터 API 등록+연동 테스트, 등록 목록 검색 | FNC-PUB-01 |
| 보고서 뷰어 `/report` | 근거 세션 선택(모달) → 실무 양식 초안 스트리밍 생성 → 위지윅 편집(서식 툴바) → PDF/DOCX 내보내기 | FNC-REP-01·02 |
| 히스토리 (사이드바) | 과거 검색 세션 목록(최대 50, FIFO), 클릭 시 캐시 충돌 없는 세션 복원 | FNC-HIS-01 |

접근 제어: 전 화면 로그인 필수, `/data`·`/catalog`는 관리자·실무자 권한 전용(RBAC).

## 기술 스택

| 구분 | 기술 |
|---|---|
| Language / Framework | TypeScript · React 18 |
| Build / Routing | Vite · React Router |
| State | Zustand (기능별 slice, atomic selector 훅 패턴) |
| Styling | TailwindCSS (데모 버전 다크 테마 디자인 토큰 유지) |
| Editor / Chart | TipTap (위지윅) · Recharts |
| Export | docx(.docx 빌드) · html2pdf.js(PDF) — 클릭 시 지연 로드 |
| Quality | ESLint · Prettier · Vitest (단위 테스트 21건) |

## 시작하기

```bash
npm install
cp .env.example .env   # 환경변수 설정
npm run dev            # http://localhost:5173
```

`VITE_USE_MOCK=true`(기본값)면 백엔드 없이 mock 데이터로 전체 플로우가 동작합니다.

| 스크립트 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 타입체크 + 프로덕션 빌드 |
| `npm test` | 단위 테스트 |
| `npm run lint` / `format` | 린트 / 포맷 |

## 프로젝트 구조

```
src/
├── api/          # 서버 통신 레이어 — endpoints.ts(경로 상수), client.ts(공통 래퍼), 도메인별 *Api.ts
├── stores/       # Zustand 스토어 (auth/search/result/upload/catalog/report/history/ui)
├── pages/        # 라우트 단위 화면 6종
├── components/   # 공통(common/layout) + 도메인별(search/results/data/catalog/report/history)
├── types/        # 명세 기반 도메인 타입
├── mocks/        # 백엔드 미연동 시 사용하는 mock 데이터
├── utils/        # 검증·리사이징·마크다운·내보내기 유틸
└── constants/    # 라우트·네비게이션·보고서 양식
```

설계 원칙: 파일당 100줄 이내 분해 · 스토어는 상태/액션 분리 후 selector 훅만 공개 ·
API 경로는 `endpoints.ts` 한 파일에 집중(명세 확정 시 이 파일만 교체).

## 백엔드 연동 가이드

1. `src/api/endpoints.ts`의 placeholder 경로를 실제 명세로 교체
2. 각 `src/api/*Api.ts`의 요청/응답 필드 조정 (`TODO` 주석 표시)
3. `.env`에서 `VITE_USE_MOCK=false`, `VITE_API_BASE_URL`, 카카오 키 설정

공통 규칙(`client.ts`): Bearer 토큰 자동 부착, 401 시 Refresh 재발급 후 1회 재시도,
매 호출 고유 `X-Session-Id`(UUID)와 `Cache-Control: no-cache` 강제 —
데모 버전의 캐시 동일결과 반복 결함을 아키텍처 레벨에서 차단합니다(FNC-SRC-03).

## 배포 참고 (폐쇄망)

인터넷 불가 환경을 전제로 폰트·아이콘을 CDN 없이 번들에 포함(self-host)했습니다.
카카오 로그인은 외부 통신이 필요하므로 폐쇄망 배포 시 인증 방식 협의가 필요합니다
(`docs/팀_확인_요청_2026-07-02.md` 참조).

## 참고 자료

- `기능 명세서.txt` — 화면·기능의 근거가 되는 기능 명세 (FNC-*)
- `/demo` — 디자인 원본인 데모 버전 (Flask + 바닐라 JS, 참고용)
- `docs/` — 팀 확인 요청 등 협업 문서
