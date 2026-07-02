import { NavLink, useLocation } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import type { NavGroup } from '@/constants/navigation';

/** 데모 .nav-group / .nav-drop 호버 드롭다운 유지 */
export default function NavDropdown({ group }: { group: NavGroup }) {
  const { pathname } = useLocation();
  const active = group.items.some((i) => i.to === pathname);

  return (
    <div className="group relative">
      <button
        className={`relative inline-flex items-center gap-[0.3125rem] whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
          active ? 'text-ink' : 'text-mut group-hover:text-ink'
        }`}
      >
        {group.label}
        <svg
          className="transition-transform duration-200 group-hover:rotate-180"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
        {active && (
          <span className="absolute inset-x-3.5 -bottom-[1.4375rem] h-0.5 bg-white max-[900px]:hidden" aria-hidden />
        )}
      </button>
      <div className="invisible absolute left-0 top-[calc(100%+10px)] z-40 min-w-[16.5rem] -translate-y-1.5 rounded-[0.875rem] border border-line2 bg-[#0C0C0C] p-2 opacity-0 shadow-[0_20px_50px_rgba(0,0,0,.6)] transition-all duration-[180ms] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        {group.items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex items-start gap-3 rounded-[0.625rem] px-3 py-[0.6875rem] transition-colors hover:bg-[#161616]"
          >
            <span className="flex h-[2.125rem] w-[2.125rem] shrink-0 items-center justify-center rounded-[0.5625rem] border border-[#2A2A2A]">
              <Icon name={item.icon} size={18} />
            </span>
            <span>
              <span className="block text-sm font-semibold">{item.title}</span>
              <span className="mt-0.5 block text-xs leading-[1.4] text-mut2">{item.desc}</span>
            </span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
