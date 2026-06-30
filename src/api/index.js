
// frontend/src/api/index.js
/**
 * API endpoint wrappers for all backend resources.
 */
import api from './client';

// ===== AUTH =====
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  refreshToken: (refresh) => api.post('/auth/token/refresh/', { refresh }),
  requestOTP: (data) => api.post('/auth/otp/request/', data),
  verifyOTP: (data) => api.post('/auth/otp/verify/', data),
  changePassword: (data) => api.post('/auth/password/change/', data),
  resetPasswordRequest: (data) => api.post('/auth/password/reset/request/', data),
  resetPasswordConfirm: (data) => api.post('/auth/password/reset/confirm/', data),
};

// ===== PROFILE =====
export const profileAPI = {
  me: () => api.get('/users/me/'),
  updateMe: (data) => {
    if (data instanceof FormData) {
      return api.patch('/users/me/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.patch('/users/me/', data);
  },
  publicUser: (userId) => api.get(`/users/${userId}/public/`),
};

// ===== CATEGORIES =====
export const categoryAPI = {
  list: () => api.get('/categories/'),
  detail: (slug) => api.get(`/categories/${slug}/`),
  create: (data) => api.post('/categories/admin/create/', data),
  update: (id, data) => api.patch(`/categories/admin/${id}/update/`, data),
  delete: (id) => api.delete(`/categories/admin/${id}/delete/`),
  listFields: (categoryId) => api.get(`/categories/admin/${categoryId}/fields/`),
  createField: (categoryId, data) => api.post(`/categories/admin/${categoryId}/fields/`, data),
  updateField: (categoryId, id, data) => api.patch(`/categories/admin/${categoryId}/fields/${id}/`, data),
  deleteField: (categoryId, id) => api.delete(`/categories/admin/${categoryId}/fields/${id}/`),
};

// ===== PRODUCTS =====
// frontend/src/api/index.js - Remove duplicate favorites entries

export const productAPI = {
  search: (params) => api.get('/products/', { params }),
  featured: () => api.get('/products/featured/'),
  recent: () => api.get('/products/recent/'),
  detail: (slug) => api.get(`/products/${slug}/`),
  create: (data) => {
    if (data instanceof FormData) {
      return api.post('/products/create/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post('/products/create/', data);
  },
  update: (slug, data) => {
    if (data instanceof FormData) {
      return api.patch(`/products/${slug}/update/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.patch(`/products/${slug}/update/`, data);
  },
  delete: (slug) => api.delete(`/products/${slug}/delete/`),
  my: (status) => api.get('/products/mine/', { params: { status } }),
  updateStatus: (slug, status) => api.patch(`/products/${slug}/status/`, { status }),
  // Favorites - ONLY ONE DEFINITION
  favorites: () => api.get('/products/favorites/'),  // Should be /products/favorites/
  toggleFavorite: (productId) => api.post(`/products/favorites/${productId}/toggle/`),
};

// ===== BUY REQUESTS =====
export const buyRequestAPI = {
  create: (data) => api.post('/buy-requests/create/', data),
  received: (status) => api.get('/buy-requests/received/', { params: { status } }),
  sent: () => api.get('/buy-requests/sent/'),
  detail: (id) => api.get(`/buy-requests/${id}/`),
  action: (id, action, sellerResponse = '') =>
    api.post(`/buy-requests/${id}/action/`, { action, seller_response: sellerResponse }),
  withdraw: (id) => api.post(`/buy-requests/${id}/withdraw/`),
};

// ===== INQUIRIES =====
// frontend/src/api/index.js
// Update the inquiryAPI section

export const inquiryAPI = {
  list: (productId) => {
    if (!productId) return Promise.resolve({ data: { results: [] } });
    return api.get(`/inquiries/product/${productId}/`);
  },
  create: (data) => api.post('/inquiries/create/', data),
  answer: (id, answer) => api.patch(`/inquiries/${id}/answer/`, { answer }),  // Use PATCH
};

// ===== CHAT =====
export const chatAPI = {
  conversations: () => api.get('/chat/conversations/'),
  start: (productId, initialMessage) =>
    api.post('/chat/conversations/start/', { product_id: productId, initial_message: initialMessage }),
  detail: (id) => api.get(`/chat/conversations/${id}/`),
  messages: (conversationId) => api.get(`/chat/conversations/${conversationId}/messages/`),
  send: (conversationId, body) => api.post(`/chat/conversations/${conversationId}/send/`, { body }),
  unreadCount: () => api.get('/chat/unread-count/'),
};

// ===== NOTIFICATIONS =====
export const notificationAPI = {
  list: (unread) => api.get('/notifications/', { params: { unread: unread ? 'true' : undefined } }),
  unreadCount: () => api.get('/notifications/unread-count/'),
  markRead: (id) => api.post(`/notifications/${id}/mark-read/`),
  markAllRead: () => api.post('/notifications/mark-all-read/'),
  announcements: () => api.get('/notifications/announcements/'),
};

// ===== VERIFICATION =====
export const verificationAPI = {
  submit: (data) => {
    if (data instanceof FormData) {
      return api.post('/verification/submit/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post('/verification/submit/', data);
  },
  mine: () => api.get('/verification/mine/'),
  mineDetail: (id) => api.get(`/verification/mine/${id}/`),
  adminList: (status) => api.get('/verification/admin/', { params: { status } }),
  adminReview: (id, data) => api.patch(`/verification/admin/${id}/review/`, data),
};

// ===== COMPLAINTS =====
export const complaintAPI = {
  create: (data) => {
    if (data instanceof FormData) {
      return api.post('/complaints/create/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post('/complaints/create/', data);
  },
  mine: () => api.get('/complaints/mine/'),
  adminList: (status) => api.get('/complaints/admin/', { params: { status } }),
  adminReview: (id, data) => api.patch(`/complaints/admin/${id}/review/`, data),
};

// ===== SYSTEM CONFIG =====
export const systemAPI = {
  publicConfig: () => api.get('/system/public-config/'),
  settings: () => api.get('/system/settings/'),
  updateSetting: (key, data) => api.patch(`/system/settings/${key}/`, data),
  banners: () => api.get('/system/banners/'),
  createBanner: (data) => api.post('/system/banners/', data),
  updateBanner: (id, data) => api.patch(`/system/banners/${id}/`, data),
  deleteBanner: (id) => api.delete(`/system/banners/${id}/`),
  theme: () => api.get('/system/theme/'),
  updateTheme: (data) => api.patch('/system/theme/', data),
  // Storage Management
  storageStats: () => api.get('/system/storage/stats/'),
  clearCache: () => api.post('/system/storage/clear-cache/'),
  deleteImage: (publicId) => api.delete(`/system/storage/delete/${publicId}/`),
};

// ===== ADMIN DASHBOARD =====
export const adminAPI = {
  metrics: () => api.get('/admin/metrics/'),
  users: (search, status) => api.get('/admin/users/', { params: { search, status } }),
  userAction: (userId, data) => api.post(`/admin/users/${userId}/action/`, data),
  products: (search, status) => api.get('/admin/products/', { params: { search, status } }),
  productAction: (productId, action) => api.post(`/admin/products/${productId}/action/`, { action }),
};
