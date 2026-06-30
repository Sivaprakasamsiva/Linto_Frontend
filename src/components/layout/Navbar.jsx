/**
 * Top navbar - logo, search, nav, theme toggle, profile menu.
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiMenu, FiX, FiSun, FiMoon, FiBell, FiMessageSquare,
  FiUser, FiLogOut, FiSettings, FiPlus, FiHeart, FiPackage,
  FiShield, FiAlertCircle,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  useUnreadNotificationCount, useNotifications, useMarkAllNotificationsRead,
  useUnreadMessageCount,
} from '../../hooks/queries';
import { timeAgo, getInitials } from '../../utils/helpers';
import LintroLogo from '../../Logo/Lintro_Logo.png';

export default function Navbar() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuHeight, setMenuHeight] = useState('calc(100vh - 4rem)');

  const { data: notifCount } = useUnreadNotificationCount();
  const { data: msgCount } = useUnreadMessageCount();
  const { data: notifications } = useNotifications(true);
  const markAllRead = useMarkAllNotificationsRead();

  // Calculate proper menu height for mobile
  useEffect(() => {
    const calculateHeight = () => {
      if (window.innerWidth < 768) {
        // Get viewport height
        const vh = window.innerHeight;
        // Navbar height is 4rem (64px)
        const navbarHeight = 64;
        // BottomNav height is approximately 64px
        const bottomNavHeight = 64;
        // Calculate available height
        const availableHeight = vh - navbarHeight - bottomNavHeight;
        setMenuHeight(`${availableHeight}px`);
      } else {
        setMenuHeight('calc(100vh - 4rem)');
      }
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    window.addEventListener('orientationchange', calculateHeight);
    
    return () => {
      window.removeEventListener('resize', calculateHeight);
      window.removeEventListener('orientationchange', calculateHeight);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileOpen(false);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center overflow-hidden">
              <img 
                src={LintroLogo} 
                alt="Lintro" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="hidden sm:block font-display font-bold text-lg text-slate-900 dark:text-white">
              Lintro<span className="text-brand"></span>
            </span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search for products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
          </form>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <button onClick={toggleTheme} className="btn-outline !p-2" title="Toggle theme">
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/messages" className="btn-outline !p-2 relative" title="Messages">
                  <FiMessageSquare />
                  {msgCount?.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {msgCount.unread_count > 9 ? '9+' : msgCount.unread_count}
                    </span>
                  )}
                </Link>
                <div className="relative">
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                    className="btn-outline !p-2 relative"
                    title="Notifications"
                  >
                    <FiBell />
                    {notifCount?.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {notifCount.unread_count > 9 ? '9+' : notifCount.unread_count}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 card shadow-xl overflow-hidden"
                      >
                        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <span className="font-semibold">Notifications</span>
                          <button
                            onClick={() => markAllRead.mutate()}
                            className="text-xs text-brand hover:underline"
                          >
                            Mark all read
                          </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications?.results?.length === 0 || !notifications?.results ? (
                            <p className="p-4 text-sm text-slate-500 text-center">No unread notifications</p>
                          ) : (
                            (notifications?.results || []).slice(0, 10).map((n) => (
                              <Link
                                key={n.id}
                                to="/notifications"
                                onClick={() => setNotifOpen(false)}
                                className="block p-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0"
                              >
                                <p className="font-medium text-sm">{n.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
                              </Link>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link to="/sell" className="btn-primary">
                  <FiPlus /> Sell
                </Link>

                <div className="relative">
                  <button
                    onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {user?.profile_image ? (
                      <img src={user.profile_image} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-semibold">
                        {getInitials(user?.full_name)}
                      </div>
                    )}
                  </button>
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 card shadow-xl overflow-hidden"
                      >
                        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                          <p className="font-medium text-sm truncate">{user?.full_name}</p>
                          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                          {user?.verified_seller && (
                            <span className="badge-verified mt-1">Verified Seller</span>
                          )}
                        </div>
                        <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm">
                          <FiPackage /> Dashboard
                        </Link>
                        <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm">
                          <FiUser /> Profile
                        </Link>
                        <Link to="/favorites" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm">
                          <FiHeart /> Favorites
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm">
                            <FiSettings /> Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-red-600"
                        >
                          <FiLogOut /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline">Login</Link>
                <Link to="/register" className="btn-primary">Sign Up</Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileOpen(!mobileOpen)} 
            className="md:hidden btn-outline !p-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* ===== MOBILE MENU - FIXED WITH PROPER HEIGHT ===== */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          >
            {/* Fixed height container with scroll */}
            <div 
              className="overflow-y-auto overscroll-contain"
              style={{ height: menuHeight }}
            >
              <div className="p-4 space-y-3">
                {/* Mobile Search */}
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </form>

                {/* ===== USER PROFILE SECTION ===== */}
                {isAuthenticated && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      {user?.profile_image ? (
                        <img src={user.profile_image} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center text-lg font-semibold">
                          {getInitials(user?.full_name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user?.full_name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        {user?.verified_seller && (
                          <span className="inline-block text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-0.5">
                            ✓ Verified Seller
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ===== MAIN NAVIGATION ===== */}
                <div className="space-y-1">
                  <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                      location.pathname === '/'
                        ? 'bg-brand text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FiPackage size={18} /> Home
                  </Link>
                  <Link
                    to="/search"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                      location.pathname === '/search'
                        ? 'bg-brand text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FiSearch size={18} /> Browse Products
                  </Link>
                  <Link
                    to="/sell"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                      location.pathname === '/sell'
                        ? 'bg-brand text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FiPlus size={18} /> Sell an Item
                  </Link>
                  <Link
                    to="/favorites"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                      location.pathname === '/favorites'
                        ? 'bg-brand text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FiHeart size={18} /> Favorites
                  </Link>
                  <Link
                    to="/messages"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium relative ${
                      location.pathname === '/messages'
                        ? 'bg-brand text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FiMessageSquare size={18} /> Messages
                    {msgCount?.unread_count > 0 && (
                      <span className="ml-auto bg-accent-500 text-white text-[10px] rounded-full px-2 py-0.5">
                        {msgCount.unread_count}
                      </span>
                    )}
                  </Link>
                </div>

                {/* ===== ACCOUNT LINKS ===== */}
                {isAuthenticated && (
                  <>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                      <p className="text-xs text-slate-400 uppercase tracking-wider px-3 py-1 font-semibold">
                        Account
                      </p>
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <FiPackage size={18} /> My Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <FiUser size={18} /> My Profile
                      </Link>
                      <Link
                        to="/verification"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <FiShield size={18} /> Get Verified
                      </Link>
                      {/* ===== ADMIN PANEL - ONLY FOR ADMIN ===== */}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-brand/10 text-brand hover:bg-brand/20"
                        >
                          <FiSettings size={18} /> Admin Panel
                        </Link>
                      )}
                    </div>

                    {/* ===== SAFETY & HELP ===== */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                      <p className="text-xs text-slate-400 uppercase tracking-wider px-3 py-1 font-semibold">
                        Safety & Help
                      </p>
                      <Link
                        to="/safety-tips"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <FiShield size={18} /> Safety Tips
                      </Link>
                      <Link
                        to="/complaints"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <FiAlertCircle size={18} /> File a Complaint
                      </Link>
                    </div>

                    {/* ===== ABOUT ===== */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                      <p className="text-xs text-slate-400 uppercase tracking-wider px-3 py-1 font-semibold">
                        About
                      </p>
                      <Link
                        to="/about"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <FiPackage size={18} /> About Us
                      </Link>
                      <Link
                        to="/contact"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <FiPackage size={18} /> Contact
                      </Link>
                    </div>
                  </>
                )}

                {/* Theme toggle and Auth buttons - Always at bottom */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                  <div className="flex items-center gap-2">
                    <button onClick={toggleTheme} className="btn-outline flex-1">
                      {theme === 'dark' ? <FiSun /> : <FiMoon />} {theme === 'dark' ? 'Light' : 'Dark'}
                    </button>
                    {isAuthenticated ? (
                      <button onClick={handleLogout} className="btn-danger flex-1">
                        <FiLogOut /> Logout
                      </button>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-outline flex-1">Login</Link>
                        <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1">Sign Up</Link>
                      </>
                    )}
                  </div>
                </div>

                {/* Safety Notice - Always visible at bottom */}
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex-shrink-0">
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    <strong>Safety Notice:</strong> Buyers must verify the seller before making any payment. The platform only connects users and is not responsible for offline transactions.
                  </p>
                </div>

                {/* Extra padding at bottom for safe area */}
                <div className="h-4 md:h-0" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}