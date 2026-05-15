import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-8"
        >
          <ArrowLeft size={16} /> Back
        </Link>

        <h1 className="text-3xl font-black text-gray-900 mb-1">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-8">
          FinanceTracker (wisefintrakr.com) &mdash; Last updated: May 2026
        </p>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. Acceptance of Terms</h2>
            <p>
              By creating an account you agree to these Terms of Service and our{' '}
              <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. Use of Service</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>FinanceTracker is provided for personal finance tracking purposes only</li>
              <li>You must be 13 years or older to use the service</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>Do not use the service for illegal financial activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. Account Responsibility</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>You are responsible for all activity under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>We reserve the right to suspend accounts that violate these terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. Data Ownership</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>You own your financial data</li>
              <li>By uploading receipt images you grant us a limited license to store and display them to you</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">5. Service Availability</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>We strive for high availability but do not guarantee uninterrupted service</li>
              <li>We are not liable for any financial decisions made based on information in the app</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">6. Limitation of Liability</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>FinanceTracker is provided &quot;as is&quot; without warranties</li>
              <li>We are not liable for any loss of data or financial loss arising from use of the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">7. Termination</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>You may delete your account at any time</li>
              <li>We may terminate accounts that violate these terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">8. Governing Law</h2>
            <p>These terms are governed by the laws of the United States.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">9. Contact</h2>
            <p>
              Questions: contact us through{' '}
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
