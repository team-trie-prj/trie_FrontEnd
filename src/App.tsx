import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import RequireAuth from '@/components/layout/RequireAuth';
import RequireRole from '@/components/layout/RequireRole';
import LoginPage from '@/pages/LoginPage';
import SearchPage from '@/pages/SearchPage';
import ResultsPage from '@/pages/ResultsPage';
import DataPage from '@/pages/DataPage';
import CatalogPage from '@/pages/CatalogPage';
import ReportPage from '@/pages/ReportPage';
import { ROUTES } from '@/constants/navigation';

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
