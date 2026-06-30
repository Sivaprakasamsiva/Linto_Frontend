/**
 * Utility helpers.
 */

/**
 * BUG-007 fix: format DRF API errors into a single human-readable string.
 *
 * DRF validation errors come back as {field: [msg1, msg2], other: [msg], non_field_errors: [msg]}
 * DRF auth errors come back as {detail: msg}
 * Network errors have no response.data
 *
 * Returns a string suitable for toast.error().
 */
export function formatApiError(err) {
  if (!err) return 'Unknown error';

  // Network error / no response
  if (!err.response) {
    if (err.message) return err.message;
    return 'Network error. Please check your connection.';
  }

  const data = err.response.data;
  if (!data) return `Request failed with status ${err.response.status}`;

  // Auth-style error: {detail: "..."}
  if (data.detail && typeof data.detail === 'string') return data.detail;

  // Validation errors: {field: [...], ...}
  if (typeof data === 'object' && !Array.isArray(data)) {
    const messages = [];
    for (const [field, value] of Object.entries(data)) {
      const fieldLabel = field === 'non_field_errors' ? '' : `${field}: `;
      if (Array.isArray(value)) {
        messages.push(`${fieldLabel}${value.join(' ')}`);
      } else if (typeof value === 'string') {
        messages.push(`${fieldLabel}${value}`);
      } else if (typeof value === 'object' && value !== null) {
        // nested field errors
        for (const [subField, subValue] of Object.entries(value)) {
          const subLabel = subField === 'non_field_errors' ? '' : `${subField}: `;
          if (Array.isArray(subValue)) {
            messages.push(`${fieldLabel}${subLabel}${subValue.join(' ')}`);
          } else {
            messages.push(`${fieldLabel}${subLabel}${String(subValue)}`);
          }
        }
      }
    }
    if (messages.length) return messages.join(' | ');
  }

  // Fallback
  return `Request failed with status ${err.response.status}`;
}

export function formatPrice(price) {
  if (price === null || price === undefined) return '₹0';
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function timeAgo(date) {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function timeRemaining(seconds) {
  if (seconds <= 0) return 'Expired';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function truncate(str, n = 100) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '...' : str;
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function getStatusColor(status) {
  const map = {
    available: 'badge-available',
    pending: 'badge-pending',
    reserved: 'badge-pending',
    sold: 'badge-sold',
    expired: 'badge badge-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    unlisted: 'badge bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    archived: 'badge bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    deleted: 'badge bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return map[status] || 'badge bg-slate-100 text-slate-700';
}

export function getStatusLabel(status) {
  const map = {
    available: 'Available',
    pending: 'Pending Response',
    reserved: 'Reserved',
    sold: 'Sold',
    expired: 'Expired',
    unlisted: 'Unlisted (24h Missed)',
    archived: 'Archived',
    deleted: 'Deleted',
  };
  return map[status] || status;
}

export function getConditionLabel(condition) {
  const map = {
    new: 'Brand New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
    defective: 'Defective',
  };
  return map[condition] || condition;
}

export function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  });
}

// frontend/src/utils/helpers.js

export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
