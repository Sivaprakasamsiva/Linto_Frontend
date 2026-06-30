/**
 * Persistent safety banner shown at top of every page.
 *
 * BUG-022 fix: the banner text now comes from the backend
 * /api/system/public-config/ platform_notice field (configurable by admin
 * via System Settings -> platform_notice). Falls back to a hardcoded
 * default if the API call fails.
 */
import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import { usePublicConfig } from '../../hooks/queries';

const DEFAULT_NOTICE = 'Buyers must verify the seller before making any payment. Lintro only connects users and is not responsible for offline transactions.';

export default function SafetyBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { data: config } = usePublicConfig();

  useEffect(() => {
    const dismissedAt = sessionStorage.getItem('safety-banner-dismissed');
    if (dismissedAt) setDismissed(true);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('safety-banner-dismissed', '1');
  };

  if (dismissed) return null;

  // BUG-022 fix: read notice from backend (admin-configurable)
  const notice = config?.platform_notice || DEFAULT_NOTICE;

  return (
    <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
          <FiAlertTriangle className="shrink-0" />
          <p className="flex-1">
            <span className="font-semibold">Safety Notice:</span>{' '}
            {notice}
          </p>
          <button
            onClick={dismiss}
            className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900 rounded shrink-0"
            aria-label="Dismiss"
          >
            <FiX size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
