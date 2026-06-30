// frontend/src/pages/ProductDetailPage.jsx
/**
 * Product detail page - shows full listing, image gallery, buy request form,
 * inquiries, chat button, seller info, safety notice.
 */

import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiMapPin, FiEye, FiUsers, FiHeart, FiShare2, FiFlag, FiMessageSquare,
  FiCheckCircle, FiClock, FiPhone, FiSend, FiArrowLeft, FiShield,
  FiAlertTriangle, FiUser, FiLoader, FiMessageCircle, FiCheck,
  FiThumbsUp, FiThumbsDown, FiMoreVertical,
} from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import ProductImageGallery from '../components/product/ProductImageGallery';
import { ProductDetailSkeleton, EmptyState, Modal } from '../components/ui';
import {
  useProductDetail, useInquiries, useCreateInquiry,
  useCreateBuyRequest, useToggleFavorite, useStartConversation,
  useAnswerInquiry,
} from '../hooks/queries';
import { useAuth } from '../context/AuthContext';
import {
  formatPrice, formatDate, timeAgo, getConditionLabel,
  getStatusColor, getStatusLabel, getUserLocation, classNames,
} from '../utils/helpers';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { data: product, isLoading, isError, refetch: refetchProduct } = useProductDetail(slug);
  const { data: inquiries, refetch: refetchInquiries } = useInquiries(product?.id);
  const createInquiry = useCreateInquiry();
  const createBuyRequest = useCreateBuyRequest();
  const toggleFav = useToggleFavorite();
  const startConversation = useStartConversation();
  const answerInquiry = useAnswerInquiry();

  const [showBuyForm, setShowBuyForm] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryText, setInquiryText] = useState('');
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [answeringQuestionId, setAnsweringQuestionId] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [buyForm, setBuyForm] = useState({
    buyer_name: user?.full_name || '',
    buyer_phone: user?.mobile_number || '',
    buyer_whatsapp: user?.whatsapp_number || '',
    buyer_location: user?.district ? `${user.district}, ${user.state}` : '',
    buyer_message: '',
    offered_price: '',
  });

  const isOwn = product && user && product.seller?.id === user.id;

  const toggleReplies = (inquiryId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [inquiryId]: !prev[inquiryId]
    }));
  };

  const handleBuyRequest = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in or fill the form as a guest.');
      return;
    }
    try {
      await createBuyRequest.mutateAsync({
        product: product.id,
        ...buyForm,
        offered_price: buyForm.offered_price || undefined,
      });
      toast.success('Buy request sent! The seller will respond within 24 hours.');
      setShowBuyForm(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send request.');
    }
  };

  const handleInquiry = async (e) => {
    e.preventDefault();
    if (!inquiryText.trim()) {
      toast.error('Please enter a comment.');
      return;
    }
    try {
      await createInquiry.mutateAsync({
        product: product.id,
        question: inquiryText.trim(),
        asker_name: user?.full_name || 'Guest',
      });
      // Success is handled by the mutation's onSuccess
      setInquiryText('');
      setShowInquiryForm(false);
      // Refetch to show the new comment
      setTimeout(() => {
        refetchInquiries();
      }, 500);
    } catch (err) {
      // Error is handled by the mutation's onError
      console.error('Inquiry error:', err);
    }
  };

  const handleAnswerClick = (inquiryId) => {
    setAnsweringQuestionId(inquiryId);
    setAnswerText('');
    setShowAnswerModal(true);
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerText.trim()) {
      toast.error('Please enter an answer.');
      return;
    }
    try {
      await answerInquiry.mutateAsync({
        id: answeringQuestionId,
        answer: answerText.trim(),
      });
      toast.success('Answer posted successfully!');
      setShowAnswerModal(false);
      setAnswerText('');
      setAnsweringQuestionId(null);
      refetchInquiries();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to post answer.');
    }
  };

  const handleFav = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to favorite items.');
      navigate('/login', { state: { from: { pathname: `/product/${slug}` } } });
      return;
    }
    try {
      await toggleFav.mutateAsync(product.id);
    } catch (err) {
      console.error('Toggle favorite error:', err);
    }
  };

  const handleChat = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to start a chat.');
      navigate('/login', { state: { from: { pathname: `/product/${slug}` } } });
      return;
    }
    try {
      const res = await startConversation.mutateAsync({
        productId: product.id,
        initialMessage: `Hi, I'm interested in your listing "${product.title}".`,
      });
      navigate(`/messages/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start chat.');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: product.title, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 py-6"><ProductDetailSkeleton /></div>;
  if (isError || !product) return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <EmptyState icon={FiAlertTriangle} title="Product not found" description="This listing may have been deleted or archived." action={<Link to="/search" className="btn-primary">Browse products</Link>} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Helmet><title>{product.title} - {formatPrice(product.price)} - Lintro</title></Helmet>

      <Link to="/search" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand mb-3">
        <FiArrowLeft /> Back to search
      </Link>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
        {/* Left: Gallery */}
        <div>
          <ProductImageGallery images={product.images || []} />
          <div className="flex gap-2 mt-4">
            <button onClick={handleFav} className={classNames('btn-outline flex-1', product.is_favorited && '!bg-red-50 !text-red-600 !border-red-200')}>
              <FiHeart fill={product.is_favorited ? 'currentColor' : 'none'} /> {product.is_favorited ? 'Saved' : 'Save'}
            </button>
            <button onClick={handleShare} className="btn-outline flex-1">
              <FiShare2 /> Share
            </button>
          </div>
        </div>

        {/* Right: Info - Keep the same as before */}
        <div className="space-y-4">
          {/* ... existing product info ... */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-900 dark:text-white">
                {product.title}
              </h1>
              <span className={getStatusColor(product.status)}>
                {getStatusLabel(product.status)}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <p className="font-display font-bold text-3xl text-brand">
                {product.price_display || formatPrice(product.price)}
              </p>
              {product.negotiable && <span className="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Negotiable</span>}
              <span className="badge bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{getConditionLabel(product.condition)}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="card p-3">
              <FiEye className="mx-auto text-slate-400 mb-1" />
              <div className="font-bold text-slate-900 dark:text-white">{product.views_count || 0}</div>
              <div className="text-slate-500">Views</div>
            </div>
            <div className="card p-3">
              <FiUsers className="mx-auto text-slate-400 mb-1" />
              <div className="font-bold text-slate-900 dark:text-white">{product.buy_request_count || 0}</div>
              <div className="text-slate-500">Requested</div>
            </div>
            <div className="card p-3">
              <FiClock className="mx-auto text-slate-400 mb-1" />
              <div className="font-bold text-slate-900 dark:text-white">{timeAgo(product.listed_at)}</div>
              <div className="text-slate-500">Posted</div>
            </div>
          </div>

          {/* Buy request counter message */}
          {product.buy_request_count > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-200">
              <FiUsers className="inline mr-1" />
              <strong>{product.buy_request_count} {product.buy_request_count === 1 ? 'person has' : 'people have'}</strong> requested to buy this item.
            </div>
          )}

          {/* Location */}
          <div className="card p-4">
            <div className="flex items-start gap-2">
              <FiMapPin className="text-brand mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-slate-900 dark:text-white">{product.location_name || product.district}</p>
                <p className="text-slate-500">{product.district}, {product.state}, {product.country}</p>
                {product.distance_km != null && (
                  <p className="text-xs text-brand mt-1">About {product.distance_km} km from you</p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card p-4">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{product.description}</p>
          </div>

          {/* Custom fields */}
          {product.custom_fields && Object.keys(product.custom_fields).length > 0 && (
            <div className="card p-4">
              <h3 className="font-semibold mb-3">Specifications</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(product.custom_fields).map(([k, v]) => (
                  <div key={k} className="flex flex-col">
                    <dt className="text-xs text-slate-500 capitalize">{k.replace(/_/g, ' ')}</dt>
                    <dd className="font-medium text-slate-900 dark:text-white">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Seller info */}
          <div className="card p-4">
            <h3 className="font-semibold mb-3">Seller Information</h3>
            <div className="flex items-center gap-3">
              {product.seller?.profile_image ? (
                <img src={product.seller.profile_image} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center font-semibold">
                  {(product.seller?.full_name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <Link to={`/user/${product.seller?.id}`} className="font-medium text-slate-900 dark:text-white hover:underline">
                    {product.seller?.full_name}
                  </Link>
                  {product.seller?.verified_seller && (
                    <span className="badge-verified flex items-center gap-1">
                      <FiCheckCircle size={10} /> Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Member since {formatDate(product.seller?.joined_date)}
                </p>
                <p className="text-xs text-slate-500">{product.seller?.district}, {product.seller?.state}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!isOwn && (
            <div className="space-y-2">
              <button
                onClick={() => setShowBuyForm(true)}
                disabled={product.status === 'sold'}
                className="btn-primary w-full text-base py-3"
              >
                <FiSend /> Send Buy Request
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleChat} className="btn-outline">
                  <FiMessageSquare /> Chat
                </button>
                <button onClick={() => setShowInquiryForm(true)} className="btn-outline">
                  Ask Question
                </button>
              </div>
            </div>
          )}

          {isOwn && (
            <div className="card p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                <strong>This is your listing.</strong> Manage it from your dashboard.
              </p>
              <Link to="/dashboard" className="btn-primary w-full">Go to Dashboard</Link>
            </div>
          )}

          {/* Safety notice */}
          <div className="alert-warn flex items-start gap-2">
            <FiShield className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Safety Notice</p>
              <p>Buyers must verify the seller before making any payment. Lintro Marketplace only connects buyers and sellers and is not responsible for offline transactions.</p>
            </div>
          </div>

          {/* Report listing */}
          {!isOwn && (
            <Link to="/complaints" className="text-xs text-slate-500 hover:text-red-500 inline-flex items-center gap-1">
              <FiFlag /> Report this listing
            </Link>
          )}
        </div>
      </div>

            {/* ===== YOUTUBE-STYLE Q&A SECTION ===== */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              <FiMessageCircle className="text-brand" />
              Comments
            </h2>
            <span className="text-sm text-slate-400">
              ({inquiries?.results?.length || 0})
            </span>
          </div>
          {!isOwn && (
            <button
              onClick={() => setShowInquiryForm(true)}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
            >
              <FiMessageCircle size={16} /> Add Comment
            </button>
          )}
        </div>

        {/* Sort options like YouTube */}
        <div className="flex items-center gap-4 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
          <button 
            className="text-sm font-medium text-brand border-b-2 border-brand pb-2 -mb-0.5"
            onClick={() => {
              // Sort by top comments (default - show answered first)
              // We'll just refetch
              refetchInquiries();
            }}
          >
            Top comments
          </button>
          <button 
            className="text-sm text-slate-500 hover:text-slate-700 pb-2 -mb-0.5"
            onClick={() => {
              // Sort by newest
              refetchInquiries();
            }}
          >
            Newest first
          </button>
        </div>

        {!inquiries?.results || inquiries.results.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <FiMessageCircle className="mx-auto text-slate-300 text-4xl mb-3" />
            <p className="text-sm text-slate-500">No comments yet. Start the conversation!</p>
            {!isOwn && (
              <button
                onClick={() => setShowInquiryForm(true)}
                className="btn-primary text-sm py-2 px-4 mt-3"
              >
                Add Comment
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {inquiries.results.map((q) => {
              const isAnswered = q.answer && q.answer.trim().length > 0;
              const isSeller = isOwn;
              const isExpanded = expandedReplies[q.id] || false;
              
              return (
                <div key={q.id} className="flex gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-semibold text-sm">
                      {(q.asker_name || 'G').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Comment Header */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-slate-900 dark:text-white">
                        {q.asker_name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-slate-400">{timeAgo(q.created_at)}</span>
                      {isAnswered && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <FiCheck size={10} /> Answered
                        </span>
                      )}
                      {!isAnswered && isSeller && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          Awaiting reply
                        </span>
                      )}
                    </div>
                    
                    {/* Comment Text */}
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                      {q.question}
                    </p>
                    
                    {/* Comment Actions - No like/dislike buttons */}
                    <div className="flex items-center gap-4 mt-2">
                      {isSeller && !isAnswered && (
                        <button
                          onClick={() => handleAnswerClick(q.id)}
                          className="text-xs text-brand hover:text-brand-dark font-medium"
                        >
                          Reply
                        </button>
                      )}
                      {isAnswered && (
                        <button
                          onClick={() => toggleReplies(q.id)}
                          className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                        >
                          {isExpanded ? 'Hide reply' : 'View reply'}
                        </button>
                      )}
                    </div>
                    
                    {/* Answer / Reply Section - Only show when expanded */}
                    {isAnswered && isExpanded && (
                      <div className="mt-3 pl-4 border-l-2 border-brand/30 ml-1">
                        <div className="flex items-start gap-3 mt-2">
                          {/* Seller Avatar */}
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white font-semibold text-xs">
                              {product.seller?.full_name?.charAt(0) || 'S'}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-brand">
                                {product.seller?.full_name || 'Seller'}
                              </span>
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <FiCheckCircle size={10} className="text-green-500" /> Verified
                              </span>
                              <span className="text-xs text-slate-400">{timeAgo(q.answered_at)}</span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">
                              {q.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Buy request modal */}
      <Modal isOpen={showBuyForm} onClose={() => setShowBuyForm(false)} title="Send Buy Request">
        <form onSubmit={handleBuyRequest} className="space-y-3">
          <div className="alert-warn text-xs mb-3">
            <FiAlertTriangle className="inline mr-1" />
            No payment is processed on this platform. You will share your contact info with the seller.
          </div>
          <div>
            <label className="label">Your Name *</label>
            <input
              required
              value={buyForm.buyer_name}
              onChange={(e) => setBuyForm({ ...buyForm, buyer_name: e.target.value })}
              className="input"
              placeholder="Full name"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Phone *</label>
              <input
                required
                value={buyForm.buyer_phone}
                onChange={(e) => setBuyForm({ ...buyForm, buyer_phone: e.target.value })}
                className="input"
                placeholder="+91..."
              />
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <input
                value={buyForm.buyer_whatsapp}
                onChange={(e) => setBuyForm({ ...buyForm, buyer_whatsapp: e.target.value })}
                className="input"
                placeholder="+91..."
              />
            </div>
          </div>
          <div>
            <label className="label">Your Location</label>
            <input
              value={buyForm.buyer_location}
              onChange={(e) => setBuyForm({ ...buyForm, buyer_location: e.target.value })}
              className="input"
              placeholder="City, State"
            />
          </div>
          <div>
            <label className="label">Offer Price (₹) - Optional</label>
            <input
              type="number"
              value={buyForm.offered_price}
              onChange={(e) => setBuyForm({ ...buyForm, offered_price: e.target.value })}
              className="input"
              placeholder="Your offer"
            />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea
              value={buyForm.buyer_message}
              onChange={(e) => setBuyForm({ ...buyForm, buyer_message: e.target.value })}
              className="input"
              rows="3"
              placeholder="Optional message to seller"
            />
          </div>
          <button type="submit" disabled={createBuyRequest.isPending} className="btn-primary w-full">
            {createBuyRequest.isPending ? 'Sending...' : 'Send Request'}
          </button>
        </form>
      </Modal>

      {/* Inquiry modal */}
      <Modal isOpen={showInquiryForm} onClose={() => setShowInquiryForm(false)} title="Add Comment">
        <form onSubmit={handleInquiry} className="space-y-3">
          <div>
            <label className="label">Your Comment *</label>
            <textarea
              required
              minLength="5"
              value={inquiryText}
              onChange={(e) => setInquiryText(e.target.value)}
              className="input"
              rows="4"
              placeholder="Share your thoughts or ask a question about this item..."
            />
            <p className="text-xs text-slate-400 mt-1">
              {inquiryText.length}/500 characters
            </p>
          </div>
          <button 
            type="submit" 
            disabled={createInquiry.isPending || !inquiryText.trim()} 
            className="btn-primary w-full"
          >
            {createInquiry.isPending ? (
              <><FiLoader className="animate-spin inline mr-2" /> Posting...</>
            ) : (
              'Post Comment'
            )}
          </button>
        </form>
      </Modal>

      {/* Answer Modal */}
      <Modal isOpen={showAnswerModal} onClose={() => setShowAnswerModal(false)} title="Reply to Comment">
        <form onSubmit={handleSubmitAnswer} className="space-y-3">
          <div>
            <label className="label">Your Reply *</label>
            <textarea
              required
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="input"
              rows="4"
              placeholder="Write your reply here..."
            />
            <p className="text-xs text-slate-400 mt-1">
              {answerText.length}/1000 characters
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!answerText.trim() || answerInquiry.isPending}
              className="btn-primary flex-1"
            >
              {answerInquiry.isPending ? (
                <><FiLoader className="animate-spin inline mr-2" /> Posting...</>
              ) : (
                'Post Reply'
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowAnswerModal(false)}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}