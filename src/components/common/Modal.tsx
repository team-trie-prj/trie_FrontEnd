import type { ReactNode } from 'react';
import Icon from './Icon';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** 가벼운 모달 (스니펫 팝업 등) — 데모 다크 패널 톤 유지 */
export default function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
      role="dialog"
      aria-modal
    >
      <div
        className="screen-fade w-full max-w-[560px] rounded-card border border-line2 bg-[#0C0C0C] p-6 shadow-[0_20px_50px_rgba(0,0,0,.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="text-mut hover:text-ink" aria-label="닫기">
            <Icon name="close" size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
