/**
 * Sell page - create a new listing with multi-image upload + dynamic category fields.
 */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import {
  FiUpload, FiX, FiMapPin, FiImage, FiAlertCircle, FiLoader, FiCheck,
} from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useCategories, useCreateProduct } from '../hooks/queries';
import { useAuth } from '../context/AuthContext';
import { getUserLocation, formatPrice } from '../utils/helpers';

const MAX_IMAGES = 5;

export default function SellPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: categoriesResponse } = useCategories();

  const categories = Array.isArray(categoriesResponse)
    ? categoriesResponse
    : categoriesResponse?.results || [];
    const createProduct = useCreateProduct();

  const [form, setForm] = useState({
    title: '', description: '', price: '', negotiable: true,
    condition: 'good', category_id: '',
    location_name: '', district: user?.district || '', state: user?.state || '',
    country: 'India', latitude: '', longitude: '',
    custom_fields: {},
  });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const selectedCategory = useMemo(
    () => categories?.find((c) => c.id === form.category_id),
    [categories, form.category_id]
  );

  const onDrop = (accepted) => {
    const remaining = MAX_IMAGES - images.length;
    if (accepted.length > remaining) {
      toast.error(`You can only upload ${remaining} more image(s).`);
    }
    const newImages = accepted.slice(0, remaining).map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    setImages((prev) => [...prev, ...newImages]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
    maxSize: 8 * 1024 * 1024,
    maxFiles: MAX_IMAGES,
  });

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleLocation = async () => {
    try {
      const { latitude, longitude } = await getUserLocation();
      setForm((f) => ({ ...f, latitude: latitude.toString(), longitude: longitude.toString() }));
      toast.success('Location captured.');
    } catch (err) {
      toast.error('Could not get your location.');
    }
  };

  const handleCustomField = (name, value) => {
    setForm((f) => ({
      ...f,
      custom_fields: { ...f.custom_fields, [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length < 1) {
      toast.error('Please upload at least 1 image.');
      return;
    }
    if (images.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('negotiable', form.negotiable);
      formData.append('condition', form.condition);
      formData.append('category_id', form.category_id);
      formData.append('location_name', form.location_name);
      formData.append('district', form.district);
      formData.append('state', form.state);
      formData.append('country', form.country);
      if (form.latitude) formData.append('latitude', form.latitude);
      if (form.longitude) formData.append('longitude', form.longitude);
      formData.append('custom_fields', JSON.stringify(form.custom_fields));
      images.forEach((img) => formData.append('images', img));

      const res = await createProduct.mutateAsync(formData);
      toast.success('Listing published successfully!');
      navigate(`/product/${res.data.slug}`);
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        Object.entries(errors).forEach(([k, v]) => {
          const msg = Array.isArray(v) ? v.join(', ') : String(v);
          toast.error(`${k}: ${msg}`);
        });
      } else {
        toast.error('Failed to create listing.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Helmet><title>Sell an Item - Lintro</title></Helmet>
      <h1 className="font-display font-bold text-2xl md:text-3xl mb-1">Sell an Item</h1>
      <p className="text-sm text-slate-500 mb-6">List your item for thousands of buyers across India to see.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Images */}
        <div className="card p-4">
          <h3 className="font-semibold mb-2">Photos (1-{MAX_IMAGES} required) *</h3>
          <p className="text-xs text-slate-500 mb-3">
            Images are automatically resized, compressed, and converted to WebP format.
          </p>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-brand bg-brand/5' : 'border-slate-300 dark:border-slate-700'
            }`}
          >
            <input {...getInputProps()} />
            <FiUpload className="mx-auto text-slate-400 mb-2" size={28} />
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {isDragActive ? 'Drop images here' : 'Drag & drop images, or click to browse'}
            </p>
            <p className="text-xs text-slate-400 mt-1">JPEG, PNG, WebP up to 8MB each</p>
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 badge bg-brand text-white">Cover</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Basic info */}
        <div className="card p-4 space-y-3">
          <h3 className="font-semibold">Listing Details</h3>
          <div>
            <label className="label">Title *</label>
            <input
              required
              maxLength="200"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input"
              placeholder="e.g., iPhone 12 - 64GB - Excellent Condition"
            />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea
              required
              rows="5"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input"
              placeholder="Describe your item's condition, age, usage, accessories included, etc."
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Category *</label>
              <select
                required
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value, custom_fields: {} })}
                className="input"
              >
                <option value="">Select category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Condition *</label>
              <select
                required
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="input"
              >
                <option value="new">Brand New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="defective">Defective</option>
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Price (₹) *</label>
              <input
                required
                type="number"
                min="1"
                step="1"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input"
                placeholder="9999"
              />
              {form.price && (
                <p className="text-xs text-slate-500 mt-1">Preview: {formatPrice(form.price)}</p>
              )}
            </div>
            <div>
              <label className="label">Negotiable</label>
              <select
                value={form.negotiable}
                onChange={(e) => setForm({ ...form, negotiable: e.target.value === 'true' })}
                className="input"
              >
                <option value="true">Yes, price is negotiable</option>
                <option value="false">No, fixed price</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic category fields */}
        {selectedCategory?.custom_fields?.length > 0 && (
          <div className="card p-4 space-y-3">
            <h3 className="font-semibold">{selectedCategory.name} Specifications</h3>
            <p className="text-xs text-slate-500">Fill in details specific to this category.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {selectedCategory.custom_fields.map((field) => (
                <div key={field.id}>
                  <label className="label">
                    {field.label}
                    {field.is_required && <span className="text-red-500"> *</span>}
                    {field.unit && <span className="text-xs text-slate-400"> ({field.unit})</span>}
                  </label>
                  {field.field_type === 'choice' ? (
                    <select
                      required={field.is_required}
                      value={form.custom_fields[field.name] || ''}
                      onChange={(e) => handleCustomField(field.name, e.target.value)}
                      className="input"
                    >
                      <option value="">Select...</option>
                      {field.choices?.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : field.field_type === 'boolean' ? (
                    <select
                      required={field.is_required}
                      value={form.custom_fields[field.name] || ''}
                      onChange={(e) => handleCustomField(field.name, e.target.value === 'true')}
                      className="input"
                    >
                      <option value="">Select...</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <input
                      type={field.field_type === 'number' ? 'number' : 'text'}
                      required={field.is_required}
                      value={form.custom_fields[field.name] || ''}
                      onChange={(e) => handleCustomField(field.name, e.target.value)}
                      className="input"
                      placeholder={field.label}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Location</h3>
            <button type="button" onClick={handleLocation} className="btn-outline !py-1 text-xs">
              <FiMapPin /> Use my location
            </button>
          </div>
          <div>
            <label className="label">Area / Locality *</label>
            <input
              required
              value={form.location_name}
              onChange={(e) => setForm({ ...form, location_name: e.target.value })}
              className="input"
              placeholder="e.g., Vellakoil"
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="label">District *</label>
              <input
                required
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="input"
                placeholder="Tirupur"
              />
            </div>
            <div>
              <label className="label">State *</label>
              <input
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="input"
                placeholder="TamilNadu"
              />
            </div>
            <div>
              <label className="label">Country *</label>
              <input
                required
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="input"
              />
            </div>
          </div>
          {(form.latitude && form.longitude) && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <FiCheck /> GPS coordinates captured: {form.latitude}, {form.longitude}
            </p>
          )}
        </div>

        <div className="alert-warn text-xs">
          <FiAlertCircle className="inline mr-1" />
          By posting, you agree to respond to buy requests within 24 hours. Listings inactive for 7 days after unlisting will be archived.
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full text-base py-3"
        >
          {submitting ? <><FiLoader className="animate-spin" /> Publishing...</> : 'Publish Listing'}
        </button>
      </form>
    </div>
  );
}
