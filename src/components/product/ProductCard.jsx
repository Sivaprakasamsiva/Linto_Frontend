// frontend/src/components/product/ProductCard.jsx
/**
 * Product card component.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiMapPin, FiEye, FiUsers, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToggleFavorite } from '../../hooks/queries';
import {
  formatPrice, truncate, getStatusColor, getStatusLabel,
  getConditionLabel, classNames,
} from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ProductCard({ product, index = 0 }) {
  const { isAuthenticated } = useAuth();
  const toggleFav = useToggleFavorite();
  
  // Use LOCAL STATE for the heart icon
  const [isFavorited, setIsFavorited] = useState(product.is_favorited || false);
  
  // Update local state when product prop changes
  useEffect(() => {
    setIsFavorited(product.is_favorited || false);
  }, [product.is_favorited]);

  const handleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please log in to favorite items.');
      return;
    }
    
    // Toggle local state immediately
    const newState = !isFavorited;
    setIsFavorited(newState);
    
    // Show toast ONCE based on new state
    if (newState) {
      toast.success('Added to favorites!');
    } else {
      toast.success('Removed from favorites.');
    }
    
    // Call API to sync with server (no toast in hook)
    toggleFav.mutate(product.id, {
      onError: () => {
        // Revert on error and show error toast
        setIsFavorited(!newState);
        toast.error('Failed to update favorites.');
      }
    });
  };

  const primaryImage = product.primary_image || product.images?.[0]?.image_url;
  const showStatus = product.status && product.status !== 'available';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
    >
      <Link to={`/product/${product.slug}`} className="group block card overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <FiEye size={32} />
            </div>
          )}

          {/* Top badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.seller?.verified_seller && (
              <span className="badge-verified flex items-center gap-1">
                <FiCheckCircle size={10} /> Verified
              </span>
            )}
            {showStatus && (
              <span className={getStatusColor(product.status)}>
                {getStatusLabel(product.status)}
              </span>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={handleFav}
            className={classNames(
              'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur transition-colors z-10',
              isFavorited
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-white/70 text-slate-600 hover:bg-white'
            )}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FiHeart 
              size={16} 
              fill={isFavorited ? 'currentColor' : 'none'} 
            />
          </button>
        </div>

        <div className="p-3">
          <h3 className="font-medium text-sm text-slate-900 dark:text-white line-clamp-2 mb-1">
            {truncate(product.title, 60)}
          </h3>
          <p className="font-display font-bold text-lg text-brand">
            {product.price_display || formatPrice(product.price)}
          </p>
          {product.negotiable && (
            <p className="text-[10px] text-slate-500 -mt-0.5">Negotiable</p>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <FiMapPin size={11} />
              {product.district || 'India'}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <FiEye size={10} /> {product.views_count || 0}
            </span>
            {product.buy_request_count > 0 && (
              <span className="flex items-center gap-1">
                <FiUsers size={10} /> {product.buy_request_count} interested
              </span>
            )}
            <span>{getConditionLabel(product.condition)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}