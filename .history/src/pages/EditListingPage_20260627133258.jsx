// frontend/src/pages/EditListingPage.jsx
/**
 * Edit listing page.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiLoader } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useProductDetail, useUpdateProduct, useCategories } from '../hooks/queries';
import { useDropzone } from 'react-dropzone';

export default function EditListingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProductDetail(slug);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const updateProduct = useUpdateProduct();
  const [form, setForm] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product && categories) {
      console.log('Product data:', product);
      console.log('Categories:', categories);
      
      // Find the category ID from the product data
      let categoryId = '';
      
      // Try different ways to get the category ID
      if (product.category_id) {
        categoryId = product.category_id;
      } else if (product.category && typeof product.category === 'object') {
        categoryId = product.category.id || '';
      } else if (product.category && typeof product.category === 'string') {
        categoryId = product.category;
      } else if (product.category_name) {
        // Try to find category by name
        const foundCategory = categories.find(c => c.name === product.category_name);
        if (foundCategory) {
          categoryId = foundCategory.id;
        }
      }
      
      // Verify the category exists and is active
      const categoryExists = categories.some(c => c.id === categoryId);
      if (!categoryExists && categoryId) {
        console.warn('Category ID not found in categories list:', categoryId);
        // Try to find by name as fallback
        if (product.category_name) {
          const foundCategory = categories.find(c => c.name === product.category_name);
          if (foundCategory) {
            categoryId = foundCategory.id;
            console.log('Found category by name:', foundCategory.name, foundCategory.id);
          }
        }
      }
      
      console.log('Final category ID:', categoryId);
      
      setForm({
        title: product.title || '',
        description: product.description || '',
        price: product.price || 0,
        negotiable: product.negotiable !== undefined ? product.negotiable : true,
        condition: product.condition || 'good',
        category_id: categoryId,
        location_name: product.location_name || '',
        district: product.district || '',
        state: product.state || '',
        country: product.country || 'India',
        latitude: product.latitude || '',
        longitude: product.longitude || '',
        custom_fields: product.custom_fields || {},
      });
    }
  }, [product, categories]);

  const onDrop = (accepted) => {
    setNewImages((prev) => [...prev, ...accepted.slice(0, 5 - prev.length).map((f) => Object.assign(f, { preview: URL.createObjectURL(f) }))]);
  };
  
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
    maxFiles: 5,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!form.title?.trim()) {
        toast.error('Title is required');
        setIsSubmitting(false);
        return;
      }
      if (!form.description?.trim()) {
        toast.error('Description is required');
        setIsSubmitting(false);
        return;
      }
      if (!form.price || form.price <= 0) {
        toast.error('Price must be greater than 0');
        setIsSubmitting(false);
        return;
      }
      
      // Validate category exists in the current list
      if (!form.category_id) {
        toast.error('Please select a category');
        setIsSubmitting(false);
        return;
      }
      
      const categoryExists = categories?.some(c => c.id === form.category_id);
      if (!categoryExists) {
        toast.error('Selected category is invalid or inactive. Please select a valid category.');
        setIsSubmitting(false);
        return;
      }

      // Create FormData
      const formData = new FormData();
      
      // Add all form fields
      const fieldsToSend = {
        title: form.title,
        description: form.description,
        price: String(form.price),
        negotiable: String(form.negotiable),
        condition: form.condition,
        category_id: form.category_id, // Try 'category' instead of 'category_id'
        location_name: form.location_name || '',
        district: form.district || '',
        state: form.state || '',
        country: form.country || 'India',
        custom_fields: JSON.stringify(form.custom_fields || {}),
      };
      
      // Add latitude and longitude if they exist
      if (form.latitude) fieldsToSend.latitude = String(form.latitude);
      if (form.longitude) fieldsToSend.longitude = String(form.longitude);
      
      Object.entries(fieldsToSend).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      });

      // Add new images if any
      if (newImages.length > 0) {
        newImages.forEach((img) => {
          formData.append('images', img);
        });
      }

      console.log('Submitting form data:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      await updateProduct.mutateAsync({ 
        slug, 
        data: formData 
      });
      
      toast.success('Listing updated successfully!');
      navigate(`/product/${slug}`);
    } catch (err) {
      console.error('Update error:', err);
      
      let errorMessage = 'Failed to update listing.';
      
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error status:', err.response.status);
        
        if (err.response.data) {
          if (typeof err.response.data === 'object') {
            const errors = [];
            Object.entries(err.response.data).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                errors.push(`${key}: ${value.join(', ')}`);
              } else if (typeof value === 'string') {
                errors.push(`${key}: ${value}`);
              } else {
                errors.push(`${key}: ${JSON.stringify(value)}`);
              }
            });
            errorMessage = errors.join('; ');
          } else if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          }
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !form || categoriesLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="skeleton h-96" />
      </div>
    );
  }

  // Get the current category name for display
  const currentCategory = categories?.find(c => c.id === form.category_id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Helmet><title>Edit Listing - Lintro</title></Helmet>
      <h1 className="font-display font-bold text-2xl mb-6">Edit Listing</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card p-4 space-y-3">
          {/* Title */}
          <div>
            <label className="label">Title *</label>
            <input 
              value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })} 
              className="input" 
              required 
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Description *</label>
            <textarea 
              rows="5" 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              className="input" 
              required 
            />
          </div>

          {/* Price and Condition */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Price (₹) *</label>
              <input 
                type="number" 
                min="1"
                step="0.01"
                value={form.price} 
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} 
                className="input" 
                required 
              />
            </div>
            <div>
              <label className="label">Condition *</label>
              <select 
                value={form.condition} 
                onChange={(e) => setForm({ ...form, condition: e.target.value })} 
                className="input"
                required
              >
                <option value="new">Brand New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="defective">Defective</option>
              </select>
            </div>
          </div>

          {/* Category and Negotiable */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Category *</label>
              <select 
                value={form.category_id || ''} 
                onChange={(e) => setForm({ ...form, category_id: e.target.value })} 
                className="input"
                required
              >
                <option value="">Select Category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {currentCategory && (
                <p className="text-xs text-green-600 mt-1">
                  Current category: {currentCategory.name}
                </p>
              )}
              {form.category_id && !currentCategory && (
                <p className="text-xs text-red-600 mt-1">
                  Warning: Selected category is not valid. Please select a new category.
                </p>
              )}
            </div>
            <div>
              <label className="label">Negotiable</label>
              <select 
                value={String(form.negotiable)} 
                onChange={(e) => setForm({ ...form, negotiable: e.target.value === 'true' })} 
                className="input"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card p-4">
          <h3 className="font-semibold mb-2">Images</h3>
          {product.images && product.images.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {product.images.map((img) => (
                <img 
                  key={img.id} 
                  src={img.image_url} 
                  alt="" 
                  className="aspect-square rounded-lg object-cover" 
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No images</p>
          )}
          
          <p className="text-xs text-slate-500 mt-3">Upload new images to add or replace existing ones (optional).</p>
          <div {...getRootProps()} className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer mt-2 hover:border-brand transition-colors">
            <input {...getInputProps()} />
            <p className="text-sm text-slate-500">
              {newImages.length > 0 ? `${newImages.length} images selected` : 'Click or drop new images'}
            </p>
          </div>
          {newImages.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
              {newImages.map((img, i) => (
                <div key={i} className="relative">
                  <img 
                    src={img.preview} 
                    alt="" 
                    className="aspect-square rounded-lg object-cover" 
                  />
                  <button
                    type="button"
                    onClick={() => setNewImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="card p-4 space-y-3">
          <h3 className="font-semibold">Location</h3>
          <div>
            <label className="label">Area / Locality</label>
            <input 
              value={form.location_name} 
              onChange={(e) => setForm({ ...form, location_name: e.target.value })} 
              className="input" 
              placeholder="e.g., Indiranagar, Koramangala"
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="label">District *</label>
              <input 
                value={form.district} 
                onChange={(e) => setForm({ ...form, district: e.target.value })} 
                className="input" 
                placeholder="District" 
                required 
              />
            </div>
            <div>
              <label className="label">State *</label>
              <input 
                value={form.state} 
                onChange={(e) => setForm({ ...form, state: e.target.value })} 
                className="input" 
                placeholder="State" 
                required 
              />
            </div>
            <div>
              <label className="label">Country</label>
              <input 
                value={form.country} 
                onChange={(e) => setForm({ ...form, country: e.target.value })} 
                className="input" 
                placeholder="Country" 
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={updateProduct.isPending || isSubmitting} 
          className="btn-primary w-full py-3"
        >
          {(updateProduct.isPending || isSubmitting) ? (
            <><FiLoader className="animate-spin inline mr-2" /> Saving...</>
          ) : (
            <><FiSave className="inline mr-2" /> Save Changes</>
          )}
        </button>
      </form>
    </div>
  );
}