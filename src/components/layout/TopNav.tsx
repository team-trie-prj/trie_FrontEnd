import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import NavDropdown from './NavDropdown';
import NavDrawer from './NavDrawer';
import Icon from '@/components/common/Icon';
import { NAV_GROUPS, ROUTES } from '@/constants/navigation';
import { useIsAuthenticated, useUser, useAuthActions } from '@/stores/authStore';
import { useUiActions } from '@/stores/uiStore';

/** 상단 네비 — 데스크톱 그룹 드롭다운, 480px 이하 햄버거 드로어 */
export default function TopNav() {
  const navigate = useNavigate();
  const isAuthed = useIsAuthenticated();
  const user = useUser();
  const { logout } = useAuthActions();
  const { toggleSidebar } = useUiActions();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <nav className="z-30 shrink-0 border-b border-[#151515] bg-black/70 backdrop-blur-[14px]">
      <div className="flex min-h-[70px] flex-wrap items-center gap-x-[18px] gap-y-1 px-[30px] py-2 max-[480px]:gap-x-2 max-[480px]:px-3">
        <button
          onClick={() => setDrawerOpen(true)}
          className="rounded-md p-2 text-mut hover:text-ink min-[481px]:hidden"
          aria-label="메뉴 열기"
        >
          <Icon name="menu" size={22} />
        </button>
        <BrandLogo />
        <div className="ml-[18px] flex min-w-0 flex-1 flex-wrap items-center gap-0.5 max-[480px]:hidden">
          {NAV_GROUPS.map((g) => (
            <NavDropdown key={g.key} group={g} />
          ))}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            onClick={() => toggleSidebar()}
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-mut transition-colors hover:text-ink max-[480px]:px-2"
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
              className="flex h-10 items-center whitespace-nowrap rounded-[20px] border border-white/30 px-5 text-sm font-semibold transition-colors hover:bg-white/[.06] max-[640px]:px-3.5"
            >
              {user?.nickname} · 로그아웃
            </button>
          ) : (
            <button
              onClick={() => navigate(ROUTES.login)}
              className="flex h-10 items-center whitespace-nowrap rounded-[20px] bg-white px-5 text-sm font-semibold text-black hover:bg-[#e9e9e9]"
            >
              로그인
            </button>
          )}
        </div>
      </div>
      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </nav>
  );
}
