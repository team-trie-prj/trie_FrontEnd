import type { HTMLAttributes } from 'react';

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'default' | 'danger';
}

/** 데모 .pill 스타일 유지 · danger는 출처 미상 배지용 (FNC-VIW-01) */
export default function Pill({ tone = 'default', className = '', ...rest }: PillProps) {
  const toneCls =
    tone === 'danger'
      ? 'border-danger/60 text-danger'
      : 'border-line2 text-[#C8C8C8]';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[1.25rem] border px-[0.8125rem] py-1.5 text-xs font-medium ${toneCls} ${className}`}
      {...rest}
    />
  );
}
