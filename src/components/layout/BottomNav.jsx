/**
 * Mobile sticky bottom navigation.
 */
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiSearch, FiPlus, FiMessageSquare, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useUnreadMessageCount } from '../../hooks/queries';

export default function BottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { data: msgCount } = useUnreadMessageCount();

  const items = [
    { to: '/', label: 'Home', icon: FiHome },
    { to: '/search', label: 'Browse', icon: FiSearch },
    { to: '/sell', label: 'Sell', icon: FiPlus, primary: true },
    { to: '/messages', label: 'Messages', icon: FiMessageSquare, badge: msgCount?.unread_count },
    { to: isAuthenticated ? '/dashboard' : '/login', label: isAuthenticated ? 'Dashboard' : 'Login', icon: FiUser },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 safe-area-inset-bottom">
      <div className="grid grid-cols-5 h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to ||
            (item.to !== '/' && location.pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`relative flex flex-col items-center justify-center gap-1 text-xs font-medium
                ${active ? 'text-brand' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <div className={`relative ${item.primary ? 'w-12 h-12 -mt-4 rounded-full bg-brand text-white flex items-center justify-center shadow-lg' : ''}`}>
                <Icon size={item.primary ? 22 : 20} />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={item.primary ? 'mt-0.5' : ''}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
