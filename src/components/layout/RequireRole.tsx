import { Outlet, useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import { useUser } from '@/stores/authStore';
import { ROUTES } from '@/constants/navigation';
import type { User } from '@/types/auth';

/**
 * WBS · RBAC 라우팅 가드.
 * FNC-DAT-01: 데이터/API 관리는 관리자(admin)·실무자(worker) 권한만 접근 가능.
 */
export default function RequireRole({ roles }: { roles: User['role'][] }) {
  const navigate = useNavigate();
  const user = useUser();

  if (!user || !roles.includes(user.role)) {
    return (
      <section className="screen-fade py-20 text-center">
        <p className="mb-2 text-lg font-semibold">접근 권한이 없습니다</p>
        <p className="mb-6 text-[13px] text-mut">
          이 화면은 {roles.includes('admin') && '관리자'}
          {roles.includes('worker') && ' 또는 실무자'} 권한이 필요합니다. 현재 권한:{' '}
          {user?.role ?? '없음'}
        </p>
        <Button variant="ghost" onClick={() => navigate(ROUTES.search)}>
          통합 검색으로 돌아가기
        </Button>
      </section>
    );
  }
  return <Outlet />;
}
