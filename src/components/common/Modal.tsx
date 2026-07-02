import type { ReactNode } from 'react';
import Icon from './Icon';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** 가벼운 모달 — 포커스 트랩·ESC 닫기·포커스 복원 지원 */
export default function Modal({ title, onClose, children }: ModalProps) {
  const trapRef = useFocusTrap<HTMLDivElement>(onClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
      role="dialog"
      aria-modal
      aria-label={title}
    >
      <div
        ref={trapRef}
        className="screen-fade w-full max-w-[560px] rounded-card border border-line2 bg-[#0C0C0C] p-6 shadow-[0_20px_50px_rgba(0,0,0,.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="min-w-0 flex-1 truncate text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="text-mut hover:text-ink" aria-label="닫기">
            <Icon name="close" size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
