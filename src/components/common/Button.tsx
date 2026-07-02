import type { ButtonHTMLAttributes } from 'react';

type Variant = 'white' | 'ghost';
type Size = 'md' | 'sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/** 데모 .btn / .btn-white / .btn-ghost / .btn-sm 스타일 유지 */
const base =
  'inline-flex items-center justify-center gap-2 rounded-[1.4375rem] font-semibold cursor-pointer transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed';
const variants: Record<Variant, string> = {
  white: 'bg-white text-black hover:bg-[#e9e9e9]',
  ghost: 'bg-transparent text-ink border border-white/30 hover:bg-white/[.06]',
};
const sizes: Record<Size, string> = {
  md: 'h-[2.875rem] px-[1.375rem] text-sm',
  sm: 'h-10 px-4 text-[0.8125rem]',
};

export default function Button({
  variant = 'white',
  size = 'md',
  className = '',
  ...rest
}: ButtonProps) {
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest} />;
}
