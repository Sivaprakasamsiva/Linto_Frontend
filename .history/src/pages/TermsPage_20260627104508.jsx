/**
 * Terms of Service page.
 */
import { Helmet } from 'react-helmet-async';

export default function TermsPage() {
  return (
    <>
      <Helmet>
        <title>Terms of Service - Lintro</title>
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-6">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: June 2026</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Lintro Marketplace (the "Service"), you agree to be bound by
              these Terms of Service ("Terms"). If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">2. Description of Service</h2>
            <p>
              Lintro is a platform that connects buyers and sellers of second-hand goods in India.
              <strong> The Service does NOT process payments, handle deliveries, or facilitate transactions.</strong>
              All transactions happen offline between users at their own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">3. User Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-1 text-slate-600 dark:text-slate-300">
              <li>Provide accurate information when registering.</li>
              <li>Verify your email via OTP before using the Service.</li>
              <li>Do not post fraudulent, illegal, or prohibited items.</li>
              <li>Respond to buy requests within 24 hours (or your listing will be unlisted).</li>
              <li>Do not harass, abuse, or scam other users.</li>
              <li>Do not attempt to circumvent the platform's safety mechanisms.</li>
              <li>Comply with all applicable Indian laws and regulations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">4. Prohibited Items</h2>
            <p>You may not list the following on Lintro:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600 dark:text-slate-300">
              <li>Weapons, firearms, ammunition, explosives.</li>
              <li>Illegal drugs and controlled substances.</li>
              <li>Counterfeit or pirated goods.</li>
              <li>Stolen property.</li>
              <li>Living animals (excluding pet adoption with proper documentation).</li>
              <li>Personal data of others.</li>
              <li>Adult content and services.</li>
              <li>Any item prohibited under Indian law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">5. Transactions and Risk</h2>
            <p>
              <strong>All transactions occur offline between buyers and sellers.</strong> Lintro is not
              a party to any transaction and is not responsible for:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600 dark:text-slate-300">
              <li>The quality, safety, or legality of items listed.</li>
              <li>The truthfulness of listings or user statements.</li>
              <li>Payments made between users.</li>
              <li>Delivery or non-delivery of items.</li>
              <li>Disputes between buyers and sellers.</li>
            </ul>
            <p className="mt-2">
              <strong>Buyers must verify the seller before making any payment.</strong> Meet in safe public
              locations, inspect products before purchasing, and use secure payment methods.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">6. Listing Rules</h2>
            <ul className="list-disc pl-6 space-y-1 text-slate-600 dark:text-slate-300">
              <li>Listings expire after 30 days unless refreshed.</li>
              <li>Listings are unlisted if you don't respond to a buy request within 24 hours.</li>
              <li>Unlisted listings are archived after 7 days, with all images deleted.</li>
              <li>You may upload up to 5 images per listing (max 8 MB each, JPEG/PNG/WebP).</li>
              <li>Prices must be between Rs 1 and Rs 1,00,00,000 (1 crore).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">7. Verification</h2>
            <p>
              Sellers may submit government ID documents (Aadhaar, PAN, Driving License, Voter ID, Passport)
              for verification. Verified sellers receive a badge on their listings and profile.
              Verification does not guarantee the seller's trustworthiness — buyers must still verify
              independently before payment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">8. Account Suspension and Ban</h2>
            <p>
              We may suspend (typically for 7 days) or ban users who violate these Terms. Reasons include:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600 dark:text-slate-300">
              <li>Fraud or scam attempts.</li>
              <li>Fake product listings.</li>
              <li>Abuse, harassment, or hate speech.</li>
              <li>Spam or unsolicited commercial messages.</li>
              <li>Prohibited items.</li>
              <li>Multiple verified complaints from other users.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">9. Intellectual Property</h2>
            <p>
              You retain ownership of content you post (listing text, images, profile info). You grant
              Lintro a non-exclusive, royalty-free license to display your content on the Service for
              the duration of your listing. Reported fraudulent content may be removed without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">10. Disclaimer of Warranties</h2>
            <p>
              The Service is provided "as is" without warranties of any kind. We do not guarantee that
              the Service will be uninterrupted, error-free, or secure. We do not warrant the accuracy
              of listings or the trustworthiness of users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">11. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Lintro shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including loss of profits, data,
              or goodwill, arising out of your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">12. Governing Law</h2>
            <p>
              These Terms are governed by the laws of India. Any disputes shall be resolved in the
              courts of Tirupur, TamilNadu.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">13. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of significant changes
              by posting a notice on the Service or sending you an email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">14. Contact</h2>
            <p>
              Questions about these Terms? Contact us at{' '}
              <a href="mailto:sivaprakasamk12@gmail.com" className="text-brand hover:underline">sivaprakasamk12@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
