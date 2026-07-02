/** 데모 .spinner 동일 */
export default function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 rounded-full border-2 border-[#333] border-t-white align-middle ${className}`}
      style={{ animation: 'spin .7s linear infinite' }}
      aria-label="로딩 중"
    />
  );
}
