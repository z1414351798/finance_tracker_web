import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('privacy_accepted');
    if (!accepted) {
      setVisible(true);
    }
  }, []);

  const handleAccept = async () => {
    localStorage.setItem('privacy_accepted', 'true');
    setVisible(false);
    // If the user is already logged in, record consent server-side too
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('/api/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ platform: 'web', policyVersion: '2026-05' }),
        });
      } catch (_) { /* non-blocking */ }
    }
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        backgroundColor: '#1e293b', // slate-800
        color: '#f1f5f9',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.25)',
      }}
    >
      <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', flex: '1 1 280px' }}>
        This app stores your financial data on our servers. By continuing you agree to our{' '}
        <Link
          to="/privacy"
          style={{ color: '#60a5fa', textDecoration: 'underline' }}
          onClick={handleAccept}
        >
          Privacy Policy
        </Link>{' '}
        and{' '}
        <Link
          to="/terms"
          style={{ color: '#60a5fa', textDecoration: 'underline' }}
          onClick={handleAccept}
        >
          Terms of Service
        </Link>
        .
      </p>
      <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
        <Link
          to="/privacy"
          style={{
            padding: '7px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#94a3b8',
            border: '1px solid #334155',
            textDecoration: 'none',
            backgroundColor: 'transparent',
          }}
        >
          Learn More
        </Link>
        <button
          onClick={handleAccept}
          style={{
            padding: '7px 20px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '700',
            color: '#ffffff',
            backgroundColor: '#16a34a', // green-600
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
