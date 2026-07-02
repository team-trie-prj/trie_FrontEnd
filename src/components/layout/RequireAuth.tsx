import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useIsAuthenticated } from '@/stores/authStore';
import { ROUTES } from '@/constants/navigation';

/** FNC-AUTH-01 · 유효한 인증 토큰 보유 상태에서만 서비스 접근 허용 */
export default function RequireAuth() {
  const isAuthed = useIsAuthenticated();
  const location = useLocation();

  if (!isAuthed) {
    return <Navigate to={ROUTES.login} state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
}
