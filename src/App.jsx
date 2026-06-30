/**
 * Lintro Marketplace - Main App with routes.
 *
 * BUG-011 fix: lazy-load all page components to reduce the initial bundle size.
 */
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/layout/ScrollToTop';
import { Skeleton } from './components/ui';
import MessagesPage from './pages/MessagesPage'; // Import directly (not lazy)
import StoragePage from './pages/admin/StoragePage'; // Make sure this import exists

// Eagerly load the homepage for fast first paint
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

// Lazy-load all other pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const VerifyOTPPage = lazy(() => import('./pages/auth/VerifyOTPPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const SellPage = lazy(() => import('./pages/SellPage'));
const EditListingPage = lazy(() => import('./pages/EditListingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
// const MessagesPage = lazy(() => import('./pages/MessagesPage')); // REMOVED from lazy
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const VerificationPage = lazy(() => import('./pages/VerificationPage'));
const ComplaintsPage = lazy(() => import('./pages/ComplaintsPage'));
const SafetyTipsPage = lazy(() => import('./pages/SafetyTipsPage'));

// BUG-001 fix: static info pages
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const CookiesPage = lazy(() => import('./pages/CookiesPage'));

// Admin
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminComplaintsPage = lazy(() => import('./pages/admin/AdminComplaintsPage'));
const AdminVerificationsPage = lazy(() => import('./pages/admin/AdminVerificationsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Skeleton className="w-full max-w-md h-32" />
    </div>
  );
}

// frontend/src/App.jsx

// ... existing imports ...

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* ===== ROUTES WITH LAYOUT (WITH FOOTER) ===== */}
        <Route element={<Layout />}>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<Suspense fallback={<PageLoader />}><SearchPage /></Suspense>} />
          <Route path="/product/:slug" element={<Suspense fallback={<PageLoader />}><ProductDetailPage /></Suspense>} />
          <Route path="/safety-tips" element={<Suspense fallback={<PageLoader />}><SafetyTipsPage /></Suspense>} />

          {/* Static info pages */}
          <Route path="/about" element={<Suspense fallback={<PageLoader />}><AboutPage /></Suspense>} />
          <Route path="/contact" element={<Suspense fallback={<PageLoader />}><ContactPage /></Suspense>} />
          <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><PrivacyPage /></Suspense>} />
          <Route path="/terms" element={<Suspense fallback={<PageLoader />}><TermsPage /></Suspense>} />
          <Route path="/cookies" element={<Suspense fallback={<PageLoader />}><CookiesPage /></Suspense>} />

          {/* Auth */}
          <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
          <Route path="/register" element={<Suspense fallback={<PageLoader />}><RegisterPage /></Suspense>} />
          <Route path="/verify-otp" element={<Suspense fallback={<PageLoader />}><VerifyOTPPage /></Suspense>} />
          <Route path="/forgot-password" element={<Suspense fallback={<PageLoader />}><VerifyOTPPage mode="forgot" /></Suspense>} />

          {/* Protected routes with footer */}
          <Route path="/sell" element={
            <ProtectedRoute><Suspense fallback={<PageLoader />}><SellPage /></Suspense></ProtectedRoute>
          } />
          <Route path="/edit/:slug" element={
            <ProtectedRoute><Suspense fallback={<PageLoader />}><EditListingPage /></Suspense></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><Suspense fallback={<PageLoader />}><DashboardPage /></Suspense></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Suspense fallback={<PageLoader />}><ProfilePage /></Suspense></ProtectedRoute>
          } />
          <Route path="/favorites" element={
            <ProtectedRoute><Suspense fallback={<PageLoader />}><FavoritesPage /></Suspense></ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute><Suspense fallback={<PageLoader />}><NotificationsPage /></Suspense></ProtectedRoute>
          } />
          <Route path="/verification" element={
            <ProtectedRoute><Suspense fallback={<PageLoader />}><VerificationPage /></Suspense></ProtectedRoute>
          } />
          <Route path="/complaints" element={
            <ProtectedRoute><Suspense fallback={<PageLoader />}><ComplaintsPage /></Suspense></ProtectedRoute>
          } />

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* ===== ADMIN ROUTES WITHOUT LAYOUT ===== */}
        <Route path="/admin" element={
          <AdminRoute><Suspense fallback={<PageLoader />}><AdminLayout /></Suspense></AdminRoute>
        }>
          <Route index element={<Suspense fallback={<PageLoader />}><AdminDashboardPage /></Suspense>} />
          <Route path="users" element={<Suspense fallback={<PageLoader />}><AdminUsersPage /></Suspense>} />
          <Route path="products" element={<Suspense fallback={<PageLoader />}><AdminProductsPage /></Suspense>} />
          <Route path="categories" element={<Suspense fallback={<PageLoader />}><AdminCategoriesPage /></Suspense>} />
          <Route path="complaints" element={<Suspense fallback={<PageLoader />}><AdminComplaintsPage /></Suspense>} />
          <Route path="verifications" element={<Suspense fallback={<PageLoader />}><AdminVerificationsPage /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<PageLoader />}><AdminSettingsPage /></Suspense>} />
          <Route path="storage" element={<Suspense fallback={<PageLoader />}><StoragePage /></Suspense>} />
        </Route>

        {/* ===== MESSAGES ROUTES WITHOUT LAYOUT (NO FOOTER) ===== */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages/:conversationId"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}