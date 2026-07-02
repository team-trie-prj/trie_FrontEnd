import { NavLink } from 'react-router-dom';
import { NAV_GROUPS } from '@/constants/navigation';

/** 900px 이하 플랫 네비 — 호버 드롭다운이 overflow에 잘리는 문제 해결 */
export default function MobileNav() {
  return (
    <div className="flex w-full items-center gap-1 overflow-x-auto pb-1.5 min-[901px]:hidden">
      {NAV_GROUPS.flatMap((g) => g.items).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
              isActive ? 'bg-[#161616] text-ink' : 'text-mut hover:text-ink'
            }`
          }
        >
          {item.title}
        </NavLink>
      ))}
    </div>
  );
}
