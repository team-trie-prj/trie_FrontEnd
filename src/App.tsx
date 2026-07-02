import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import RequireAuth from '@/components/layout/RequireAuth';
import RequireRole from '@/components/layout/RequireRole';
import Spinner from '@/components/common/Spinner';
import LoginPage from '@/pages/LoginPage';
import SearchPage from '@/pages/SearchPage';
import { ROUTES } from '@/constants/navigation';

// 라우트 코드 분할 — 첫 화면(로그인/통합검색)만 즉시 로드하고
// 나머지는 방문 시점에 로드. recharts(차트) 청크는 /results에서만 내려받는다.
const ResultsPage = lazy(() => import('@/pages/ResultsPage'));
const DataPage = lazy(() => import('@/pages/DataPage'));
const CatalogPage = lazy(() => import('@/pages/CatalogPage'));
const ReportPage = lazy(() => import('@/pages/ReportPage'));

const fallback = (
  <div className="flex min-h-[300px] items-center justify-center">
    <Spinner />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={fallback}>
        <Routes>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route element={<RequireAuth />}>
              <Route path={ROUTES.search} element={<SearchPage />} />
              <Route path={ROUTES.results} element={<ResultsPage />} />
              <Route path={ROUTES.report} element={<ReportPage />} />
              {/* RBAC: 데이터·API 관리는 관리자/실무자 전용 (FNC-DAT-01) */}
              <Route element={<RequireRole roles={['admin', 'worker']} />}>
                <Route path={ROUTES.data} element={<DataPage />} />
                <Route path={ROUTES.catalog} element={<CatalogPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to={ROUTES.search} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
