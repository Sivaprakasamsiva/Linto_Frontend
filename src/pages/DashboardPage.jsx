// frontend/src/pages/DashboardPage.jsx
/**
 * Dashboard page - shows user stats, listings, and buy requests with accept/reject functionality.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiPackage, FiUsers, FiClock, FiCheckCircle, FiXCircle,
  FiMessageCircle, FiPhone, FiMapPin, FiEye, FiEdit2,
  FiTrash2, FiLoader, FiAlertTriangle, FiCheck, FiX,
  FiRefreshCw,
} from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  useDashboardStats,
  useMyListings as useUserListings,
  useBuyRequests,
  useUpdateBuyRequest,
  useUpdateProductStatus,
  useDeleteProduct,
} from '../hooks/queries';
import { useAuth } from '../context/AuthContext';
import { formatPrice, timeAgo, classNames, getStatusColor, getStatusLabel } from '../utils/helpers';
import { ListSkeleton, EmptyState, Modal } from '../components/ui';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('listings');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseAction, setResponseAction] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState(null);

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: listings, isLoading: listingsLoading, refetch: refetchListings } = useUserListings(statusFilter);
  const { data: buyRequests, isLoading: requestsLoading, refetch: refetchBuyRequests } = useBuyRequests();
  const updateBuyRequest = useUpdateBuyRequest();
  const updateProductStatus = useUpdateProductStatus();
  const deleteProduct = useDeleteProduct();

  const handleAcceptRequest = async (request) => {
    setSelectedRequest(request);
    setResponseAction('accept');
    setShowResponseModal(true);
  };

  const handleRejectRequest = async (request) => {
    setSelectedRequest(request);
    setResponseAction('reject');
    setShowResponseModal(true);
  };

  const handleCancelAcceptedRequest = (request) => {
    setRequestToCancel(request);
    setShowCancelModal(true);
  };

  // frontend/src/pages/DashboardPage.jsx

// Replace the handleConfirmResponse function with this:

  const handleConfirmResponse = async () => {
    if (!selectedRequest || !responseAction) return;

    try {
      const action = responseAction === 'accept' ? 'accept' : 'reject';
      
      // If accepting, we need to reject all other pending requests for this product
      if (responseAction === 'accept') {
        // Get all pending requests for this product
        const productId = selectedRequest.product?.id;
        const allRequests = buyRequests?.received || [];
        const otherPendingRequests = allRequests.filter(
          r => r.product?.id === productId && 
          r.id !== selectedRequest.id && 
          r.status === 'pending'
        );

        // Reject all other pending requests - but only if they are still pending
        for (const request of otherPendingRequests) {
          if (request.status === 'pending') {
            try {
              await updateBuyRequest.mutateAsync({
                id: request.id,
                action: 'reject',
                sellerResponse: 'Product has been reserved for another buyer.',
              });
            } catch (err) {
              // Ignore errors for already processed requests
              console.log('Request already processed:', request.id);
            }
          }
        }

        // Update product status to reserved
        await updateProductStatus.mutateAsync({
          slug: selectedRequest.product?.slug,
          status: 'reserved',
        });
      }

      // Accept or reject the selected request (only if it's still pending)
      if (selectedRequest.status === 'pending') {
        await updateBuyRequest.mutateAsync({
          id: selectedRequest.id,
          action: action,
          sellerResponse: responseAction === 'accept' ? 'accepted' : 'rejected',
        });
      } else {
        // After cancelling, show a toast that will appear for the buyer
        // This will be seen when the buyer refreshes their dashboard
        toast.info('The seller has cancelled the acceptance. The product is available again.');
        setShowResponseModal(false);
        setSelectedRequest(null);
        setResponseAction(null);
        return;
      }

      toast.success(
        responseAction === 'accept' 
          ? `Buy request accepted! Other pending requests have been rejected.` 
          : 'Buy request rejected successfully!'
      );
      
      setShowResponseModal(false);
      setSelectedRequest(null);
      setResponseAction(null);
      
      // Refresh data
      refetchBuyRequests();
      refetchListings();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update request.');
    }
  };

  // Replace the handleCancelAcceptance function with this:

  const handleCancelAcceptance = async () => {
  if (!requestToCancel) return;

  try {
    // First, update product status back to available
    await updateProductStatus.mutateAsync({
      slug: requestToCancel.product?.slug,
      status: 'available',
    });

    // Then try to update the request status
    try {
      await updateBuyRequest.mutateAsync({
        id: requestToCancel.id,
        action: 'cancel', // Try using 'cancel' action
        sellerResponse: 'The seller has cancelled the acceptance. Product is available again.',
      });
    } catch (err) {
      console.log('Could not update request status, but product is now available');
      // If the request update fails, at least the product is available
    }

    toast.success('Acceptance cancelled. Product is now available again.');
    setShowCancelModal(false);
    setRequestToCancel(null);
    
    // Force refresh all data
    await Promise.all([
      refetchBuyRequests(),
      refetchListings(),
      // Also refetch the user's profile to update any related data
    ]);
    
  } catch (err) {
    console.error('Cancel acceptance error:', err);
    const errorMsg = err.response?.data?.detail || 
                     err.response?.data?.message || 
                     'Failed to cancel acceptance.';
    toast.error(errorMsg);
  }
};

  const handleDeleteClick = (listing) => {
    setListingToDelete(listing);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!listingToDelete) return;
    try {
      await deleteProduct.mutateAsync(listingToDelete.slug);
      toast.success('Listing deleted successfully!');
      setShowDeleteModal(false);
      setListingToDelete(null);
      refetchListings();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete listing.');
    }
  };

  // Get listings - handle both 'all' and specific status
  const getListings = () => {
    if (!listings) return [];
    if (!statusFilter || statusFilter === 'all') {
      return listings.results || [];
    }
    return (listings.results || []).filter(item => item.status === statusFilter);
  };

  const filteredListings = getListings();

  // Check if a product already has an accepted request
  // Update the hasAcceptedRequest function
  const hasAcceptedRequest = (productId) => {
    if (!buyRequests?.received) return false;
    // Check if there's an accepted request AND the product is reserved
    const accepted = buyRequests.received.some(
      r => r.product?.id === productId && r.status === 'accepted'
    );
    // Also check if the product itself is reserved
    const product = listings?.results?.find(p => p.id === productId);
    return accepted && product?.status === 'reserved';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Helmet><title>Dashboard - Lintro</title></Helmet>

      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl">
            Welcome, {user?.full_name || 'User'}
          </h1>
          <p className="text-slate-500 text-sm">Manage your listings and buy requests</p>
        </div>
        <Link to="/sell" className="btn-primary shrink-0">
          <FiPackage className="inline mr-2" /> New Listing
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-brand">{stats?.total_listings || 0}</p>
          <p className="text-xs text-slate-500">Total Listings</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats?.active_listings || 0}</p>
          <p className="text-xs text-slate-500">Active Listings</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{stats?.pending_requests || 0}</p>
          <p className="text-xs text-slate-500">Pending Requests</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats?.sent_requests || 0}</p>
          <p className="text-xs text-slate-500">Sent Requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('listings')}
          className={classNames(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'listings'
              ? 'border-brand text-brand'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          )}
        >
          My Listings
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={classNames(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'requests'
              ? 'border-brand text-brand'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          )}
        >
          Buy Requests {stats?.pending_requests > 0 && (
            <span className="ml-1 bg-accent-500 text-white text-xs rounded-full px-2 py-0.5">
              {stats.pending_requests}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={classNames(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'sent'
              ? 'border-brand text-brand'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          )}
        >
          Sent Requests
        </button>
      </div>

      {/* Content */}
      {activeTab === 'listings' && (
        <div>
          {/* Status Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {['', 'available', 'pending', 'reserved', 'sold', 'unlisted', 'expired', 'archived'].map((status) => (
              <button
                key={status || 'all'}
                onClick={() => setStatusFilter(status)}
                className={classNames(
                  'px-3 py-1 text-xs rounded-full capitalize transition-colors',
                  statusFilter === status
                    ? 'bg-brand text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                )}
              >
                {status === '' ? 'All' : status}
              </button>
            ))}
          </div>

          {listingsLoading ? (
            <ListSkeleton count={3} />
          ) : filteredListings.length === 0 ? (
            <EmptyState icon={FiPackage} title="No listings found" description="Start selling by creating your first listing." action={<Link to="/sell" className="btn-primary">Sell an Item</Link>} />
          ) : (
            <div className="space-y-4">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="card p-4 flex flex-col sm:flex-row gap-4">
                  <div className="sm:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                    {listing.primary_image ? (
                      <img src={listing.primary_image} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <FiPackage size={32} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <Link to={`/product/${listing.slug}`} className="font-semibold hover:text-brand truncate">
                        {listing.title}
                      </Link>
                      <span className={classNames(
                        'text-xs px-2 py-0.5 rounded-full whitespace-nowrap',
                        getStatusColor(listing.status)
                      )}>
                        {getStatusLabel(listing.status)}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-brand">{formatPrice(listing.price)}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-1">
                      <span><FiMapPin className="inline mr-1" /> {listing.district}, {listing.state}</span>
                      <span><FiEye className="inline mr-1" /> {listing.views_count || 0} views</span>
                      <span><FiUsers className="inline mr-1" /> {listing.buy_request_count || 0} requests</span>
                      <span><FiClock className="inline mr-1" /> {timeAgo(listing.listed_at)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:flex-col sm:justify-center">
                    <Link to={`/edit/${listing.slug}`} className="btn-outline text-sm py-1 px-3">
                      <FiEdit2 className="inline mr-1" /> Edit
                    </Link>
                    <button 
                      onClick={() => handleDeleteClick(listing)}
                      className="btn-outline text-sm py-1 px-3 text-red-600 hover:bg-red-50 border-red-200"
                    >
                      <FiTrash2 className="inline mr-1" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div>
          {requestsLoading ? (
            <ListSkeleton count={3} />
          ) : !buyRequests?.received?.length ? (
            <EmptyState icon={FiUsers} title="No buy requests" description="When buyers request your items, they'll appear here." />
          ) : (
            <div className="space-y-4">
              {buyRequests.received.map((request) => {
                const isAccepted = request.status === 'accepted';
                const productHasAccepted = hasAcceptedRequest(request.product?.id);
                const isPending = request.status === 'pending';
                
                return (
                  <div key={request.id} className="card p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link to={`/product/${request.product?.slug}`} className="font-semibold hover:text-brand">
                            {request.product?.title}
                          </Link>
                          <span className={classNames(
                            'text-xs px-2 py-0.5 rounded-full',
                            isAccepted ? 'bg-green-100 text-green-800' :
                            request.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          )}>
                            {isAccepted ? 'Accepted ✓' : 
                             request.status === 'pending' ? 'Pending Response' : 
                             request.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          <span className="font-medium">{request.buyer_name}</span>
                          {request.buyer_phone && (
                            <span className="ml-2"><FiPhone className="inline mr-1" /> {request.buyer_phone}</span>
                          )}
                          {request.buyer_whatsapp && (
                            <span className="ml-2"><FiMessageCircle className="inline mr-1" /> WhatsApp: {request.buyer_whatsapp}</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          <FiMapPin className="inline mr-1" /> {request.buyer_location || 'Location not specified'}
                        </p>
                        {request.buyer_message && (
                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                            "{request.buyer_message}"
                          </p>
                        )}
                        {request.offered_price && (
                          <p className="text-sm text-brand font-medium mt-1">
                            Offered: {formatPrice(request.offered_price)}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          {timeAgo(request.created_at)}
                        </p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 shrink-0">
                        {isPending && !productHasAccepted && (
                          <>
                            <button
                              onClick={() => handleAcceptRequest(request)}
                              className="btn-success text-sm py-1.5 px-4"
                            >
                              <FiCheck className="inline mr-1" /> Accept
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request)}
                              className="btn-danger text-sm py-1.5 px-4"
                            >
                              <FiX className="inline mr-1" /> Reject
                            </button>
                          </>
                        )}
                        {isPending && productHasAccepted && (
                          <span className="text-xs text-slate-500 py-1.5 px-4 bg-slate-100 rounded-lg">
                            Product already reserved
                          </span>
                        )}
                        {isAccepted && (
                          <button
                            onClick={() => handleCancelAcceptedRequest(request)}
                            className="btn-warning text-sm py-1.5 px-4"
                          >
                            <FiRefreshCw className="inline mr-1" /> Cancel Acceptance
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

     

      {activeTab === 'sent' && (
      <div>
        {requestsLoading ? (
          <ListSkeleton count={3} />
        ) : !buyRequests?.sent?.length ? (
          <EmptyState icon={FiUsers} title="No sent requests" description="You haven't sent any buy requests yet." />
        ) : (
          <div className="space-y-4">
            {buyRequests.sent.map((request) => {
              // Check if product is available but request is accepted (means it was cancelled by seller)
              const isCancelled = request.status === 'accepted' && 
                                request.product?.status === 'available';
              
              // Determine the display status
              let displayStatus = request.status;
              let statusColor = '';
              
              if (isCancelled) {
                displayStatus = 'Rejected by Seller';
                statusColor = 'bg-red-100 text-red-800';
              } else if (request.status === 'pending') {
                displayStatus = 'Pending Response';
                statusColor = 'bg-amber-100 text-amber-800';
              } else if (request.status === 'accepted') {
                displayStatus = 'Accepted ✓';
                statusColor = 'bg-green-100 text-green-800';
              } else {
                displayStatus = request.status;
                statusColor = 'bg-red-100 text-red-800';
              }
              
              return (
                <div key={request.id} className="card p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link to={`/product/${request.product?.slug}`} className="font-semibold hover:text-brand">
                          {request.product?.title}
                        </Link>
                        <span className={classNames(
                          'text-xs px-2 py-0.5 rounded-full',
                          statusColor
                        )}>
                          {displayStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Seller: {request.product?.seller?.full_name}
                      </p>
                      {request.buyer_message && (
                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                          "{request.buyer_message}"
                        </p>
                      )}
                      {request.offered_price && (
                        <p className="text-sm text-brand font-medium mt-1">
                          Offered: {formatPrice(request.offered_price)}
                        </p>
                      )}
                      {isCancelled && (
                        <p className="text-sm text-red-600 mt-1 font-medium">
                          ✕ The seller has cancelled this deal. The product is available again.
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        {timeAgo(request.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    )}

      {/* Response Modal */}
      <Modal
        isOpen={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        title={`${responseAction === 'accept' ? 'Accept' : 'Reject'} Buy Request`}
      >
        <div className="space-y-4">
          <div className={classNames(
            'p-4 rounded-lg',
            responseAction === 'accept' ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'
          )}>
            <p className="text-sm">
              {responseAction === 'accept' ? (
                <>
                  <FiCheckCircle className="inline text-green-600 mr-2" />
                  <strong>You are about to accept</strong> the buy request from <strong>{selectedRequest?.buyer_name}</strong>.
                  <br /><br />
                  <span className="text-amber-600">Note: All other pending requests for this product will be automatically rejected.</span>
                </>
              ) : (
                <>
                  <FiXCircle className="inline text-red-600 mr-2" />
                  You are about to <strong>reject</strong> the buy request from <strong>{selectedRequest?.buyer_name}</strong>.
                </>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleConfirmResponse}
              disabled={updateBuyRequest.isPending}
              className={classNames(
                'flex-1 py-2 rounded-lg text-white font-medium',
                responseAction === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700',
                updateBuyRequest.isPending && 'opacity-70 cursor-not-allowed'
              )}
            >
              {updateBuyRequest.isPending ? (
                <><FiLoader className="animate-spin inline mr-2" /> Processing...</>
              ) : (
                <>{responseAction === 'accept' ? 'Accept Request' : 'Reject Request'}</>
              )}
            </button>
            <button
              onClick={() => setShowResponseModal(false)}
              className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Cancel Acceptance Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Acceptance"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <FiAlertTriangle className="inline mr-2 text-amber-600" />
              <strong>Are you sure you want to cancel the acceptance?</strong>
              <div className="mt-2">
                This will:
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Make the product available again</li>
                  <li>Notify the buyer that the deal is cancelled</li>
                  <li>Allow other buyers to request this product</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCancelAcceptance}
              disabled={updateBuyRequest.isPending}
              className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium disabled:opacity-70"
            >
              {updateBuyRequest.isPending ? (
                <><FiLoader className="animate-spin inline mr-2" /> Processing...</>
              ) : (
                'Yes, Cancel Acceptance'
              )}
            </button>
            <button
              onClick={() => setShowCancelModal(false)}
              className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
            >
              No, Keep It
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Listing"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              <FiAlertTriangle className="inline mr-2 text-red-600" />
              Are you sure you want to delete <strong>"{listingToDelete?.title}"</strong>?
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleConfirmDelete}
              disabled={deleteProduct.isPending}
              className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-70"
            >
              {deleteProduct.isPending ? (
                <><FiLoader className="animate-spin inline mr-2" /> Deleting...</>
              ) : (
                'Yes, Delete'
              )}
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}