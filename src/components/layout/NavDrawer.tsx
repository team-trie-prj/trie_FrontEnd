import { NavLink } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import { NAV_GROUPS } from '@/constants/navigation';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface Props {
  open: boolean;
  onClose: () => void;
}

/** 480px 이하 햄버거 내비 드로어 (오프캔버스) — 포커스 트랩·ESC 지원 */
export default function NavDrawer({ open, onClose }: Props) {
  if (!open) return null;
  return <DrawerPanel onClose={onClose} />;
}

function DrawerPanel({ onClose }: { onClose: () => void }) {
  const trapRef = useFocusTrap<HTMLDivElement>(onClose);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <div
        ref={trapRef}
        className="screen-fade fixed inset-y-0 left-0 z-50 flex w-[16.25rem] max-w-[80vw] flex-col border-r border-line bg-[#070707]"
        role="dialog"
        aria-label="메뉴"
      >
        <div className="flex h-[3.875rem] shrink-0 items-center justify-between border-b border-line px-4">
          <span className="text-sm font-semibold">메뉴</span>
          <button onClick={onClose} className="text-mut hover:text-ink" aria-label="메뉴 닫기">
            <Icon name="close" size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {NAV_GROUPS.map((g) => (
            <div key={g.key} className="mb-4">
              <p className="mb-1.5 px-2 text-[0.6875rem] font-semibold uppercase tracking-[.12em] text-mut3">
                {g.label}
              </p>
              {g.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `mb-0.5 flex items-center gap-2.5 rounded-[0.625rem] px-2.5 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? 'bg-[#161616] text-ink' : 'text-mut hover:text-ink'
                    }`
                  }
                >
                  <Icon name={item.icon} size={17} />
                  {item.title}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
