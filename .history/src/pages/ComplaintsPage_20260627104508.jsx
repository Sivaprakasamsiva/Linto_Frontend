/**
 * Complaints page - file a complaint + view own complaints.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiFlag, FiAlertCircle, FiUpload } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useMyComplaints, useCreateComplaint } from '../hooks/queries';
import { useAuth } from '../context/AuthContext';
import { formatDate, getStatusLabel } from '../utils/helpers';

const CATEGORIES = [
  { value: 'fraud', label: 'Fraud / Scam' },
  { value: 'fake_product', label: 'Fake Product' },
  { value: 'abuse', label: 'Abusive Behaviour' },
  { value: 'spam', label: 'Spam Listing' },
  { value: 'prohibited', label: 'Prohibited Item' },
  { value: 'other', label: 'Other' },
];

export default function ComplaintsPage() {
  const { user } = useAuth();
  const { data: complaints, isLoading } = useMyComplaints();
  const create = useCreateComplaint();
  const [form, setForm] = useState({
    reported_user: '',
    product: '',
    category: 'fraud',
    description: '',
  });
  const [evidence, setEvidence] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.reported_user) {
      toast.error('Please enter the user ID of the person you are reporting.');
      return;
    }
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => v && formData.append(k, v));
    if (evidence) formData.append('evidence_image', evidence);
    try {
      await create.mutateAsync(formData);
      toast.success('Complaint filed. Our admin team will review it.');
      setShowForm(false);
      setForm({ reported_user: '', product: '', category: 'fraud', description: '' });
      setEvidence(null);
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        Object.entries(errors).forEach(([k, v]) => toast.error(`${k}: ${Array.isArray(v) ? v.join(', ') : v}`));
      } else {
        toast.error('Failed to file complaint.');
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Helmet><title>File a Complaint - Lintro</title></Helmet>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl flex items-center gap-2">
            <FiFlag className="text-red-500" /> Complaints
          </h1>
          <p className="text-sm text-slate-500">Report fraud, fake products, abuse, or spam</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'File Complaint'}
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleSubmit}
          className="card p-4 space-y-3 mb-6"
        >
          <div className="alert-warn text-xs">
            <FiAlertCircle className="inline mr-1" />
            Provide accurate information. False complaints may result in account action.
          </div>
          <div>
            <label className="label">Reported User ID *</label>
            <input
              required
              value={form.reported_user}
              onChange={(e) => setForm({ ...form, reported_user: e.target.value })}
              className="input"
              placeholder="UUID of the user you're reporting"
            />
            <p className="text-xs text-slate-400 mt-1">Found on the seller info section of any listing.</p>
          </div>
          <div>
            <label className="label">Related Product ID (optional)</label>
            <input
              value={form.product}
              onChange={(e) => setForm({ ...form, product: e.target.value })}
              className="input"
              placeholder="UUID of the product (if applicable)"
            />
          </div>
          <div>
            <label className="label">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input"
            >
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea
              required
              minLength="20"
              rows="4"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input"
              placeholder="Describe what happened in detail..."
            />
          </div>
          <div>
            <label className="label">Evidence Image (optional)</label>
            <label className="btn-outline cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setEvidence(e.target.files[0])}
              />
              <FiUpload /> {evidence ? evidence.name : 'Upload screenshot'}
            </label>
          </div>
          <button type="submit" disabled={create.isPending} className="btn-primary w-full">
            {create.isPending ? 'Filing...' : 'File Complaint'}
          </button>
        </motion.form>
      )}

      <h3 className="font-semibold mb-2">My Filed Complaints</h3>
      {isLoading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : !complaints?.results?.length ? (
        <p className="text-sm text-slate-500">You haven't filed any complaints.</p>
      ) : (
        <div className="space-y-2">
          {complaints.results.map((c) => (
            <div key={c.id} className="card p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="badge bg-slate-100 dark:bg-slate-800">{c.category}</span>
                <span className="text-xs text-slate-500">{formatDate(c.created_at)}</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{c.description}</p>
              <p className="text-xs text-slate-500 mt-1">Status: <span className="font-medium">{getStatusLabel(c.status)}</span></p>
              {c.resolution && <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Resolution: {c.resolution}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
