import type { ButtonHTMLAttributes } from 'react';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

/** 데모 .chip 스타일 유지 (active = 흰 테두리 강조) */
export default function Chip({ active = false, className = '', ...rest }: ChipProps) {
  return (
    <button
      className={`h-[2.125rem] rounded-[1.25rem] border bg-transparent px-[0.9375rem] text-[0.8125rem] font-medium transition-colors duration-150 ${
        active
          ? 'border-[#444] text-white'
          : 'border-[#232323] text-[#9A9A9A] hover:border-[#444] hover:text-white'
      } ${className}`}
      {...rest}
    />
  );
}
