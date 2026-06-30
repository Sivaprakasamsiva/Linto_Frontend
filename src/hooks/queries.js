// frontend/src/hooks/queries.js
/**
 * Custom React hooks for React Query.
 */
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  productAPI, categoryAPI, notificationAPI, chatAPI,
  profileAPI, buyRequestAPI, inquiryAPI, verificationAPI,
  adminAPI, systemAPI, complaintAPI,
} from '../api';

// ===== AUTH / PROFILE =====
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileAPI.me().then((r) => r.data),
    enabled: !!localStorage.getItem('access_token'),
  });
}

// ===== CATEGORIES =====
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () =>
    categoryAPI.list().then((r) => r.data.results ?? []),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCategoryDetail(slug) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoryAPI.detail(slug).then((r) => r.data),
    enabled: !!slug,
  });
}

// ===== PRODUCTS =====
export function useProducts(params) {
  return useQuery({
    queryKey: ['products', 'list', params],
    queryFn: () => productAPI.search(params).then((r) => r.data),
    keepPreviousData: true,
    staleTime: 60 * 1000,
  });
}

export function useProductSearch(params) {
  return useQuery({
    queryKey: ['products', 'search', params],
    queryFn: () => productAPI.search(params).then((r) => r.data),
    keepPreviousData: true,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productAPI.featured().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecentProducts() {
  return useQuery({
    queryKey: ['products', 'recent'],
    queryFn: () => productAPI.recent().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductDetail(slug) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => productAPI.detail(slug).then((r) => r.data),
    enabled: !!slug,
  });
}

export function useMyListings(status) {
  return useQuery({
    queryKey: ['my-listings', status],
    queryFn: () => productAPI.my(status).then((r) => r.data),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => productAPI.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-listings'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug) => productAPI.delete(slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-listings'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Listing deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete listing.');
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }) => productAPI.update(slug, data),
    onSuccess: (_data, { slug }) => {
      qc.invalidateQueries({ queryKey: ['product', slug] });
      qc.invalidateQueries({ queryKey: ['my-listings'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Product updated successfully!');
    },
    onError: (error) => {
      console.error('Update error details:', error.response?.data);
      const errorMsg = error.response?.data?.detail || 
                       error.response?.data?.message || 
                       'Failed to update product.';
      toast.error(errorMsg);
    },
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      try {
        const response = await productAPI.favorites();
        console.log('Favorites API response:', response);
        console.log('Favorites data:', response.data);
        
        // The response should be { results: [{ id, product, created_at }] }
        if (response.data?.results) {
          return response.data;
        }
        if (Array.isArray(response.data)) {
          return { results: response.data };
        }
        return { results: [] };
      } catch (error) {
        console.error('Error fetching favorites:', error);
        return { results: [] };
      }
    },
    enabled: !!localStorage.getItem('access_token'),
    staleTime: 0,
    retry: 1,
  });
}

// ===== FAVORITES - FIXED with Optimistic Update =====
export function useToggleFavorite() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: (productId) => {
      return productAPI.toggleFavorite(productId);
    },
    
    onMutate: async (productId) => {
      // Cancel outgoing refetches
      await qc.cancelQueries({ queryKey: ['products'] });
      await qc.cancelQueries({ queryKey: ['product'] });
      await qc.cancelQueries({ queryKey: ['favorites'] });
      
      // Snapshot the previous values
      const previousFavorites = qc.getQueryData(['favorites']);
      
      // Get ALL queries that start with 'products' - including search results
      const allProductQueries = qc.getQueriesData({ queryKey: ['products'] });
      
      // Loop through each query and update the product's is_favorited
      allProductQueries.forEach(([queryKey, oldData]) => {
        if (!oldData) return;
        
        if (oldData.results && Array.isArray(oldData.results)) {
          const updatedResults = oldData.results.map((p) => {
            if (p.id === productId) {
              const newFav = !(p.is_favorited || false);
              return { ...p, is_favorited: newFav };
            }
            return p;
          });
          qc.setQueryData(queryKey, {
            ...oldData,
            results: updatedResults
          });
        }
        
        if (Array.isArray(oldData)) {
          const updatedData = oldData.map((p) => {
            if (p.id === productId) {
              const newFav = !(p.is_favorited || false);
              return { ...p, is_favorited: newFav };
            }
            return p;
          });
          qc.setQueryData(queryKey, updatedData);
        }
      });
      
      return { previousFavorites };
    },
    
    onSuccess: (response, productId) => {
      // Invalidate queries
      qc.invalidateQueries({ queryKey: ['favorites'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product'] });
      qc.invalidateQueries({ queryKey: ['my-listings'] });
      
      // REMOVE TOAST FROM HERE - we handle it in the component
    },
    
    onError: (error) => {
      console.error('Toggle favorite error:', error);
      qc.invalidateQueries({ queryKey: ['favorites'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product'] });
      
      // REMOVE TOAST FROM HERE - we handle it in the component
    },
  });
}


// ===== BUY REQUESTS =====
export function useReceivedBuyRequests(status) {
  return useQuery({
    queryKey: ['buy-requests', 'received', status],
    queryFn: () => buyRequestAPI.received(status).then((r) => r.data),
  });
}

export function useSentBuyRequests() {
  return useQuery({
    queryKey: ['buy-requests', 'sent'],
    queryFn: () => buyRequestAPI.sent().then((r) => r.data),
  });
}

export function useCreateBuyRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => buyRequestAPI.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['buy-requests'] });
      qc.invalidateQueries({ queryKey: ['product'] });
    },
  });
}

