/**
 * Footer with safety notice.
 */
import { Link } from 'react-router-dom';
import { FiShield, FiAlertTriangle } from 'react-icons/fi';
import LintroLogo from '../../Logo/Lintro_Logo.png';  

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center overflow-hidden">
                <img 
                  src={LintroLogo} 
                  alt="Lintro" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-display font-bold text-lg text-white">
                Lintro<span className="text-brand"></span>
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-3">
              India's marketplace for second-hand products. Buy, sell, and connect with verified sellers near you.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Marketplace</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/search" className="hover:text-brand">Browse Products</Link></li>
              <li><Link to="/sell" className="hover:text-brand">Sell an Item</Link></li>
              <li><Link to="/" className="hover:text-brand">Categories</Link></li>
              <li><Link to="/favorites" className="hover:text-brand">Favorites</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/dashboard" className="hover:text-brand">My Dashboard</Link></li>
              <li><Link to="/profile" className="hover:text-brand">My Profile</Link></li>
              <li><Link to="/verification" className="hover:text-brand">Get Verified</Link></li>
              <li><Link to="/messages" className="hover:text-brand">Messages</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Safety & Help</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/safety-tips" className="hover:text-brand">Safety Tips</Link></li>
              <li><Link to="/complaints" className="hover:text-brand">File a Complaint</Link></li>
              <li><Link to="/about" className="hover:text-brand">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-brand">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-4 rounded-lg bg-amber-900/30 border border-amber-700/40 flex items-start gap-3">
          <FiAlertTriangle className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-200 text-sm">Important Safety Notice</p>
            <p className="text-amber-100/80 text-xs mt-1">
              Buyers must verify the seller before making any payment. Lintro only connects users
              and is not responsible for offline transactions, payments, or deliveries. All payments
              and deliveries happen outside the website at the buyer's and seller's own risk.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Lintro Marketplace. Made in India.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link to="/privacy" className="hover:text-brand">Privacy</Link>
            <Link to="/terms" className="hover:text-brand">Terms</Link>
            <Link to="/cookies" className="hover:text-brand">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
