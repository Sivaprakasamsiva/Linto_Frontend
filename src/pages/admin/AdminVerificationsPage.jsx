/**
 * Admin verifications management.
 */
import { useState } from 'react';
import { FiShield, FiCheckCircle, FiXCircle, FiEye, FiImage, FiMapPin, FiSmartphone, FiExternalLink, FiLoader } from 'react-icons/fi';
import { useAdminVerifications, useReviewVerification } from '../../hooks/queries';
import { formatDate } from '../../utils/helpers';
import { Spinner, EmptyState, Modal } from '../../components/ui';
import toast from 'react-hot-toast';

export default function AdminVerificationsPage() {
  const [status, setStatus] = useState('pending');
  const [review, setReview] = useState(null);
  const [form, setForm] = useState({ status: '', admin_notes: '', rejection_reason: '' });
  const { data, isLoading, refetch } = useAdminVerifications(status);
  const reviewVerification = useReviewVerification();

  // Get the API base URL from environment or default
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleReviewClick = (verification) => {
    setReview(verification);
    setForm({ status: '', admin_notes: '', rejection_reason: '' });
  };

  const submitReview = async () => {
    if (!form.status) {
      toast.error('Please select a decision.');
      return;
    }
    if (form.status === 'rejected' && !form.rejection_reason.trim()) {
      toast.error('Please provide a rejection reason.');
      return;
    }
    try {
      await reviewVerification.mutateAsync({ id: review.id, data: form });
      toast.success('Verification reviewed successfully.');
      setReview(null);
      setForm({ status: '', admin_notes: '', rejection_reason: '' });
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review.');
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return classes[status] || classes.pending;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <FiCheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <FiXCircle className="w-4 h-4 text-red-500" />;
      default: return <FiShield className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-4 flex items-center gap-2">
        <FiShield className="text-brand" /> Seller Verifications
      </h1>
      
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value)} 
          className="input !w-auto"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <span className="text-sm text-slate-400">
          {data?.results?.length || 0} requests
        </span>
        <button 
          onClick={() => refetch()} 
          className="text-sm text-brand hover:underline"
        >
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : !data?.results?.length ? (
        <EmptyState 
          icon={FiShield} 
          title="No verification requests" 
          description={`No ${status || ''} verification requests found.`}
        />
      ) : (
        <div className="space-y-4">
          {data.results.map((v) => (
            <div key={v.id} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {v.user_name || v.user?.full_name || 'Unknown User'}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${getStatusBadge(v.status)}`}>
                      {getStatusIcon(v.status)}
                      {v.status || 'pending'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{v.user_email || v.user?.email || 'No email'}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                    <span>Submitted: {formatDate(v.submitted_at)}</span>
                    <span>ID Type: {v.id_type || 'N/A'}</span>
                  </div>
                  {/* Show raw data for debugging */}
                  <details className="mt-2">
                    <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
                      Debug: Show raw data
                    </summary>
                    <pre className="mt-1 p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(v, null, 2)}
                    </pre>
                  </details>
                </div>
                {v.status === 'pending' && (
                  <button 
                    onClick={() => handleReviewClick(v)} 
                    className="btn-primary !py-1.5 text-xs flex items-center gap-1 whitespace-nowrap"
                  >
                    <FiEye /> Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal isOpen={!!review} onClose={() => setReview(null)} title="Review Verification" size="lg">
        {review && (
          <div className="space-y-4">
            {/* User Information */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="col-span-2">
                <p className="text-xs text-slate-500">User</p>
                <p className="text-sm font-medium">{review.user_name || review.user?.full_name || 'Unknown'}</p>
                <p className="text-xs text-slate-400">{review.user_email || review.user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">ID Type</p>
                <p className="text-sm font-medium">{review.id_type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Submitted</p>
                <p className="text-sm">{formatDate(review.submitted_at)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Status</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(review.status)}`}>
                  {review.status || 'pending'}
                </span>
              </div>
            </div>

            {/* Debug: Show all data */}
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300 mb-2">📋 Debug: All available fields</p>
              <pre className="text-xs overflow-auto max-h-40 bg-slate-100 dark:bg-slate-800 p-2 rounded">
                {JSON.stringify(review, null, 2)}
              </pre>
            </div>

            {/* Images - Show if any exist in the data */}
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <FiImage /> Verification Documents
              </p>
              
              {/* Check if any image fields exist in the data */}
              {Object.keys(review).some(key => 
                key.includes('image') || key.includes('photo') || key.includes('url')
              ) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.keys(review).map(key => {
                    if (key.includes('image') || key.includes('photo') || key.includes('url')) {
                      const value = review[key];
                      if (value && typeof value === 'string' && (value.startsWith('http') || value.startsWith('/'))) {
                        return (
                          <div key={key} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                            <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{key.replace(/_/g, ' ')}</span>
                              <a 
                                href={value.startsWith('http') ? value : `${API_BASE_URL}${value}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-brand hover:underline flex items-center gap-1"
                              >
                                <FiExternalLink className="w-3 h-3" /> Open
                              </a>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-2 min-h-[150px]">
                              <img 
                                src={value.startsWith('http') ? value : `${API_BASE_URL}${value}`}
                                alt={key} 
                                className="max-w-full max-h-48 object-contain"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="1"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpolyline points="21 15 16 10 5 21"%3E%3C/polyline%3E%3C/svg%3E';
                                  e.target.className = 'max-w-full max-h-48 object-contain opacity-50';
                                }}
                              />
                            </div>
                          </div>
                        );
                      }
                    }
                    return null;
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <FiImage className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No images found in the response data</p>
                  <p className="text-xs mt-1">The API does not include image URLs in the response.</p>
                </div>
              )}
            </div>

            {/* Review Form */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <p className="text-sm font-medium mb-3">Review Decision</p>
              <div className="space-y-3">
                <div>
                  <label className="label">Decision *</label>
                  <select 
                    value={form.status} 
                    onChange={(e) => setForm({ ...form, status: e.target.value })} 
                    className="input"
                  >
                    <option value="">Select...</option>
                    <option value="approved">Approve (grant verified badge)</option>
                    <option value="rejected">Reject</option>
                  </select>
                </div>
                {form.status === 'rejected' && (
                  <div>
                    <label className="label">Rejection Reason *</label>
                    <textarea 
                      value={form.rejection_reason} 
                      onChange={(e) => setForm({ ...form, rejection_reason: e.target.value })} 
                      className="input" 
                      rows="2"
                      placeholder="Explain why this verification request was rejected..."
                    />
                  </div>
                )}
                <div>
                  <label className="label">Admin Notes (internal)</label>
                  <textarea 
                    value={form.admin_notes} 
                    onChange={(e) => setForm({ ...form, admin_notes: e.target.value })} 
                    className="input" 
                    rows="2"
                    placeholder="Add internal notes for reference..."
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button 
                onClick={submitReview} 
                disabled={!form.status || reviewVerification.isPending} 
                className="btn-primary flex-1"
              >
                {reviewVerification.isPending ? 'Submitting...' : 'Submit Review'}
              </button>
              <button 
                onClick={() => setReview(null)} 
                className="btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}