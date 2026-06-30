// frontend/src/pages/admin/AdminCategoriesPage.jsx
/**
 * Admin categories management.
 */
import { useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiGrid, FiX } from 'react-icons/fi';
import { categoryAPI } from '../../api';
import { useCategories } from '../../hooks/queries';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Spinner, EmptyState, Modal } from '../../components/ui';

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    icon: '', 
    parent: null  // Changed from '' to null
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!form.name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    setSaving(true);
    try {
      // Prepare data - remove empty parent
      const dataToSend = { ...form };
      if (!dataToSend.parent) {
        delete dataToSend.parent;
      }
      
      if (editCat) {
        await categoryAPI.update(editCat.id, dataToSend);
        toast.success('Category updated successfully.');
      } else {
        await categoryAPI.create(dataToSend);
        toast.success('Category created successfully.');
      }
      
      setShowForm(false);
      setEditCat(null);
      setForm({ name: '', description: '', icon: '', parent: null });
      // Invalidate and refetch categories
      qc.invalidateQueries({ queryKey: ['categories'] });
      // Also refetch to show updated data immediately
      await qc.refetchQueries({ queryKey: ['categories'] });
    } catch (err) {
      console.error('Save category error:', err);
      console.error('Error response:', err.response?.data);
      
      // Try to get detailed error message
      let errorMsg = 'Failed to save category.';
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          const errors = Object.entries(err.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          errorMsg = errors || errorMsg;
        } else if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        }
      }
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Existing listings will keep their category but it will be hidden.')) return;
    try {
      await categoryAPI.delete(id);
      toast.success('Category deleted.');
      qc.invalidateQueries({ queryKey: ['categories'] });
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Cannot delete category with active listings.';
      toast.error(errorMsg);
    }
  };

  const openCreateForm = () => {
    setEditCat(null);
    setForm({ name: '', description: '', icon: '', parent: null });
    setShowForm(true);
  };

  const openEditForm = (category) => {
    setEditCat(category);
    setForm({ 
      name: category.name, 
      description: category.description || '', 
      icon: category.icon || '', 
      parent: category.parent || null 
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display font-bold text-2xl">Categories</h1>
        <button onClick={openCreateForm} className="btn-primary">
          <FiPlus /> New Category
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : !categories?.length ? (
        <EmptyState icon={FiGrid} title="No categories" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((c) => (
            <div key={c.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{c.icon} {c.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description || 'No description'}</p>
                  <p className="text-xs text-slate-400 mt-1">{c.product_count || 0} listings</p>
                  {c.custom_fields?.length > 0 && (
                    <p className="text-[10px] text-brand mt-1">{c.custom_fields.length} custom fields</p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEditForm(c)} className="btn-outline !p-2" title="Edit">
                    <FiEdit size={12} />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="btn-outline !p-2 text-red-600" title="Delete">
                    <FiTrash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editCat ? 'Edit Category' : 'New Category'}>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="label">Name *</label>
            <input 
              required 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              className="input" 
              placeholder="e.g., Electronics"
            />
          </div>
          <div>
            <label className="label">Icon (emoji or short text)</label>
            <input 
              value={form.icon} 
              onChange={(e) => setForm({ ...form, icon: e.target.value })} 
              className="input" 
              placeholder="📱" 
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              className="input" 
              rows="3" 
              placeholder="Brief description of the category..."
            />
          </div>
          <div>
            <label className="label">Parent Category (optional)</label>
            <select 
              value={form.parent || ''} 
              onChange={(e) => setForm({ ...form, parent: e.target.value || null })} 
              className="input"
            >
              <option value="">None (top-level)</option>
              {categories?.filter((c) => c.id !== editCat?.id).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button 
            type="submit" 
            disabled={saving} 
            className="btn-primary w-full"
          >
            {saving ? 'Saving...' : (editCat ? 'Update Category' : 'Create Category')}
          </button>
          {editCat && (
            <button 
              type="button" 
              onClick={() => setShowForm(false)} 
              className="btn-outline w-full"
            >
              Cancel
            </button>
          )}
        </form>
      </Modal>
    </div>
  );
}