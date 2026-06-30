// frontend/src/pages/VerificationPage.jsx
/**
 * Seller verification page - submit government ID + address.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiUpload, FiCheckCircle, FiClock, FiXCircle, FiInfo } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useMyVerifications, useSubmitVerification } from '../hooks/queries';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';

const ID_TYPES = [
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'pan', label: 'PAN Card' },
  { value: 'driving_license', label: 'Driving License' },
  { value: 'voter_id', label: 'Voter ID' },
  { value: 'passport', label: 'Passport' },
];

export default function VerificationPage() {
  const { user } = useAuth();
  const { data: verificationsData, isLoading } = useMyVerifications();
  const submit = useSubmitVerification();

  // Extract verifications from paginated response
  const verifications = verificationsData?.results || [];

  const [form, setForm] = useState({
    id_type: 'aadhaar',
    id_number: '',
    whatsapp_number: user?.whatsapp_number || user?.mobile_number || '',
    address_line1: '',
    address_line2: '',
    district: user?.district || '',
    state: user?.state || '',
    pincode: '',
    country: 'India',
  });
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const pending = verifications?.find((v) => v.status === 'pending');
  const approved = verifications?.find((v) => v.status === 'approved');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!frontImage) {
      toast.error('Front side of ID is required.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.append('id_front_image', frontImage);
      if (backImage) formData.append('id_back_image', backImage);
      if (selfieImage) formData.append('selfie_image', selfieImage);
      await submit.mutateAsync(formData);
      toast.success('Verification request submitted! Admin will review it shortly.');
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        Object.entries(errors).forEach(([k, v]) => toast.error(`${k}: ${Array.isArray(v) ? v.join(', ') : v}`));
      } else {
        toast.error('Failed to submit verification.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Already verified
  if (user?.verified_seller || approved) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Helmet><title>Verified Seller - Lintro</title></Helmet>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
            <FiShield className="text-blue-500" size={36} />
          </div>
          <h1 className="font-display font-bold text-2xl mb-2">Verified Seller</h1>
          <p className="text-slate-500 mb-2">Congratulations! You are a verified seller on Lintro.</p>
          {approved?.reviewed_at && (
            <p className="text-xs text-slate-400">Verified on {formatDate(approved.reviewed_at)}</p>
          )}
        </motion.div>
      </div>
    );
  }

  // Pending verification
  if (pending) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Helmet><title>Verification Pending - Lintro</title></Helmet>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
            <FiClock className="text-amber-500" size={36} />
          </div>
          <h1 className="font-display font-bold text-2xl mb-2">Verification Under Review</h1>
          <p className="text-slate-500">Your verification request submitted on {formatDate(pending.submitted_at)} is being reviewed by our admin team. You'll be notified once a decision is made.</p>
        </motion.div>
      </div>
    );
  }

  // Verification form
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Helmet><title>Get Verified - Lintro</title></Helmet>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl flex items-center gap-2">
          <FiShield className="text-brand" /> Seller Verification
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Get the Verified Seller badge to build trust with buyers.
        </p>
      </div>

      <div className="card p-4 mb-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <FiInfo className="text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-semibold">Why get verified?</p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
              <li>Verified badge displayed on all your listings</li>
              <li>Higher trust from buyers</li>
              <li>Priority in search results (Verified Seller filter)</li>
              <li>Faster buy request responses</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-4 space-y-4">
        <div>
          <label className="label">Government ID Type *</label>
          <select value={form.id_type} onChange={(e) => setForm({ ...form, id_type: e.target.value })} className="input" required>
            {ID_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">ID Number (optional)</label>
          <input value={form.id_number} onChange={(e) => setForm({ ...form, id_number: e.target.value })} className="input" placeholder="Enter your ID number" />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Front Side *</label>
            <ImageInput label="Upload front" file={frontImage} onChange={setFrontImage} />
          </div>
          <div>
            <label className="label">Back Side</label>
            <ImageInput label="Upload back" file={backImage} onChange={setBackImage} />
          </div>
          <div>
            <label className="label">Selfie with ID</label>
            <ImageInput label="Upload selfie" file={selfieImage} onChange={setSelfieImage} />
          </div>
        </div>
        <div>
          <label className="label">WhatsApp Number *</label>
          <input required value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} className="input" />
        </div>
        <div>
          <label className="label">Address Line 1 *</label>
          <input required value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} className="input" />
        </div>
        <div>
          <label className="label">Address Line 2</label>
          <input value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} className="input" />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="label">District *</label>
            <input required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">State *</label>
            <input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Pincode *</label>
            <input required pattern="[0-9]{6}" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="input" />
          </div>
        </div>
        <div className="alert-warn text-xs">
          Your documents are confidential and only visible to admin reviewers. They will not be shown to other users.
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Submitting...' : 'Submit Verification Request'}
        </button>
      </form>

      {verifications?.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Previous Requests</h3>
          <div className="space-y-2">
            {verifications.map((v) => (
              <div key={v.id} className="card p-3 flex items-center justify-between text-sm">
                <span>{formatDate(v.submitted_at)}</span>
                <span className={`badge ${
                  v.status === 'approved' ? 'badge-available' :
                  v.status === 'rejected' ? 'badge-sold' : 'badge-pending'
                }`}>{v.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ImageInput({ label, file, onChange }) {
  return (
    <label className="block cursor-pointer">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files[0])}
      />
      <div className="aspect-square border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center hover:border-brand relative overflow-hidden">
        {file ? (
          <>
            <img src={URL.createObjectURL(file)} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <FiCheckCircle className="text-white" size={24} />
            </div>
          </>
        ) : (
          <>
            <FiUpload className="text-slate-400 mb-1" />
            <span className="text-xs text-slate-500">{label}</span>
          </>
        )}
      </div>
    </label>
  );
}