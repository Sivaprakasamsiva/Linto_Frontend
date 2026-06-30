/**
 * Contact page.
 */
import { Helmet } from 'react-helmet-async';
import { FiMail, FiMapPin, FiClock } from 'react-icons/fi';

export default function ContactPage() {
  return (
    <>
      <Helmet>
        <title>Contact Us - Lintro</title>
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Questions, feedback, or need help? We're here to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
            <FiMail className="w-8 h-8 text-brand mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Email</h3>
            <a href="mailto:sivaprakasamk12@gmail.com" className="text-sm text-brand hover:underline">
              sivaprakasamk12@gmail.com
            </a>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
            <FiMapPin className="w-8 h-8 text-brand mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Location</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Tirupur, TamilNadu<br />India
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
            <FiClock className="w-8 h-8 text-brand mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Support Hours</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Mon - Sat<br />9:00 AM - 6:00 PM IST
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Send a Message</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you for your message. We will respond within 24 hours.');
              e.target.reset();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Message
              </label>
              <textarea
                required
                rows={5}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>

        <div className="mt-8 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>Need to report a problem?</strong> Use the{' '}
            <a href="/complaints" className="underline">complaint system</a> for fraud, fake products,
            abuse, spam, or prohibited items.
          </p>
        </div>
      </div>
    </>
  );
}
