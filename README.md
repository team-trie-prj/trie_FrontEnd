# trie_FrontEnd · TRIE 지능형 정보 시스템

기능 명세서 기반 프론트엔드. 데모 버전(`/demo`)의 다크 테마 디자인을 유지하며 재구축했다.

## 기술 스택

TypeScript · React 18 · Vite · TailwindCSS · Zustand · React Router · Recharts · ESLint/Prettier

## 실행

```bash
npm install
cp .env.example .env   # 환경변수 설정
npm run dev
```

`VITE_USE_MOCK=true`(기본)면 백엔드 없이 mock 데이터로 전체 플로우가 동작한다.

## 화면 ↔ 기능 명세 매핑

| 라우트 | 화면 | 기능 ID |
|---|---|---|
| /login | 로그인 | FNC-AUTH-01 |
| / | 통합 검색 | FNC-SRC-01, FNC-SRC-02 |
| /results | 검색 결과 | FNC-SRC-03, FNC-VIW-01, FNC-VIW-02 |
| /data | 데이터 관리 | FNC-DAT-01, FNC-DAT-02 |
| /catalog | API 관리 | FNC-PUB-01 |
| /report | 보고서 뷰어 | FNC-REP-01, FNC-REP-02 |
| (사이드바) | 히스토리 | FNC-HIS-01 |

## 백엔드 연동 (API 명세서 확정 후)

1. `src/api/endpoints.ts` — 실제 경로로 교체 (이 파일만 수정하면 됨)
2. `src/api/*Api.ts` — 요청/응답 필드를 명세에 맞게 조정 (`// TODO` 표시)
3. `.env` — `VITE_USE_MOCK=false`, `VITE_API_BASE_URL`, 카카오 키 설정

공통 규칙은 `src/api/client.ts`에 구현: Bearer 토큰 자동 부착 + 401 시 Refresh 재발급
1회 재시도, 매 호출 고유 `X-Session-Id`(UUID), `Cache-Control: no-cache` 강제 —
데모의 캐시 동일결과 반복 결함을 아키텍처 레벨에서 차단(FNC-SRC-03).

## 구조 원칙

- 파일당 100줄 이내로 컴포넌트 분해
- Zustand: 기능별 스토어 분리(slice), 상태/액션 네임스페이스 분리,
  atomic selector 훅만 export (스토어 자체는 비공개) → 불필요한 리렌더링 방지
- 디자인 토큰은 `tailwind.config.js` + `src/styles/global.css` (데모와 동일 값)
- RBAC: `/data`, `/catalog`는 관리자·실무자 전용 (`RequireRole`)
