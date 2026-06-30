import { Link } from 'react-router-dom';
import { FiAlertCircle } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';

export default function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <Helmet><title>404 - Lintro</title></Helmet>
      <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
        <FiAlertCircle className="text-amber-500" size={36} />
      </div>
      <h1 className="font-display font-bold text-4xl mb-2">404</h1>
      <p className="text-slate-500 mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary">Go Home</Link>
    </div>
  );
}
