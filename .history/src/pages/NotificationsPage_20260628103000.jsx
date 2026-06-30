// frontend/src/pages/NotificationsPage.jsx
/**
 * Notifications page.
 */
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiBell, FiCheck, FiMessageSquare, FiUser, FiAlertTriangle,
  FiPackage, FiShield, FiClock,
} from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import {
  useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead,
} from '../hooks/queries';
import { timeAgo } from '../utils/helpers';
import { ListSkeleton, EmptyState } from '../components/ui';

const TYPE_ICONS = {
  buy_request_received: FiPackage,
  buy_request_response: FiPackage,
  inquiry_received: FiMessageSquare,
  inquiry_answered: FiMessageSquare,
  chat_message: FiMessageSquare,
  verification_approved: FiShield,
  verification_rejected: FiShield,
  complaint_filed: FiAlertTriangle,
  complaint_update: FiAlertTriangle,
  complaint_warning: FiAlertTriangle,
  complaint_suspended: FiAlertTriangle,
  listing_published: FiPackage,
  listing_unlisted: FiClock,
  listing_expired: FiClock,
  listing_archived: FiClock,
  listing_sold: FiPackage,
  listing_reminder: FiClock,
  admin_action: FiUser,
};

function getNotificationLink(notification) {
  const { notification_type, related_id, data } = notification;
  
  switch (notification_type) {
    case 'chat_message':
      return related_id ? `/messages/${related_id}` : '/messages';
    
    case 'inquiry_received':
    case 'inquiry_answered':
      if (data?.product_slug) {
        return `/product/${data.product_slug}`;
      }
      return '/dashboard';
    
    case 'buy_request_received':
    case 'buy_request_response':
      return '/dashboard';
    
    case 'verification_approved':
    case 'verification_rejected':
      return '/verification';
    
    case 'listing_published':
    case 'listing_sold':
    case 'listing_expired':
    case 'listing_unlisted':
    case 'listing_archived':
    case 'listing_reminder':
      return '/dashboard';
    
    case 'complaint_filed':
    case 'complaint_warning':
    case 'complaint_suspended':
    case 'complaint_update':
      return '/complaints';
    
    case 'admin_action':
      return '/profile';
    
    default:
      return '/notifications';
  }
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useNotifications(false);
  const markAll = useMarkAllNotificationsRead();
  const markOne = useMarkNotificationRead();

  const handleClick = (n) => {
    if (!n.is_read) markOne.mutate(n.id);
    const link = getNotificationLink(n);
    if (link && link !== '/notifications') {
      navigate(link);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Helmet><title>Notifications - Lintro</title></Helmet>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display font-bold text-2xl">Notifications</h1>
        <button onClick={() => markAll.mutate()} className="btn-outline text-sm">
          <FiCheck /> Mark all read
        </button>
      </div>
      {isLoading ? (
        <ListSkeleton count={5} />
      ) : !data?.results?.length ? (
        <EmptyState icon={FiBell} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {data.results.map((n, i) => {
            const Icon = TYPE_ICONS[n.notification_type] || FiBell;
            const link = getNotificationLink(n);
            const isClickable = link && link !== '/notifications';
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.2) }}
                onClick={() => handleClick(n)}
                className={`card p-3 flex items-start gap-3 ${
                  isClickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
                } ${!n.is_read ? 'border-l-4 border-l-brand' : 'opacity-70'}`}
              >
                <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                  <Icon className="text-brand" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {n.notification_type === 'inquiry_received' && n.data?.asker_name && (
                      <span className="font-medium text-brand">From {n.data.asker_name}: </span>
                    )}
                    {n.message}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
                </div>
                {!n.is_read && <div className="w-2 h-2 rounded-full bg-brand mt-1" />}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}