import { useToastMessage } from '@/stores/uiStore';

/** 데모 .toast 스타일 유지 */
export default function Toast() {
  const message = useToastMessage();
  return (
    <div
      className={`pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-[24px] bg-white px-5 py-3 text-[13px] font-semibold text-black shadow-[0_12px_40px_rgba(0,0,0,.5)] transition-opacity duration-[250ms] ${
        message ? 'opacity-100' : 'opacity-0'
      }`}
      role="status"
    >
      {message}
    </div>
  );
}
