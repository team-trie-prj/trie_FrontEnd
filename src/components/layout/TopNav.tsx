import { useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import NavDropdown from './NavDropdown';
import Icon from '@/components/common/Icon';
import { NAV_GROUPS, ROUTES } from '@/constants/navigation';
import { useIsAuthenticated, useUser, useAuthActions } from '@/stores/authStore';
import { useUiActions } from '@/stores/uiStore';

/** 데모 상단 네비(70px, 블러 배경) 유지 + 히스토리·인증 버튼 추가 */
export default function TopNav() {
  const navigate = useNavigate();
  const isAuthed = useIsAuthenticated();
  const user = useUser();
  const { logout } = useAuthActions();
  const { toggleSidebar } = useUiActions();

  return (
    <nav className="z-30 shrink-0 border-b border-[#151515] bg-black/70 backdrop-blur-[14px]">
      <div className="flex h-[70px] items-center gap-[18px] px-[30px] max-[640px]:gap-2.5 max-[640px]:px-4">
        <BrandLogo />
        <div className="ml-[18px] flex flex-1 items-center gap-0.5 max-[900px]:overflow-x-auto">
          {NAV_GROUPS.map((g) => (
            <NavDropdown key={g.key} group={g} />
          ))}
        </div>
        <button
          onClick={() => toggleSidebar()}
          className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-mut transition-colors hover:text-ink"
        >
          <Icon name="history" size={18} />
          <span className="max-[640px]:hidden">히스토리</span>
        </button>
        {isAuthed ? (
          <button
            onClick={async () => {
              await logout();
              navigate(ROUTES.login);
            }}
            className="flex h-10 shrink-0 items-center rounded-[20px] border border-white/30 px-5 text-sm font-semibold transition-colors hover:bg-white/[.06]"
          >
            {user?.nickname} · 로그아웃
          </button>
        ) : (
          <button
            onClick={() => navigate(ROUTES.login)}
            className="flex h-10 shrink-0 items-center rounded-[20px] bg-white px-5 text-sm font-semibold text-black hover:bg-[#e9e9e9]"
          >
            로그인
          </button>
        )}
      </div>
    </nav>
  );
}
