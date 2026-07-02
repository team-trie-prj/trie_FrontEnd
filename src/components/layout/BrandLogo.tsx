import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/navigation';

/** TRIE 브랜드 로고 (public/logo.svg) */
export default function BrandLogo({ small = false }: { small?: boolean }) {
  const s = small ? 28 : 32;
  return (
    <Link to={ROUTES.search} className="flex shrink-0 items-center gap-[0.6875rem]">
      <img src="/logo.svg" alt="TRIE 로고" width={s} height={s} />
      <b className="text-base font-semibold tracking-[-.01em] max-[520px]:hidden">TRIE · 지능형 정보 시스템</b>
    </Link>
  );
}
