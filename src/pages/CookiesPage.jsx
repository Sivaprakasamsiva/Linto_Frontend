/**
 * Cookie Policy page.
 */
import { Helmet } from 'react-helmet-async';

export default function CookiesPage() {
  return (
    <>
      <Helmet>
        <title>Cookie Policy - Lintro</title>
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-6">
          Cookie Policy
        </h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: June 2026</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help
              the website remember your actions and preferences over time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">2. Cookies We Use</h2>
            <p>Lintro uses the following cookies:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600 dark:text-slate-300">
              <li>
                <strong>Session cookie (sessionid):</strong> Used by the Django admin panel for
                authentication. Deleted when you close your browser.
              </li>
              <li>
                <strong>CSRF cookie (csrftoken):</strong> Used to protect against Cross-Site Request
                Forgery attacks on Django admin forms.
              </li>
              <li>
                <strong>localStorage tokens (access_token, refresh_token):</strong> JWT authentication
                tokens stored in browser localStorage. Not technically cookies, but used for auth.
              </li>
              <li>
                <strong>Theme preference (theme):</strong> Stores your light/dark mode preference in
                localStorage.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">3. Third-Party Cookies</h2>
            <p>
              We do not use third-party tracking cookies, advertising networks, or analytics services
              that set cookies. We use Google Fonts for typography, which may set a cookie but does
              not track you across sites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">4. Managing Cookies</h2>
            <p>You can control cookies through your browser settings:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600 dark:text-slate-300">
              <li>Most browsers allow you to block all cookies or only third-party cookies.</li>
              <li>You can also delete existing cookies via your browser's privacy settings.</li>
              <li>If you disable cookies, the Django admin panel may not work properly.</li>
              <li>The main Lintro app uses JWT tokens in localStorage, not cookies, so it will continue to work.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">5. Cookie Security</h2>
            <p>
              In production, we set the following security flags on cookies:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600 dark:text-slate-300">
              <li><strong>Secure:</strong> Cookies are only sent over HTTPS.</li>
              <li><strong>HttpOnly:</strong> JavaScript cannot access cookies (prevents XSS).</li>
              <li><strong>SameSite=Lax:</strong> Cookies are not sent on cross-site requests (prevents CSRF).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">6. Contact</h2>
            <p>
              Questions about cookies? Contact us at{' '}
              <a href="mailto:sivaprakasamk12@gmail.com" className="text-brand hover:underline">sivaprakasamk12@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
