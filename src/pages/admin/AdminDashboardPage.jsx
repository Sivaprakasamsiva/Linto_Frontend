/**
 * Admin dashboard with metrics.
 */
import { motion } from 'framer-motion';
import {
  FiUsers, FiPackage, FiInbox, FiFlag, FiShield, FiTrendingUp,
  FiCheckCircle, FiAlertCircle, FiArchive,
} from 'react-icons/fi';
import { useAdminMetrics } from '../../hooks/queries';
import { Spinner } from '../../components/ui';

export default function AdminDashboardPage() {
  const { data: m, isLoading } = useAdminMetrics();

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size={40} /></div>;
  if (!m) return null;

  const cards = [
    { label: 'Total Users', value: m.users.total, sub: `+${m.users.new_7d} this week`, icon: FiUsers, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Active Listings', value: m.products.active, sub: `${m.products.total} total`, icon: FiPackage, color: 'text-green-500 bg-green-50 dark:bg-green-950/30' },
    { label: 'Buy Requests', value: m.buy_requests.total, sub: `${m.buy_requests.pending} pending`, icon: FiInbox, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
    { label: 'Open Complaints', value: m.complaints.open, sub: 'Needs review', icon: FiFlag, color: 'text-red-500 bg-red-50 dark:bg-red-950/30' },
    { label: 'Pending Verifications', value: m.verifications.pending, sub: 'Awaiting review', icon: FiShield, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30' },
    { label: 'Verified Sellers', value: m.users.verified_sellers, sub: `${m.users.suspended} suspended`, icon: FiCheckCircle, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' },
    { label: 'Sold Listings', value: m.products.sold, sub: `${m.products.archived} archived`, icon: FiArchive, color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
    { label: 'Unlisted', value: m.products.unlisted, sub: '24h missed', icon: FiAlertCircle, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30' },
  ];

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-4"
            >
              <div className={`w-10 h-10 rounded-lg ${c.color} flex items-center justify-center mb-2`}>
                <Icon size={20} />
              </div>
              <div className="text-2xl font-bold">{c.value}</div>
              <div className="text-xs text-slate-500">{c.label}</div>
              <div className="text-[10px] text-slate-400 mt-1">{c.sub}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FiTrendingUp className="text-brand" /> Buy Requests Trend (14 days)
          </h3>
          <div className="flex items-end gap-1 h-40">
            {m.trends.buy_requests_14d.map((d) => {
              const max = Math.max(...m.trends.buy_requests_14d.map((x) => x.count), 1);
              const h = (d.count / max) * 100;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center group">
                  <div className="w-full bg-brand/20 rounded-t hover:bg-brand/40 transition-colors relative" style={{ height: `${h}%`, minHeight: '2px' }}>
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100">{d.count}</span>
                  </div>
                  <span className="text-[8px] text-slate-400 mt-1 rotate-45 origin-left">{d.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold mb-3">Top Categories</h3>
          <div className="space-y-2">
            {m.categories.top_categories.map((c) => {
              const max = Math.max(...m.categories.top_categories.map((x) => x.count));
              return (
                <div key={c.category__name} className="flex items-center gap-2">
                  <span className="text-sm w-24 truncate">{c.category__name}</span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded h-5 overflow-hidden">
                    <div className="bg-brand h-full" style={{ width: `${(c.count / max) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium w-8 text-right">{c.count}</span>
                </div>
              );
            })}
            {m.categories.top_categories.length === 0 && (
              <p className="text-sm text-slate-500">No data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
