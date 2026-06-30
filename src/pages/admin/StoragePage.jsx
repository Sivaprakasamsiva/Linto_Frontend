// frontend/src/pages/admin/StoragePage.jsx
/**
 * Admin Storage Management - Optimized with pagination and lazy loading.
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiDatabase, FiUpload, FiRefreshCw, FiImage, FiHardDrive,
  FiGlobe, FiCpu, FiActivity, FiTrash2, FiPieChart,
  FiChevronLeft, FiChevronRight, FiEye, FiX,
} from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { systemAPI } from '../../api';
import { Spinner, EmptyState, Modal } from '../../components/ui';
import { formatBytes, formatDate } from '../../utils/helpers';

const IMAGES_PER_PAGE = 10;

const fetchStorageStats = async () => {
  const response = await systemAPI.storageStats();
  return response.data;
};

export default function StoragePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const imageRefs = useRef({});

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['storage-stats'],
    queryFn: fetchStorageStats,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const handleRefresh = () => {
    refetch();
    toast.success('Storage data refreshed!');
    setLoadedImages(new Set());
  };

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      await systemAPI.clearCache();
      toast.success('Cache cleared successfully!');
      refetch();
    } catch (err) {
      toast.error('Failed to clear cache: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!selectedImage) return;
    try {
      await systemAPI.deleteImage(selectedImage);
      toast.success('Image deleted successfully!');
      setShowDeleteModal(false);
      setSelectedImage(null);
      refetch();
    } catch (err) {
      toast.error('Failed to delete image: ' + (err.response?.data?.message || err.message));
    }
  };

  // Pagination
  const allImages = data?.recent_uploads || [];
  const totalPages = Math.ceil(allImages.length / IMAGES_PER_PAGE);
  const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
  const currentImages = allImages.slice(startIndex, startIndex + IMAGES_PER_PAGE);

  const goToPage = (page) => {
    setCurrentPage(page);
    setLoadedImages(new Set());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Lazy load image observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const publicId = entry.target.dataset.publicid;
            if (publicId) {
              setLoadedImages(prev => new Set([...prev, publicId]));
            }
          }
        });
      },
      { rootMargin: '50px', threshold: 0.1 }
    );

    Object.values(imageRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [currentImages]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size={40} />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={FiHardDrive}
        title="Failed to load storage data"
        description="Please check your Cloudinary configuration or try again later."
        action={
          <button onClick={handleRefresh} className="btn-primary">
            <FiRefreshCw className="mr-2" /> Retry
          </button>
        }
      />
    );
  }

  const { usage, total_images, total_storage_mb, storage_by_type, recent_uploads } = data || {};

  // Calculate storage from the actual images data
  const totalImagesBytes = recent_uploads?.reduce((sum, img) => sum + (img.bytes || 0), 0) || 0;
  const totalImagesMB = totalImagesBytes / (1024 * 1024);
  
  // Use the actual data we have
  const actualStorageUsed = totalImagesMB;
  const actualTotalImages = recent_uploads?.length || 0;
  
  // Cloudinary free tier limits (25 GB = 25,600 MB)
  const FREE_STORAGE_LIMIT_MB = 25 * 1024; // 25 GB in MB
  const FREE_BANDWIDTH_LIMIT_MB = 25 * 1024; // 25 GB in MB
  
  const storagePercent = FREE_STORAGE_LIMIT_MB > 0 ? (actualStorageUsed / FREE_STORAGE_LIMIT_MB) * 100 : 0;

  const stats = [
    {
      label: 'Storage Used',
      value: formatBytes(totalImagesBytes),
      sub: `${storagePercent.toFixed(2)}% of ${formatBytes(FREE_STORAGE_LIMIT_MB * 1024 * 1024)} (Free Tier)`,
      icon: FiHardDrive,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
      progress: Math.min(storagePercent, 100),
    },
    {
      label: 'Total Images',
      value: actualTotalImages,
      sub: `${actualStorageUsed.toFixed(2)} MB total`,
      icon: FiImage,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30',
      progress: 0,
    },
    {
      label: 'Total Storage',
      value: `${actualStorageUsed.toFixed(2)} MB`,
      sub: `${storage_by_type ? Object.keys(storage_by_type).length : 0} file types`,
      icon: FiDatabase,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30',
      progress: 0,
    },
    {
      label: 'Free Space',
      value: formatBytes((FREE_STORAGE_LIMIT_MB - actualStorageUsed) * 1024 * 1024),
      sub: `${((FREE_STORAGE_LIMIT_MB - actualStorageUsed) / FREE_STORAGE_LIMIT_MB * 100).toFixed(1)}% remaining`,
      icon: FiActivity,
      color: 'text-green-500 bg-green-50 dark:bg-green-950/30',
      progress: 0,
    },
  ];

  // Get bandwidth usage from the data if available, otherwise show as 0
  const bandwidthUsedMB = usage?.bandwidth_used ? usage.bandwidth_used / (1024 * 1024) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Storage Management</h1>
          <p className="text-sm text-slate-500">Cloudinary storage overview and management</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRefresh} className="btn-outline text-sm">
            <FiRefreshCw className="mr-2" /> Refresh
          </button>
          <button onClick={handleClearCache} disabled={isClearingCache} className="btn-outline text-sm">
            <FiTrash2 className="mr-2" /> {isClearingCache ? 'Clearing...' : 'Clear Cache'}
          </button>
        </div>
      </div>

      {/* Storage Usage Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-4"
          >
            <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
              <stat.icon size={18} />
            </div>
            <div className="text-lg font-bold">{stat.value}</div>
            <div className="text-xs text-slate-500">{stat.label}</div>
            <div className="text-[10px] text-slate-400 mt-1">{stat.sub}</div>
            {stat.progress > 0 && stat.progress <= 100 && (
              <div className="mt-2 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    stat.progress > 80 ? 'bg-red-500' : 
                    stat.progress > 60 ? 'bg-amber-500' : 'bg-brand'
                  }`}
                  style={{ width: `${Math.min(stat.progress, 100)}%` }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Storage Usage Progress Bar */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Storage Usage (Free Tier: 25 GB)</h3>
          <span className="text-xs text-slate-500">
            {actualStorageUsed.toFixed(2)} MB / {FREE_STORAGE_LIMIT_MB.toFixed(0)} MB
          </span>
        </div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-brand to-purple-500 transition-all duration-500"
            style={{ width: `${Math.min(storagePercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-400">0 MB</span>
          <span className="text-[10px] text-slate-400">
            {storagePercent.toFixed(1)}% used
          </span>
          <span className="text-[10px] text-slate-400">{FREE_STORAGE_LIMIT_MB.toFixed(0)} MB</span>
        </div>
      </div>

      {/* Bandwidth Usage */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <FiGlobe className="text-brand" /> Bandwidth Usage (Free Tier: 25 GB)
          </h3>
          <span className="text-xs text-slate-500">
            {bandwidthUsedMB.toFixed(2)} MB / {FREE_BANDWIDTH_LIMIT_MB.toFixed(0)} MB
          </span>
        </div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min((bandwidthUsedMB / FREE_BANDWIDTH_LIMIT_MB) * 100, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-400">0 MB</span>
          <span className="text-[10px] text-slate-400">
            {((bandwidthUsedMB / FREE_BANDWIDTH_LIMIT_MB) * 100).toFixed(1)}% used
          </span>
          <span className="text-[10px] text-slate-400">{FREE_BANDWIDTH_LIMIT_MB.toFixed(0)} MB</span>
        </div>
      </div>

      {/* Storage by Type */}
      {storage_by_type && Object.keys(storage_by_type).length > 0 && (
        <div className="card p-4 mb-6">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <FiPieChart className="text-brand" /> Storage by Type
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(storage_by_type).map(([type, size]) => (
              <div key={type} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-sm capitalize">{type}</span>
                <span className="text-sm font-medium">{size.toFixed(2)} MB</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Uploads with Pagination */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <FiUpload className="text-brand" /> Recent Uploads
          </h3>
          <span className="text-xs text-slate-400">
            {allImages.length} images (Page {currentPage}/{totalPages || 1})
          </span>
        </div>

        {currentImages.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentImages.map((img) => {
                const isLoaded = loadedImages.has(img.public_id);
                const fileName = img.public_id.split('/').pop();
                
                return (
                  <div key={img.public_id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      {/* Thumbnail - Lazy loaded */}
                      <div 
                        ref={(el) => imageRefs.current[img.public_id] = el}
                        data-publicid={img.public_id}
                        className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                      >
                        {isLoaded ? (
                          <img 
                            src={`${img.url}?w=64&h=64&c=fill&f=auto`} 
                            alt={fileName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpath d="M21 15l-5-5-5 5-4-4-3 3"/%3E%3C/svg%3E';
                            }}
                          />
                        ) : (
                          <div className="animate-pulse bg-slate-200 dark:bg-slate-700 w-full h-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" title={fileName}>
                          {fileName}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1 text-[10px] text-slate-500">
                          <span>{formatBytes(img.bytes)}</span>
                          <span className="uppercase">{img.format || 'N/A'}</span>
                          {img.width && img.height && (
                            <span>{img.width}x{img.height}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => setPreviewImage(img)}
                            className="text-xs text-brand hover:underline flex items-center gap-1"
                          >
                            <FiEye size={12} /> View
                          </button>
                          <button
                            onClick={() => {
                              setSelectedImage(img.public_id);
                              setShowDeleteModal(true);
                            }}
                            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                          >
                            <FiTrash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-outline text-sm disabled:opacity-50"
                >
                  <FiChevronLeft className="inline mr-1" /> Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm ${
                          currentPage === pageNum
                            ? 'bg-brand text-white'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="text-sm text-slate-400">...</span>
                  )}
                </div>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn-outline text-sm disabled:opacity-50"
                >
                  Next <FiChevronRight className="inline ml-1" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-sm text-slate-500">
            No recent uploads found.
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      <Modal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        title="Image Preview"
        size="lg"
      >
        {previewImage && (
          <div className="space-y-3">
            <div className="flex justify-center">
              <img 
                src={previewImage.url} 
                alt={previewImage.public_id}
                className="max-w-full max-h-[60vh] rounded-lg object-contain"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">File Name:</span>
                <span className="ml-2 font-medium">{previewImage.public_id.split('/').pop()}</span>
              </div>
              <div>
                <span className="text-slate-500">Size:</span>
                <span className="ml-2 font-medium">{formatBytes(previewImage.bytes)}</span>
              </div>
              <div>
                <span className="text-slate-500">Format:</span>
                <span className="ml-2 font-medium uppercase">{previewImage.format || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500">Dimensions:</span>
                <span className="ml-2 font-medium">
                  {previewImage.width && previewImage.height 
                    ? `${previewImage.width}x${previewImage.height}` 
                    : 'N/A'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setPreviewImage(null);
                setSelectedImage(previewImage.public_id);
                setShowDeleteModal(true);
              }}
              className="btn-danger w-full text-sm"
            >
              <FiTrash2 className="inline mr-2" /> Delete Image
            </button>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Image"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              <FiTrash2 className="inline mr-2" />
              Are you sure you want to delete this image?
              <br />
              <span className="text-xs text-red-600 dark:text-red-300 mt-1 block">
                This action cannot be undone.
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDeleteImage}
              className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              Yes, Delete
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