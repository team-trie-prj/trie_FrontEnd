/** 데모 .label (섹션 소제목) 유지 */
export default function Label({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`text-[0.6875rem] tracking-[.14em] text-mut3 ${className}`}>{children}</div>
  );
}
