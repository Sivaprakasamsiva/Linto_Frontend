/**
 * Admin users management.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiShield, FiAlertCircle, FiCheck, FiX, FiSlash } from 'react-icons/fi';
import { useAdminUsers, useAdminUserAction } from '../../hooks/queries';
import { formatDate, getInitials } from '../../utils/helpers';
import { Spinner, EmptyState, Modal } from '../../components/ui';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'verified', label: 'Verified' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'banned', label: 'Banned' },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [actionUser, setActionUser] = useState(null);
  const [action, setAction] = useState('');
  const [reason, setReason] = useState('');
  const { data, isLoading } = useAdminUsers(search, status);
  const userAction = useAdminUserAction();

  const handleAction = async () => {
    try {
      await userAction.mutateAsync({ userId: actionUser.id, data: { action, reason } });
      setActionUser(null);
      setAction('');
      setReason('');
    } catch (err) {
      // toast handled globally
    }
  };

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-4">Manage Users</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search by name, email, mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input !w-auto">
          {STATUS_FILTERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : !data?.results?.length ? (
        <EmptyState icon={FiSearch} title="No users found" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-left">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {u.profile_image ? (
                          <img src={u.profile_image} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold">
                            {getInitials(u.full_name)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{u.full_name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-xs">{u.mobile_number}</td>
                    <td className="p-3 text-xs">{u.district}, {u.state}</td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        {u.verified_seller && <span className="badge-verified">Verified</span>}
                        {u.is_suspended && <span className="badge bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Suspended</span>}
                        {u.is_banned && <span className="badge bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Banned</span>}
                      </div>
                    </td>
                    <td className="p-3 text-xs">{formatDate(u.joined_date)}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {!u.verified_seller && (
                          <button onClick={() => { setActionUser(u); setAction('verify'); }} className="text-[10px] btn-outline !py-1 !px-2" title="Verify">
                            <FiShield /> Verify
                          </button>
                        )}
                        {u.verified_seller && (
                          <button onClick={() => { setActionUser(u); setAction('unverify'); }} className="text-[10px] btn-outline !py-1 !px-2">
                            Unverify
                          </button>
                        )}
                        {!u.is_suspended && !u.is_banned && (
                          <button onClick={() => { setActionUser(u); setAction('suspend'); }} className="text-[10px] btn-outline !py-1 !px-2 text-amber-600">
                            Suspend
                          </button>
                        )}
                        {u.is_suspended && (
                          <button onClick={() => { setActionUser(u); setAction('unsuspend'); }} className="text-[10px] btn-outline !py-1 !px-2 text-green-600">
                            Unsuspend
                          </button>
                        )}
                        {!u.is_banned && (
                          <button onClick={() => { setActionUser(u); setAction('ban'); }} className="text-[10px] btn-outline !py-1 !px-2 text-red-600">
                            Ban
                          </button>
                        )}
                        {u.is_banned && (
                          <button onClick={() => { setActionUser(u); setAction('unban'); }} className="text-[10px] btn-outline !py-1 !px-2 text-green-600">
                            Unban
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={!!actionUser} onClose={() => setActionUser(null)} title={`Confirm action: ${action}`}>
        <div className="space-y-3">
          <p className="text-sm">You are about to <strong>{action}</strong> user <strong>{actionUser?.full_name}</strong> ({actionUser?.email}).</p>
          <div>
            <label className="label">Reason (optional)</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="input" rows="3" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setActionUser(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleAction} disabled={userAction.isPending} className="btn-primary">
              {userAction.isPending ? 'Working...' : 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
