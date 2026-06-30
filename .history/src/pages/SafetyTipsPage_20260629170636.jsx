/**
 * Safety tips page.
 */
import { FiShield, FiAlertTriangle, FiCheckCircle, FiXCircle, FiPhone, FiMapPin, FiEye } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';

const TIPS = [
  { icon: FiCheckCircle, title: 'Verify the seller', text: 'Look for the Verified Seller badge. Check their profile, joined date, and other listings.' },
  { icon: FiCheckCircle, title: 'Meet in public places', text: 'Always meet buyers/sellers in well-lit, public locations like cafes, malls, or police stations.' },
  { icon: FiCheckCircle, title: 'Inspect the product', text: 'Thoroughly inspect the item before paying. Test electronics, check for damages.' },
  { icon: FiXCircle, title: 'Never pay in advance', text: 'Do not transfer money before seeing the product. Beware of urgent payment requests.' },
  { icon: FiXCircle, title: 'Beware of too-good-to-be-true deals', text: 'If a deal seems unrealistically cheap, it probably is a scam.' },
  { icon: FiXCircle, title: 'Do not share OTPs', text: 'Lintro will never ask for your OTP, password, or bank details over chat or phone.' },
  { icon: FiEye, title: 'Check product authenticity', text: 'For branded items (mobiles, watches), verify serial numbers and original bills.' },
  { icon: FiMapPin, title: 'Share your location', text: 'Inform a friend/family member about your meeting location and time.' },
];

export default function SafetyTipsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Helmet><title>Safety Tips - Lintro</title></Helmet>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-3">
          <FiShield className="text-brand" size={32} />
        </div>
        <h1 className="font-display font-bold text-3xl mb-2">Stay Safe on Lintro</h1>
        <p className="text-slate-500">Follow these guidelines to protect yourself while buying and selling.</p>
      </div>

      <div className="alert-warn mb-6 flex items-start gap-2">
        <FiAlertTriangle className="shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Important</p>
          <p>Buyers must verify the seller before making any payment. Lintro Marketplace only connects buyers and sellers and is not responsible for offline transactions, payments, or deliveries.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        {TIPS.map((tip, i) => {
          const Icon = tip.icon;
          const isDo = tip.title.startsWith('Verify') || tip.title.startsWith('Meet') || tip.title.startsWith('Inspect') || tip.title.startsWith('Check') || tip.title.startsWith('Share');
          return (
            <div key={i} className={`card p-4 ${isDo ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}`}>
              <Icon className={isDo ? 'text-green-500' : 'text-red-500'} />
              <h3 className="font-semibold mt-2">{tip.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{tip.text}</p>
            </div>
          );
        })}
      </div>

      <div className="card p-4 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
        <h3 className="font-semibold text-red-800 dark:text-red-200 flex items-center gap-2">
          <FiAlertTriangle /> Report Suspicious Activity
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
          If you encounter fraud, fake products, or abuse, file a complaint immediately.
          Our admin team will investigate and take appropriate action.
        </p>
        <a href="/complaints" className="btn-danger mt-3">File a Complaint</a>
      </div>
    </div>
  );
}
