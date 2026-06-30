/**
 * Admin complaints management.
 */
import { useState } from 'react';
import { FiFlag, FiAlertCircle } from 'react-icons/fi';
import { useAdminComplaints, useReviewComplaint } from '../../hooks/queries';
import { formatDate } from '../../utils/helpers';
import { Spinner, EmptyState, Modal } from '../../components/ui';
import toast from 'react-hot-toast';

export default function AdminComplaintsPage() {
  const [status, setStatus] = useState('');
  const [review, setReview] = useState(null);
  const [form, setForm] = useState({ action: '', admin_notes: '', resolution: '' });
  const { data, isLoading } = useAdminComplaints(status);
  const reviewComplaint = useReviewComplaint();

  const submitReview = async () => {
    try {
      await reviewComplaint.mutateAsync({
        id: review.id,
        data: {
          ...form,
          status: form.action === 'dismiss' ? 'dismissed' :
                  form.action === 'resolve' ? 'resolved' :
                  form.action === 'warn' ? 'warned' :
                  form.action === 'suspend' ? 'suspended' :
                  form.action === 'ban' ? 'banned' : 'pending',
        },
      });
      toast.success('Complaint reviewed.');
      setReview(null);
      setForm({ action: '', admin_notes: '', resolution: '' });
    } catch (err) {
      toast.error('Failed.');
    }
  };

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-4">Complaints</h1>
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="input !w-auto mb-4">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="under_review">Under Review</option>
        <option value="warned">Warned</option>
        <option value="suspended">Suspended</option>
        <option value="banned">Banned</option>
        <option value="dismissed">Dismissed</option>
        <option value="resolved">Resolved</option>
      </select>
      {isLoading ? <div className="flex justify-center py-20"><Spinner size={32} /></div> : !data?.results?.length ? (
        <EmptyState icon={FiFlag} title="No complaints" />
      ) : (
        <div className="space-y-3">
          {data.results.map((c) => (
            <div key={c.id} className="card p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="badge bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">{c.category}</span>
                  <span className="ml-2 text-xs text-slate-500">by {c.complainant_email}</span>
                </div>
                <span className="text-xs text-slate-500">{formatDate(c.created_at)}</span>
              </div>
              <p className="text-sm mb-2">{c.description}</p>
              <div className="text-xs text-slate-500 mb-3">
                <p>Reported: <strong>{c.reported_user_email}</strong></p>
                {c.product_title && <p>Product: {c.product_title}</p>}
              </div>
              <div className="flex items-center justify-between">
                <span className={`badge ${
                  c.status === 'pending' ? 'badge-pending' :
                  c.status === 'resolved' || c.status === 'dismissed' ? 'badge-available' :
                  'badge-sold'
                }`}>{c.status}</span>
                {c.status === 'pending' && (
                  <button onClick={() => { setReview(c); setForm({ action: '', admin_notes: '', resolution: '' }); }} className="btn-primary !py-1 text-xs">
                    Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!review} onClose={() => setReview(null)} title="Review Complaint">
        <div className="space-y-3">
          <div className="alert-warn text-xs">
            <FiAlertCircle className="inline mr-1" />
            Choosing an action will affect the reported user's account immediately.
          </div>
          <div>
            <label className="label">Action</label>
            <select value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })} className="input">
              <option value="">Select...</option>
              <option value="warn">Warn user</option>
              <option value="suspend">Suspend user (7 days)</option>
              <option value="ban">Ban user permanently</option>
              <option value="dismiss">Dismiss complaint</option>
              <option value="resolve">Mark as resolved</option>
            </select>
          </div>
          <div>
            <label className="label">Admin Notes (internal)</label>
            <textarea value={form.admin_notes} onChange={(e) => setForm({ ...form, admin_notes: e.target.value })} className="input" rows="2" />
          </div>
          <div>
            <label className="label">Resolution (sent to user)</label>
            <textarea value={form.resolution} onChange={(e) => setForm({ ...form, resolution: e.target.value })} className="input" rows="3" />
          </div>
          <button onClick={submitReview} disabled={!form.action || reviewComplaint.isPending} className="btn-primary w-full">
            {reviewComplaint.isPending ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
