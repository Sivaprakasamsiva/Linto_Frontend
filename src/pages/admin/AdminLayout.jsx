// frontend/src/pages/admin/AdminLayout.jsx
/**
 * Admin layout with sidebar navigation.
 */
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome, FiUsers, FiPackage, FiGrid, FiFlag, FiShield, FiSettings,
  FiArrowLeft, FiMenu, FiX, FiDatabase,  // <-- ADD FiDatabase HERE
} from 'react-icons/fi';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: FiHome, end: true },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/products', label: 'Products', icon: FiPackage },
  { to: '/admin/categories', label: 'Categories', icon: FiGrid },
  { to: '/admin/complaints', label: 'Complaints', icon: FiFlag },
  { to: '/admin/verifications', label: 'Verifications', icon: FiShield },
  { to: '/admin/settings', label: 'Settings', icon: FiSettings },
  { to: '/admin/storage', label: 'Storage', icon: FiDatabase }, // Now works!
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Helmet><title>Admin Panel - Lintro</title></Helmet>
      {/* Top bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden btn-outline !p-2">
              {sidebarOpen ? <FiX /> : <FiMenu />}
            </button>
            <h1 className="font-display font-bold text-lg">Admin Panel</h1>
          </div>
          <button onClick={() => navigate('/')} className="btn-outline !py-1 text-sm">
            <FiArrowLeft /> Back to site
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-[57px] lg:top-[57px] left-0 w-64 h-[calc(100vh-57px)] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-20 overflow-y-auto transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <nav className="p-3 space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'bg-brand text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon size={16} /> {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6 max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}