export function useBuyRequestAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, sellerResponse }) =>
      buyRequestAPI.action(id, action, sellerResponse),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['buy-requests'] });
      qc.invalidateQueries({ queryKey: ['product'] });
    },
  });
}

// ===== INQUIRIES =====
export function useInquiries(productId) {
  return useQuery({
    queryKey: ['inquiries', productId],
    queryFn: () => inquiryAPI.list(productId).then((r) => r.data),
    enabled: !!productId,
  });
}

export function useCreateInquiry() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (data) => {
        const payload = {
          product: data.product,
          question: data.question,
          asker_name: data.asker_name || 'Guest',
        };
        return inquiryAPI.create(payload);
      },
      onSuccess: (_data, variables) => {
        qc.invalidateQueries({ queryKey: ['inquiries', variables.product] });
        toast.success('Comment posted successfully!');
      },
      onError: (error) => {
        console.error('Inquiry creation error:', error);
        console.error('Error response:', error.response?.data);
        
        // Check if the error is actually a success (some backends return 500 with success)
        // If the question appears after refresh, it's likely a backend response issue
        const errorMsg = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        error.response?.data?.error ||
                        'Failed to post comment.';
        
        // Only show error if it's a real error (not a 500 that created the item)
        if (error.response?.status !== 500 || !error.response?.data?.detail?.includes('already')) {
          toast.error(errorMsg);
        } else {
          // If it's a 500 but the question might have been created, show success
          toast.success('Comment posted successfully!');
        }
      },
    });
  }

export function useAnswerInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, answer }) => inquiryAPI.answer(id, answer),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inquiries'] });
      toast.success('Answer posted successfully!');
    },
    onError: (error) => {
      console.error('Answer error:', error);
      toast.error(error.response?.data?.detail || 'Failed to post answer.');
    },
  });
}

