import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

/** 데모 .card / .hovcard 스타일 유지 */
export default function Card({ hover = false, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`bg-panel border border-line rounded-card p-[22px] ${
        hover ? 'transition-colors duration-150 hover:border-[#333]' : ''
      } ${className}`}
      {...rest}
    />
  );
}
