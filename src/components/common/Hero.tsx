import type { ReactNode } from 'react';

interface HeroProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
}

/** 데모 .hero / .eyebrow 섹션 헤더 유지 */
export default function Hero({ eyebrow, title, description }: HeroProps) {
  return (
    <div className="relative mb-10 text-center">
      <div className="mb-[18px] text-[13px] tracking-[.16em] text-mut3 [overflow-wrap:anywhere]">{eyebrow}</div>
      <h1 className="text-[44px] font-light leading-[1.15] tracking-[-.03em] max-[480px]:text-[30px] [&_b]:font-medium">
        {title}
      </h1>
      {description && (
        <p className="mx-auto mt-4 max-w-[520px] text-base leading-[1.65] text-mut">
          {description}
        </p>
      )}
    </div>
  );
}
