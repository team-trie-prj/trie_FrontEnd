import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/layout/ErrorBoundary';
// 폐쇄망 배포 대비 — 폰트를 CDN 대신 번들에 포함 (self-host)
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import 'material-symbols/outlined.css';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
