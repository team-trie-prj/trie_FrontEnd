import { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Spinner from '@/components/common/Spinner';
import { KAKAO_CLIENT_ID, KAKAO_REDIRECT_URI, USE_MOCK } from '@/api/config';
import { ROUTES } from '@/constants/navigation';
import { useAuthActions, useAuthStatus } from '@/stores/authStore';

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
    if (code) void loginWithKakao(code).then((ok) => ok && navigate(from, { replace: true }));
  }, [params, loginWithKakao, navigate, from]);

  const onKakaoClick = async () => {
    if (USE_MOCK) {
      const ok = await loginWithKakao('mock-code');
      if (ok) navigate(from, { replace: true });
      return;
    }
    const url = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}&response_type=code`;
    window.location.assign(url);
  };

  return (
    <div className="relative flex h-screen flex-col items-center justify-center bg-black">
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-[460px] w-[1000px] -translate-x-1/2"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,255,255,.07), rgba(255,255,255,0) 70%)',
        }}
      />
      <img src="/logo.svg" alt="TRIE 로고" width={64} height={64} className="mb-6" />
      <div className="mb-[18px] text-[13px] tracking-[.16em] text-mut3">
        TRIE · 지능형 정보 시스템
      </div>
      <h1 className="text-center text-[44px] font-light leading-[1.1] tracking-[-.03em]">
        무엇이든 <b className="font-medium">분석</b>할 준비
      </h1>
      <p className="mt-4 max-w-[440px] text-center text-base leading-[1.65] text-mut">
        카카오 계정으로 로그인하면 멀티모달 검색, 보고서 생성, 데이터 관리 기능을 사용할 수
        있습니다.
      </p>
      <button
        onClick={onKakaoClick}
        disabled={status === 'authenticating'}
        className="mt-9 inline-flex h-[52px] items-center gap-2.5 rounded-[26px] bg-kakao px-8 text-[15px] font-semibold text-[#191919] transition-opacity hover:opacity-90 disabled:opacity-50"
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
      {USE_MOCK && (
        <p className="mt-5 text-xs text-mut4">
          현재 mock 모드 — 백엔드 연동 전까지 클릭 시 바로 로그인됩니다.
        </p>
      )}
    </div>
  );
}
