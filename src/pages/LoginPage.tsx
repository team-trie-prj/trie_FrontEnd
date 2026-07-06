import { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Spinner from '@/components/common/Spinner';
import { KAKAO_CLIENT_ID, KAKAO_REDIRECT_URI, USE_MOCK } from '@/api/config';
import { ROUTES } from '@/constants/navigation';
import { useAuthActions, useAuthStatus } from '@/stores/authStore';

/** 이미 교환을 시도한 인가 코드 — StrictMode 이중 실행·중복 제출로 같은 code가
 *  두 번 서버에 가는 것을 차단 (동일 code 재사용은 어차피 무효) */
let consumedAuthCode: string | null = null;

/** FNC-AUTH-01 · 로그인 화면 — 카카오 로그인으로 토큰 발급 */
export default function LoginPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const status = useAuthStatus();
  const { loginWithKakao } = useAuthActions();

  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.search;

  useEffect(() => {
    const code = params.get('code');
    if (!code || code === consumedAuthCode) return;
    consumedAuthCode = code;
    void loginWithKakao(code).then((ok) =>
      // 실패 시 ?code 제거 — 만료된 인가 코드로 재시도하는 루프 방지
      navigate(ok ? from : ROUTES.login, { replace: true }),
    );
  }, [params, loginWithKakao, navigate, from]);

  const onKakaoClick = async () => {
    // mock 모드이거나, 실서버 모드라도 카카오 키 미설정이면 백엔드 mock 로그인으로 우회
    if (USE_MOCK || !KAKAO_CLIENT_ID) {
      const ok = await loginWithKakao(USE_MOCK ? 'mock-code' : 'local-dev-code');
      if (ok) navigate(from, { replace: true });
      return;
    }
    const url = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}&response_type=code`;
    window.location.assign(url);
  };

  return (
    <div className="relative flex h-screen flex-col items-center justify-center overflow-x-hidden bg-black px-4">
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-[28.75rem] w-[62.5rem] -translate-x-1/2"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,255,255,.07), rgba(255,255,255,0) 70%)',
        }}
      />
      <img src="/logo.svg" alt="TRIE 로고" width={64} height={64} className="mb-6" />
      <div className="mb-[1.125rem] text-[0.8125rem] tracking-[.16em] text-mut3">
        TRIE · 지능형 정보 시스템
      </div>
      <h1 className="text-center text-[2.75rem] font-light leading-[1.15] tracking-[-.03em] max-[520px]:text-[1.875rem]">
        무엇이든 <b className="font-medium">분석</b>할 준비
      </h1>
      <p className="mt-4 max-w-[27.5rem] text-center text-base leading-[1.65] text-mut">
        카카오 계정으로 로그인하면 멀티모달 검색, 보고서 생성, 데이터 관리 기능을 사용할 수
        있습니다.
      </p>
      <button
        onClick={onKakaoClick}
        disabled={status === 'authenticating'}
        className="mt-9 inline-flex h-[3.25rem] items-center gap-2.5 rounded-[1.625rem] bg-kakao px-8 text-[0.9375rem] font-semibold text-[#191919] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === 'authenticating' ? (
          <Spinner />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#191919">
            <path d="M12 3C6.48 3 2 6.58 2 11c0 2.84 1.87 5.33 4.68 6.74l-.95 3.52c-.08.31.27.56.54.38l4.18-2.77c.51.06 1.03.13 1.55.13 5.52 0 10-3.58 10-8S17.52 3 12 3z" />
          </svg>
        )}
        카카오 로그인
      </button>
      {status === 'error' && (
        <p className="mt-5 max-w-[30rem] text-center text-xs leading-[1.7] text-danger">
          로그인에 실패했습니다 — 백엔드 서버(127.0.0.1:8000) 기동 여부를 확인하세요.
          <br />
          VITE_API_BASE_URL은 비워두어야 프록시(CORS 우회)로 연결됩니다.
        </p>
      )}
      {USE_MOCK ? (
        <p className="mt-5 text-xs text-mut4">
          현재 mock 모드 — 백엔드 연동 전까지 클릭 시 바로 로그인됩니다.
        </p>
      ) : (
        !KAKAO_CLIENT_ID && (
          <p className="mt-5 text-xs text-mut4">
            카카오 키 미설정 — 클릭 시 백엔드 mock 계정으로 로그인됩니다 (카카오 제외 테스트).
          </p>
        )
      )}
    </div>
  );
}
