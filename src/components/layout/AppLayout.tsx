import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import Footer from './Footer';
import HistorySidebar from './HistorySidebar';
import Toast from './Toast';

/** 데모 .app 골격(고정 네비 + 스크롤 본문 + 글로우) 유지 */
export default function AppLayout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopNav />
      <main className="relative flex-1 overflow-y-auto bg-black">
        <div
          className="pointer-events-none absolute -top-[100px] left-1/2 h-[460px] w-[1000px] -translate-x-1/2"
          style={{
            background:
              'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,255,255,.07), rgba(255,255,255,0) 70%)',
          }}
        />
        <div className="relative mx-auto max-w-wrap px-9 pb-[70px] pt-12 max-[640px]:px-5 max-[640px]:pt-8">
          <Outlet />
        </div>
        <Footer />
      </main>
      <HistorySidebar />
      <Toast />
    </div>
  );
}
