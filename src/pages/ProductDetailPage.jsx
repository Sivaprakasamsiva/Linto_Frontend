/**
 * Complaints page - file a complaint + view own complaints.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiFlag, FiAlertCircle, FiUpload, FiXCircle, FiChevronLeft, FiUser, FiCheck, FiInfo, FiCopy, FiCheckCircle, FiSearch } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMyComplaints, useCreateComplaint, useProducts, useProductDetail } from '../hooks/queries';
import { useAuth } from '../context/AuthContext';
import { formatDate, getStatusLabel, getInitials } from '../utils/helpers';
import BottomNav from '../components/layout/BottomNav';

const CATEGORIES = [
  { value: 'fraud', label: 'Fraud / Scam' },
  { value: 'fake_product', label: 'Fake Product' },
  { value: 'abuse', label: 'Abusive Behaviour' },
  { value: 'spam', label: 'Spam Listing' },
  { value: 'prohibited', label: 'Prohibited Item' },
  { value: 'other', label: 'Other' },
];

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ComplaintsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: complaints, isLoading } = useMyComplaints();
  const create = useCreateComplaint();
  
  // Get product ID and user ID from URL params
  const productId = searchParams.get('product');
  const reportedUserId = searchParams.get('user');
  
  const [form, setForm] = useState({
    reported_user: reportedUserId || '',
    product: productId || '',
    category: 'fraud',
    description: '',
  });
  const [evidence, setEvidence] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isValidatingUser, setIsValidatingUser] = useState(false);
  const [userValidationStatus, setUserValidationStatus] = useState(null);
  const [copied, setCopied] = useState(false);
  const [exampleId] = useState('123e4567-e89b-12d3-a456-426614174000');
  
  // User dropdown states
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const dropdownRef = useRef(null);

  // Get product detail if productId is provided
  const { data: productDetail } = useProductDetail(productId);

  // Use products hook for product search
  const { data: productData, isLoading: productsLoading } = useProducts(
    productSearch && productSearch.length >= 2 ? { search: productSearch, limit: 5 } : null
  );

  // Auto-fill product if productId is provided
  useEffect(() => {
    if (productDetail && productId) {
      setSelectedProduct(productDetail);
      setProductSearch(productDetail.title);
      setForm(prev => ({ ...prev, product: productId }));
    }
  }, [productDetail, productId]);

  // Auto-validate and select user if reportedUserId is provided
  useEffect(() => {
    if (reportedUserId) {
      // Check if it's a UUID or numeric ID
      if (UUID_REGEX.test(reportedUserId) || /^\d+$/.test(reportedUserId)) {
        fetchUserById(reportedUserId);
      }
    }
  }, [reportedUserId]);

  // Fetch all users on component mount
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (userSearchTerm.trim()) {
      const filtered = allUsers.filter(u => 
        (u.full_name && u.full_name.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
        (u.username && u.username.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
        (u.id && u.id.toLowerCase().includes(userSearchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
      setShowUserDropdown(true);
    } else {
      setFilteredUsers([]);
      setShowUserDropdown(false);
    }
  }, [userSearchTerm, allUsers]);

  // Fetch all users from API
  const fetchAllUsers = async () => {
    setIsLoadingUsers(true);
    try {
      // Try multiple endpoints to get users
      let users = [];
      
      // Try the admin users endpoint first
      try {
        const response = await fetch('/api/admin/users/');
        if (response.ok) {
          const data = await response.json();
          users = data.results || data || [];
        }
      } catch (e) {
        console.log('Admin users endpoint not available');
      }

      // If no users found, try the users endpoint
      if (users.length === 0) {
        try {
          const response = await fetch('/api/users/');
          if (response.ok) {
            const data = await response.json();
            users = data.results || data || [];
          }
        } catch (e) {
          console.log('Users endpoint not available');
        }
      }

      // If still no users, create a fallback with the current user
      if (users.length === 0 && user) {
        users = [{
          id: user.id,
          full_name: user.full_name,
          username: user.username,
          email: user.email,
          profile_image: user.profile_image
        }];
      }

      setAllUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback: add current user if available
      if (user) {
        setAllUsers([{
          id: user.id,
          full_name: user.full_name,
          username: user.username,
          email: user.email,
          profile_image: user.profile_image
        }]);
      }
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Fetch a single user by ID
  const fetchUserById = async (userId) => {
    setIsValidatingUser(true);
    try {
      const response = await fetch(`/api/users/${userId}/`);
      if (response.ok) {
        const userData = await response.json();
        setSelectedUser(userData);
        setForm(prev => ({ ...prev, reported_user: userData.id }));
        setUserSearchTerm(userData.full_name || userData.username || userData.email || userData.id);
        setUserValidationStatus({ 
          valid: true, 
          message: `✓ User found: ${userData.full_name || userData.username || 'User'}`,
          user: userData,
          type: 'success'
        });
        return true;
      } else {
        setUserValidationStatus({ 
          valid: false, 
          message: '✗ User not found. Please select from the dropdown.',
          type: 'error'
        });
        return false;
      }
    } catch (error) {
      setUserValidationStatus({ 
        valid: false, 
        message: '✗ Error validating user. Please try again.',
        type: 'error'
      });
      return false;
    } finally {
      setIsValidatingUser(false);
    }
  };

  // Handle user selection from dropdown
  const handleSelectUser = (selectedUserData) => {
    setSelectedUser(selectedUserData);
    setForm(prev => ({ ...prev, reported_user: selectedUserData.id }));
    setUserSearchTerm(selectedUserData.full_name || selectedUserData.username || selectedUserData.email || selectedUserData.id);
    setUserValidationStatus({ 
      valid: true, 
      message: `✓ User selected: ${selectedUserData.full_name || selectedUserData.username || 'User'}`,
      user: selectedUserData,
      type: 'success'
    });
    setShowUserDropdown(false);
    setFilteredUsers([]);
  };

  // Handle user search input change
  const handleUserSearchChange = (e) => {
    const value = e.target.value;
    setUserSearchTerm(value);
    setSelectedUser(null);
    setUserValidationStatus(null);
    setForm(prev => ({ ...prev, reported_user: '' }));
    
    // If user clears the input, hide dropdown
    if (!value.trim()) {
      setShowUserDropdown(false);
      setFilteredUsers([]);
    }
  };

  // Clear selected user
  const clearSelectedUser = () => {
    setSelectedUser(null);
    setUserSearchTerm('');
    setForm(prev => ({ ...prev, reported_user: '' }));
    setUserValidationStatus(null);
    setShowUserDropdown(false);
    setFilteredUsers([]);
  };

  // Check if user ID is valid
  const isUserIdValid = userValidationStatus?.valid === true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate reported user
    const trimmedId = form.reported_user.trim();
    if (!trimmedId) {
      toast.error('Please select a user to report.');
      return;
    }

    // Check if it's a valid UUID or numeric ID
    if (!UUID_REGEX.test(trimmedId) && !/^\d+$/.test(trimmedId)) {
      toast.error('Please select a valid user from the dropdown.');
      return;
    }

    // Validate the user exists
    if (!selectedUser && !userValidationStatus?.valid) {
      const isValid = await fetchUserById(trimmedId);
      if (!isValid) {
        toast.error('User not found. Please select from the dropdown.');
        return;
      }
    }

    if (!form.description.trim() || form.description.trim().length < 20) {
      toast.error('Please provide a detailed description (minimum 20 characters).');
      return;
    }

    const formData = new FormData();
    formData.append('reported_user', trimmedId);
    formData.append('category', form.category);
    formData.append('description', form.description.trim());
    
    if (selectedProduct?.id) {
      formData.append('product', selectedProduct.id);
    }
    
    if (evidence) {
      formData.append('evidence_image', evidence);
    }

    try {
      await create.mutateAsync(formData);
      toast.success('Complaint filed successfully. Our admin team will review it.');
      setShowForm(false);
      setForm({ reported_user: '', product: '', category: 'fraud', description: '' });
      setSelectedProduct(null);
      setProductSearch('');
      setEvidence(null);
      setUserValidationStatus(null);
      setSelectedUser(null);
      setUserSearchTerm('');
      setFilteredUsers([]);
      setShowUserDropdown(false);
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        if (typeof errors === 'object') {
          Object.entries(errors).forEach(([k, v]) => {
            const message = Array.isArray(v) ? v.join(', ') : v;
            toast.error(`${k}: ${message}`);
          });
        } else {
          toast.error(errors || 'Failed to file complaint.');
        }
      } else {
        toast.error('Failed to file complaint. Please try again.');
      }
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Get status label and color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      reviewing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      closed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return colors[status] || colors.pending;
  };

  // Get product results from useProducts
  const getProductResults = () => {
    if (!productData?.results) return [];
    return productData.results;
  };

  return (
    <>
      <Helmet><title>File a Complaint - Lintro</title></Helmet>
      
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center justify-between flex-1">
              <div>
                <h1 className="font-display font-bold text-2xl flex items-center gap-2">
                  <FiFlag className="text-red-500" /> Complaints
                </h1>
                <p className="text-sm text-slate-500">Report fraud, fake products, abuse, or spam</p>
              </div>
              <button onClick={() => setShowForm(!showForm)} className="btn-primary whitespace-nowrap">
                {showForm ? 'Cancel' : 'File Complaint'}
              </button>
            </div>
          </div>

          {/* Quick action notice if user came from product page */}
          {reportedUserId && selectedUser && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                <FiCheck className="w-4 h-4" />
                <span>
                  <strong>Quick action:</strong> User has been pre-filled from the product page.
                  {productDetail && (
                    <span> Product: <strong>{productDetail.title}</strong></span>
                  )}
                </span>
              </p>
            </div>
          )}

          {/* Complaint Form */}
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

              {/* Reported User - Dropdown with search */}
              <div>
                <label className="label">Reported User *</label>
                <div className="space-y-2" ref={dropdownRef}>
                  <div className="relative">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={userSearchTerm}
                        onChange={handleUserSearchChange}
                        onFocus={() => {
                          if (userSearchTerm.trim() && filteredUsers.length > 0) {
                            setShowUserDropdown(true);
                          }
                        }}
                        placeholder="Search for user by name, email, or ID..."
                        className={`input pl-10 pr-10 ${isUserIdValid ? 'border-green-500 dark:border-green-500' : ''}`}
                      />
                      {userSearchTerm && (
                        <button
                          type="button"
                          onClick={clearSelectedUser}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                        >
                          <FiXCircle className="w-4 h-4" />
                        </button>
                      )}
                      {isUserIdValid && !userSearchTerm && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <FiCheck className="w-5 h-5 text-green-500" />
                        </div>
                      )}
                    </div>

                    {/* User Dropdown */}
                    {showUserDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {isLoadingUsers ? (
                          <div className="p-4 text-center text-sm text-slate-500">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand border-t-transparent mx-auto mb-2"></div>
                            Loading users...
                          </div>
                        ) : filteredUsers.length > 0 ? (
                          filteredUsers.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => handleSelectUser(u)}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors"
                            >
                              {u.profile_image ? (
                                <img src={u.profile_image} alt="" className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-semibold">
                                  {getInitials(u.full_name || u.username || 'U')}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{u.full_name || u.username || 'Unknown User'}</p>
                                <p className="text-xs text-slate-400 truncate">{u.email || 'No email'}</p>
                              </div>
                              <span className="text-xs text-slate-400 font-mono">ID: {u.id.slice(0, 8)}...</span>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-slate-500">
                            No users found. Try a different search.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Validation status */}
                  {userValidationStatus && (
                    <div className={`text-sm ${userValidationStatus.valid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      <div className={`flex items-center gap-2 p-2 rounded-lg border ${
                        userValidationStatus.valid 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      }`}>
                        {userValidationStatus.valid ? (
                          <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <FiAlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                        <span>
                          {userValidationStatus.message}
                          {userValidationStatus.user?.full_name && (
                            <span className="font-medium"> ({userValidationStatus.user.full_name})</span>
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Start typing to search for users by name, email, or ID.
                </p>
              </div>

              {/* Related Product */}
              <div>
                <label className="label">Related Product (optional)</label>
                <div className="space-y-2">
                  {!selectedProduct ? (
                    <>
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search for product by title or ID..."
                        className="input"
                      />
                      {productsLoading && productSearch.length >= 2 && (
                        <div className="text-sm text-slate-400">Searching...</div>
                      )}
                      {getProductResults().length > 0 && (
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg max-h-40 overflow-y-auto">
                          {getProductResults().map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedProduct(p);
                                setProductSearch(p.title);
                                setForm(prev => ({ ...prev, product: p.id }));
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0"
                            >
                              <p className="text-sm font-medium truncate">{p.title}</p>
                              <p className="text-xs text-slate-400">ID: {p.id.slice(0, 8)}...</p>
                            </button>
                          ))}
                        </div>
                      )}
                      {!productsLoading && getProductResults().length === 0 && productSearch.length >= 2 && (
                        <div className="text-sm text-slate-400">
                          No products found.
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{selectedProduct.title}</p>
                        <p className="text-xs text-slate-400 truncate">ID: {selectedProduct.id}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(null);
                          setProductSearch('');
                          setForm(prev => ({ ...prev, product: '' }));
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <FiXCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">Optional: Link the product this complaint is about.</p>
              </div>

              {/* Category */}
              <div>
                <label className="label">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input"
                  required
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
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
                <p className="text-xs text-slate-400 mt-1">
                  {form.description.length}/20 characters minimum
                </p>
              </div>

              {/* Evidence Image */}
              <div>
                <label className="label">Evidence Image (optional)</label>
                <div className="flex items-center gap-3">
                  <label className="btn-outline cursor-pointer inline-flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setEvidence(e.target.files[0])}
                    />
                    <FiUpload /> {evidence ? evidence.name : 'Upload screenshot'}
                  </label>
                  {evidence && (
                    <button
                      type="button"
                      onClick={() => setEvidence(null)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">Max size: 5MB. Supported: JPG, PNG, GIF</p>
              </div>

              <button 
                type="submit" 
                disabled={create.isPending} 
                className="btn-primary w-full"
              >
                {create.isPending ? 'Filing Complaint...' : 'File Complaint'}
              </button>
            </motion.form>
          )}

          {/* My Filed Complaints */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">
              My Filed Complaints ({complaints?.results?.length || 0})
            </h3>
            
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : !complaints?.results?.length ? (
              <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <FiFlag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">You haven't filed any complaints.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {complaints.results.map((c) => (
                  <div key={c.id} className="card p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {CATEGORIES.find(cat => cat.value === c.category)?.label || c.category}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(c.status)}`}>
                          {getStatusLabel(c.status)}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">{formatDate(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{c.description}</p>
                    {c.resolution && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                        Resolution: {c.resolution}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </>
  );
}