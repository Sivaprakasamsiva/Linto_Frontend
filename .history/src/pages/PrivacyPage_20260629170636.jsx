/**
 * Privacy Policy page.
 */
import { Helmet } from 'react-helmet-async';

export default function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Lintro</title>
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-6">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: June 2026</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">1. Introduction</h2>
            <p>
              Lintro Marketplace ("we", "us", or "our") respects your privacy. This Privacy Policy
              explains how we collect, use, and protect your information when you use our website
              (the "Service"). By using the Service, you agree to the practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">2. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600 dark:text-slate-300">
              <li><strong>Account information:</strong> name, email address, mobile number, WhatsApp number, district, state.</li>
              <li><strong>Profile information:</strong> profile image, bio, address, GPS coordinates (optional).</li>
              <li><strong>Listing information:</strong> product details, images, price, location.</li>
              <li><strong>Verification documents:</strong> government ID images, address proof (if you submit verification).</li>
              <li><strong>Communications:</strong> inquiries, buy requests, chat messages.</li>
              <li><strong>Usage data:</strong> IP address, browser type, pages visited, audit logs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1 text-slate-600 dark:text-slate-300">
              <li>To create and manage your account.</li>
              <li>To verify your identity (via OTP and optional government ID).</li>
              <li>To display your listings and connect you with buyers or sellers.</li>
              <li>To send you notifications about your account, listings, and messages.</li>
              <li>To investigate and prevent fraud, abuse, and prohibited activity.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">4. Information Sharing</h2>
            <p>
              We do not sell your information. We share your information only in the following cases:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600 dark:text-slate-300">
              <li><strong>Public profiles:</strong> your name, district, state, verified badge, and joined date are visible to other users.</li>
              <li><strong>Listing details:</strong> product information and your seller info are public when you create a listing.</li>
              <li><strong>Buy requests:</strong> the buyer's name, phone, WhatsApp, location, and message are shared with the seller.</li>
              <li><strong>Legal compliance:</strong> we may disclose information to law enforcement if required by law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">5. Data Security</h2>
            <p>
              We use industry-standard security measures including JWT authentication with refresh
              token rotation and blacklisting, HTTPS encryption, brute-force protection (5 failed
              logins trigger a 1-hour lockout), rate limiting, and Content Security Policy (CSP).
              Verification documents are stored on Cloudinary with access controls.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">6. Data Retention</h2>
            <p>
              We retain your account information for as long as your account is active. Read
              notifications are deleted after 90 days. Blacklisted JWT tokens are deleted daily.
              Old brute-force attempt records are deleted weekly. If you delete your account,
              we will remove your personal information within 30 days, except where retention is
              required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600 dark:text-slate-300">
              <li>Access your personal information.</li>
              <li>Correct inaccurate information.</li>
              <li>Request deletion of your account.</li>
              <li>Object to certain processing of your data.</li>
              <li>Withdraw consent for optional data collection (e.g., GPS coordinates).</li>
            </ul>
            <p className="mt-2">To exercise these rights, contact us at sivaprakasamk12@gmail.com.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">8. Cookies</h2>
            <p>
              We use essential cookies for authentication (session cookies for the Django admin)
              and CSRF protection. We do not use third-party tracking cookies or advertising networks.
              See our <a href="/cookies" className="text-brand hover:underline">Cookie Policy</a> for details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">9. Third-Party Services</h2>
            <p>We use the following third-party services that may collect information:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600 dark:text-slate-300">
              <li><strong>Cloudinary:</strong> image storage for product, profile, and verification images.</li>
              <li><strong>Gmail SMTP:</strong> email delivery for OTP and notifications.</li>
              <li><strong>Google Fonts:</strong> font delivery (Poppins, Inter).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant
              changes by posting a notice on the Service or sending you an email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">11. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, contact us at:
              <br />
              Email: <a href="mailto:sivaprakasamk12@gmail.com" className="text-brand hover:underline">sivaprakasamk12@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
