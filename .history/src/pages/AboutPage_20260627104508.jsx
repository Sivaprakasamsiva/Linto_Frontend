/**
 * About Us page.
 */
import { Helmet } from 'react-helmet-async';
import { FiTarget, FiShield, FiUsers, FiHeart } from 'react-icons/fi';

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Us - Lintro</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">
            About Lintro
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            India's marketplace for second-hand products. Buy, sell, and connect with verified sellers near you.
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none mb-12">
          <p>
            Lintro is a platform built for India. We connect buyers and sellers of second-hand goods
            including mobile phones, laptops, vehicles, furniture, books, and more. Our mission is to make
            it easy, safe, and affordable for people across India to find great deals on pre-owned items
            while reducing waste and promoting a circular economy.
          </p>
          <p>
            <strong>Important:</strong> Lintro is a connection platform only. We do not process payments
            and we do not handle deliveries. All transactions happen offline between the buyer and seller,
            at their own risk. We strongly encourage all buyers to verify the seller before making any payment,
            meet in safe public locations, and inspect products before purchasing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <FiTarget className="w-8 h-8 text-brand mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Our Mission</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Make second-hand buying and selling in India safe, easy, and trustworthy.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <FiShield className="w-8 h-8 text-brand mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Verified Sellers</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Sellers can submit government IDs to earn a "Verified Seller" badge shown on every listing.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <FiUsers className="w-8 h-8 text-brand mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">One Account</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Every user can buy, sell, ask questions, and chat with a single account. No separate buyer/seller types.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <FiHeart className="w-8 h-8 text-brand mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Made in India</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Built with love for the Indian market, with local categories, pincodes, and pricing in INR.
            </p>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
          <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">Safety Reminder</h3>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Buyers must verify the seller before making any payment. Lintro only connects users
            and is not responsible for offline transactions, payments, or deliveries. All payments
            and deliveries happen outside the website at the buyer's and seller's own risk.
          </p>
        </div>
      </div>
    </>
  );
}
