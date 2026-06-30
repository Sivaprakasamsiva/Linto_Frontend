/**
 * Profile page - view/edit own profile, change password.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiLock, FiCheckCircle } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { profileAPI, authAPI } from '../api';
import { formatDate, getUserLocation, getInitials } from '../utils/helpers';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    mobile_number: user?.mobile_number || '',
    whatsapp_number: user?.whatsapp_number || '',
    bio: user?.bio || '',
    address: user?.address || '',
    district: user?.district || '',
    state: user?.state || '',
    country: user?.country || 'India',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [saving, setSaving] = useState(false);

  // Password change
  const [pwd, setPwd] = useState({ old_password: '', new_password: '' });
  const [savingPwd, setSavingPwd] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (profileImage) formData.append('profile_image', profileImage);
      const res = await profileAPI.updateMe(formData);
      updateUser(res.data);
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLocation = async () => {
    try {
      const { latitude, longitude } = await getUserLocation();
      // Save location through a separate API call
      const formData = new FormData();
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (profileImage) formData.append('profile_image', profileImage);
      const res = await profileAPI.updateMe(formData);
      updateUser(res.data);
      toast.success('Location captured and saved.');
    } catch (err) {
      toast.error('Could not get location.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSavingPwd(true);
    try {
      await authAPI.changePassword(pwd);
      toast.success('Password changed successfully.');
      setPwd({ old_password: '', new_password: '' });
    } catch (err) {
      const errors = err.response?.data;
      if (errors?.new_password) toast.error(errors.new_password.join(', '));
      else if (errors?.old_password) toast.error(errors.old_password.join(', '));
      else toast.error('Failed to change password.');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Helmet><title>My Profile - Lintro</title></Helmet>
      <h1 className="font-display font-bold text-2xl mb-6">My Profile</h1>

      <div className="card p-4 mb-6 flex items-center gap-4">
        {user?.profile_image ? (
          <img src={user.profile_image} alt="" className="w-20 h-20 rounded-full object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-brand text-white flex items-center justify-center text-2xl font-bold">
            {getInitials(user?.full_name)}
          </div>
        )}
        <div>
          <h2 className="font-semibold text-lg flex items-center gap-2">
            {user?.full_name}
            {user?.verified_seller && (
              <span className="badge-verified flex items-center gap-1">
                <FiCheckCircle size={10} /> Verified Seller
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <p className="text-xs text-slate-400">Member since {formatDate(user?.joined_date)}</p>
          {!user?.verified_seller && (
            <a href="/verification" className="text-xs text-brand hover:underline mt-1 inline-block">
              Apply for seller verification →
            </a>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="card p-4 space-y-4 mb-6">
        <h3 className="font-semibold">Personal Information</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            {user?.profile_image && !profileImage ? (
              <img src={user.profile_image} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : profileImage ? (
              <img src={URL.createObjectURL(profileImage)} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <FiUser className="text-slate-400" />
              </div>
            )}
          </div>
          <label className="btn-outline cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setProfileImage(e.target.files[0])}
            />
            Change Photo
          </label>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Full Name</label>
            <input name="full_name" value={form.full_name} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="label">Email (cannot change)</label>
            <input value={user?.email || ''} disabled className="input opacity-60" />
          </div>
          <div>
            <label className="label">Mobile Number</label>
            <input name="mobile_number" value={form.mobile_number} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="label">WhatsApp Number</label>
            <input name="whatsapp_number" value={form.whatsapp_number} onChange={handleChange} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea name="bio" rows="2" value={form.bio} onChange={handleChange} className="input" />
        </div>
        <div>
          <label className="label">Address</label>
          <textarea name="address" rows="2" value={form.address} onChange={handleChange} className="input" />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="label">District</label>
            <input name="district" value={form.district} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="label">State</label>
            <input name="state" value={form.state} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="label">Country</label>
            <input name="country" value={form.country} onChange={handleChange} className="input" />
          </div>
        </div>
        <button type="button" onClick={handleLocation} className="btn-outline text-sm">
          <FiMapPin /> Capture my GPS location
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <form onSubmit={handleChangePassword} className="card p-4 space-y-3">
        <h3 className="font-semibold">Change Password</h3>
        <div>
          <label className="label">Current Password</label>
          <input type="password" required value={pwd.old_password} onChange={(e) => setPwd({ ...pwd, old_password: e.target.value })} className="input" />
        </div>
        <div>
          <label className="label">New Password</label>
          <input type="password" required minLength="8" value={pwd.new_password} onChange={(e) => setPwd({ ...pwd, new_password: e.target.value })} className="input" />
          <p className="text-xs text-slate-400 mt-1">Min 8 characters, mix of letters and numbers recommended.</p>
        </div>
        <button type="submit" disabled={savingPwd} className="btn-secondary">
          <FiLock /> {savingPwd ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