// ===== CHAT =====
export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await chatAPI.conversations().then((r) => r.data);
      const results = response.results || [];
      const seen = new Set();
      const unique = results.filter(conv => {
        const key = `${conv.other_participant?.id}-${conv.product?.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return {
        ...response,
        results: unique
      };
    },
  });
}

export function useConversationDetail(id) {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => chatAPI.detail(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useMessages(conversationId) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => chatAPI.messages(conversationId).then((r) => r.data),
    enabled: !!conversationId,
    refetchInterval: 10000,
  });
}

export function useSendMessage(conversationId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => chatAPI.send(conversationId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', conversationId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, initialMessage }) => {
      const existingConversations = await chatAPI.conversations().then((r) => r.data);
      const existing = existingConversations.results?.find(
        (c) => c.product?.id === productId
      );
      if (existing) {
        await chatAPI.send(existing.id, initialMessage);
        return { data: { id: existing.id } };
      }
      return chatAPI.start(productId, initialMessage);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Conversation started!');
    },
    onError: (err) => {
      console.error('Error starting conversation:', err);
      toast.error(err.response?.data?.detail || 'Failed to start conversation.');
    },
  });
}

// ===== NOTIFICATIONS =====
export function useNotifications(unread) {
  return useQuery({
    queryKey: ['notifications', unread],
    queryFn: () => notificationAPI.list(unread).then((r) => r.data),
    enabled: !!localStorage.getItem('access_token'),
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['unread-notification-count'],
    queryFn: () => notificationAPI.unreadCount().then((r) => r.data),
    refetchInterval: 30000,
    enabled: !!localStorage.getItem('access_token'),
  });
}

export function useUnreadMessageCount() {
  return useQuery({
    queryKey: ['unread-message-count'],
    queryFn: () => chatAPI.unreadCount().then((r) => r.data),
    refetchInterval: 30000,
    enabled: !!localStorage.getItem('access_token'),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationAPI.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-notification-count'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationAPI.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-notification-count'] });
    },
  });
}

// ===== VERIFICATION =====
export function useMyVerifications() {
  return useQuery({
    queryKey: ['my-verifications'],
    queryFn: () => verificationAPI.mine().then((r) => r.data),
  });
}

export function useSubmitVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => verificationAPI.submit(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-verifications'] });
    },
  });
}

export function useAdminVerifications(status) {
  return useQuery({
    queryKey: ['admin-verifications', status],
    queryFn: () => verificationAPI.adminList(status).then((r) => r.data),
  });
}

export function useReviewVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => verificationAPI.adminReview(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-verifications'] });
    },
  });
}

// ===== COMPLAINTS =====
export function useMyComplaints() {
  return useQuery({
    queryKey: ['my-complaints'],
    queryFn: () => complaintAPI.mine().then((r) => r.data),
  });
}

export function useCreateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => complaintAPI.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-complaints'] });
    },
  });
}

export function useAdminComplaints(status) {
  return useQuery({
    queryKey: ['admin-complaints', status],
    queryFn: () => complaintAPI.adminList(status).then((r) => r.data),
  });
}

export function useReviewComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => complaintAPI.adminReview(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-complaints'] });
    },
  });
}

// ===== SYSTEM =====
export function usePublicConfig() {
  return useQuery({
    queryKey: ['public-config'],
    queryFn: () => systemAPI.publicConfig().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

// ===== ADMIN DASHBOARD =====
export function useAdminMetrics() {
  return useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => adminAPI.metrics().then((r) => r.data),
  });
}

export function useAdminUsers(search, status) {
  return useQuery({
    queryKey: ['admin-users', search, status],
    queryFn: () => adminAPI.users(search, status).then((r) => r.data),
  });
}

export function useAdminUserAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }) => adminAPI.userAction(userId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });
}

export function useAdminProducts(search, status) {
  return useQuery({
    queryKey: ['admin-products', search, status],
    queryFn: () => adminAPI.products(search, status).then((r) => r.data),
  });
}

export function useAdminProductAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, action }) => adminAPI.productAction(productId, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });
}

// ===== DASHBOARD =====
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
        const listingsRes = await productAPI.my();
        const allListings = listingsRes.data.results || [];
        const receivedRes = await buyRequestAPI.received();
        const sentRes = await buyRequestAPI.sent();
        const received = Array.isArray(receivedRes.data) ? receivedRes.data : (receivedRes.data.results || []);
        const sent = Array.isArray(sentRes.data) ? sentRes.data : (sentRes.data.results || []);
        const total_listings = allListings.length;
        const active_listings = allListings.filter(p => 
          p.status === 'available' || p.status === 'pending'
        ).length;
        const pending_requests = received.filter(r => r.status === 'pending').length;
        const sent_requests = sent.length;
        return {
          total_listings,
          active_listings,
          pending_requests,
          sent_requests,
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
          total_listings: 0,
          active_listings: 0,
          pending_requests: 0,
          sent_requests: 0,
        };
      }
    },
    staleTime: 60 * 1000,
  });
}

// ===== BUY REQUESTS - Combined =====
export function useBuyRequests() {
  return useQuery({
    queryKey: ['buy-requests'],
    queryFn: async () => {
      try {
        const [receivedRes, sentRes] = await Promise.all([
          buyRequestAPI.received(),
          buyRequestAPI.sent(),
        ]);
        const received = Array.isArray(receivedRes.data) ? receivedRes.data : (receivedRes.data.results || []);
        const sent = Array.isArray(sentRes.data) ? sentRes.data : (sentRes.data.results || []);
        return { received, sent };
      } catch (error) {
        console.error('Error fetching buy requests:', error);
        return { received: [], sent: [] };
      }
    },
    staleTime: 30 * 1000,
  });
}

export function useUpdateBuyRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, sellerResponse }) => {
      if (action === 'cancel') {
        return buyRequestAPI.update(id, { 
          status: 'cancelled',
          seller_response: sellerResponse 
        });
      }
      return buyRequestAPI.action(id, action, sellerResponse);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['buy-requests'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['product'] });
      qc.invalidateQueries({ queryKey: ['my-listings'] });
      toast.success('Buy request updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating buy request:', error);
      const errorMsg = error.response?.data?.detail || 
                       error.response?.data?.message || 
                       'Failed to update request.';
      toast.error(errorMsg);
    },
  });
}

export function useUpdateProductStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, status }) => productAPI.updateStatus(slug, status),
    onSuccess: (_data, { slug }) => {
      qc.invalidateQueries({ queryKey: ['product', slug] });
      qc.invalidateQueries({ queryKey: ['my-listings'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Product status updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating product status:', error);
      toast.error(error.response?.data?.detail || 'Failed to update product status.');
    },
  });
}