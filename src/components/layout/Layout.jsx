/**
 * Layout wrapper with navbar, bottom nav, and footer.
 */
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';
import SafetyBanner from './SafetyBanner';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SafetyBanner />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
