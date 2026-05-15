import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-8"
        >
          <ArrowLeft size={16} /> Back
        </Link>

        <h1 className="text-3xl font-black text-gray-900 mb-1">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">
          App: FinanceTracker (wisefintrakr.com) &mdash; Last updated: May 2026
        </p>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Account info:</strong> username, email address</li>
              <li><strong>Financial data:</strong> transaction names, amounts, dates, categories, notes</li>
              <li><strong>Receipt images:</strong> photos you upload, stored securely in cloud storage</li>
              <li><strong>Usage data:</strong> login times, feature usage (no third-party analytics)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>To provide and operate the FinanceTracker service</li>
              <li>To display your financial summaries and history</li>
              <li>To store your receipt images and link them to transactions</li>
              <li>We do <strong>NOT</strong> sell, rent, or share your data with third parties for marketing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. Data Storage &amp; Security</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Your data is stored on servers located in the United States</li>
              <li>All data is transmitted over HTTPS (TLS encryption)</li>
              <li>Passwords are hashed and never stored in plain text</li>
              <li>Receipt images are stored in private cloud storage with time-limited access URLs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. Third-Party Services</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Google Sign-In (optional):</strong> if you use Google login, Google&apos;s privacy
                policy applies to that authentication step. We only receive your Google email address.
              </li>
              <li>
                <strong>Cloud Storage:</strong> receipt images are stored using MinIO-compatible object
                storage on our own servers. No third-party image hosting.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">5. Data Retention</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Your data is retained as long as your account is active</li>
              <li>You may delete individual transactions or your entire account at any time by contacting us</li>
              <li>Upon account deletion, all your data is permanently removed within 30 days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">6. Your Rights (GDPR &amp; CCPA)</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Right to access:</strong> request a copy of your data</li>
              <li><strong>Right to deletion:</strong> request deletion of your account and all data</li>
              <li><strong>Right to correction:</strong> edit any transaction or profile information directly in the app</li>
              <li><strong>Right to portability:</strong> contact us to export your data</li>
              <li>California residents: we do not sell personal information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">7. Children&apos;s Privacy</h2>
            <p>
              FinanceTracker is not directed at children under 13. We do not knowingly collect data from children.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">8. Changes to This Policy</h2>
            <p>
              We will notify users of significant changes via the app or email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">9. Contact</h2>
            <p>
              For privacy questions or data requests, contact us through the app or at{' '}
              <a href="https://wisefintrakr.com" className="text-blue-600 hover:underline">wisefintrakr.com</a>.
            </p>
          </section>

        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 text-xs text-gray-400 text-center">
          <Link to="/terms" className="hover:underline text-blue-500">Terms of Service</Link>
          {' '}&middot;{' '}
          <Link to="/privacy" className="hover:underline text-blue-500">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
