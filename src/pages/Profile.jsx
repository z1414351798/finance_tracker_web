import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Toast from '@radix-ui/react-toast';
import { User, Mail, Lock, Camera, LogOut, Trash2 } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Email form
  const [email, setEmail] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);

  // Password form
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);

  // Avatar
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const avatarInputRef = useRef(null);

  // Toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState({ title: '', description: '', variant: 'success' });

  const token = () => localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('privacy_accepted');
        navigate('/login');
      } else {
        showToast('Error', 'Failed to delete account. Please try again.', 'error');
      }
    } catch {
      showToast('Error', 'Network error. Please try again.', 'error');
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  const showToast = (title, description, variant = 'success') => {
    setToastMsg({ title, description, variant });
    setToastOpen(false);
    setTimeout(() => setToastOpen(true), 10);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${token()}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setEmail(data.email || '');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarUpload = async (file) => {
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token()}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(prev => ({ ...prev, presignedImageUrl: data.presignedImageUrl || prev.presignedImageUrl }));
        showToast('Avatar updated', 'Your profile picture has been updated.');
      } else {
        showToast('Upload failed', 'Could not update avatar.', 'error');
      }
    } catch (err) {
      showToast('Upload failed', err.message, 'error');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleEmailSave = async (e) => {
    e.preventDefault();
    setEmailSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token()}`
        },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        showToast('Email updated', 'Your email address has been saved.');
      } else {
        showToast('Save failed', 'Could not update email.', 'error');
      }
    } catch (err) {
      showToast('Save failed', err.message, 'error');
    } finally {
      setEmailSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showToast('Passwords do not match', 'New password and confirm password must match.', 'error');
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token()}`
        },
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      });
      if (res.ok) {
        showToast('Password changed', 'Your password has been updated.');
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const err = await res.json().catch(() => ({}));
        showToast('Change failed', err.message || 'Current password may be incorrect.', 'error');
      }
    } catch (err) {
      showToast('Change failed', err.message, 'error');
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Toast.Provider swipeDirection="right">
      <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6 min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Profile</h1>

        {/* Avatar + Username card */}
        <div className="rounded-3xl shadow-sm p-5 md:p-8 flex flex-col items-center gap-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="relative">
            {profile?.presignedImageUrl ? (
              <img
                src={profile.presignedImageUrl}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border-4 border-blue-100 dark:border-blue-900/30">
                <User size={40} className="text-blue-300" />
              </div>
            )}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition shadow-md disabled:opacity-60"
            >
              {avatarUploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera size={14} />
              )}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { if (e.target.files[0]) handleAvatarUpload(e.target.files[0]); }}
            />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{profile?.username}</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Username</p>
          </div>
        </div>

        {/* Email card */}
        <div className="rounded-3xl shadow-sm p-5 md:p-8 space-y-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <Mail size={18} className="text-blue-600" />
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Email Address</h2>
          </div>
          <form onSubmit={handleEmailSave} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition text-sm dark:text-gray-100"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}
            />
            <button
              type="submit"
              disabled={emailSaving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition disabled:opacity-60"
            >
              {emailSaving ? 'Saving…' : 'Save Email'}
            </button>
          </form>
        </div>

        {/* Change Password card */}
        <div className="rounded-3xl shadow-sm p-5 md:p-8 space-y-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <Lock size={18} className="text-blue-600" />
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Change Password</h2>
          </div>
          <form onSubmit={handlePasswordSave} className="space-y-3">
            <input
              type="password"
              placeholder="Current password"
              value={pwForm.currentPassword}
              onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition text-sm dark:text-gray-100"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}
            />
            <input
              type="password"
              placeholder="New password"
              value={pwForm.newPassword}
              onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition text-sm dark:text-gray-100"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={pwForm.confirmPassword}
              onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition text-sm dark:text-gray-100"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}
            />
            <button
              type="submit"
              disabled={pwSaving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition disabled:opacity-60"
            >
              {pwSaving ? 'Updating…' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition text-red-500"
          style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}
        >
          <LogOut size={18} /> Sign Out
        </button>

        {/* Delete Account */}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-rose-50 dark:bg-rose-900/10 text-rose-800 dark:text-rose-400 font-semibold text-sm hover:bg-rose-100 dark:hover:bg-rose-900/20 transition border border-rose-200 dark:border-rose-900/30"
        >
          <Trash2 size={18} /> Delete Account
        </button>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="rounded-2xl shadow-2xl p-6 max-w-sm w-full" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <Trash2 size={20} className="text-rose-700 dark:text-rose-400" />
              </div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Delete Account?</h3>
            </div>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              This will permanently delete your account, all transactions, categories, goals, and uploaded images.{' '}
              <strong className="text-rose-700 dark:text-rose-400">This cannot be undone.</strong>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-[#334155] transition"
                style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 transition disabled:opacity-60"
              >
                {deletingAccount ? 'Deleting…' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast.Root
        open={toastOpen}
        onOpenChange={setToastOpen}
        className={`fixed bottom-6 right-6 z-50 flex flex-col gap-1 p-4 rounded-2xl shadow-lg border text-sm min-w-[280px] ${
          toastMsg.variant === 'error'
            ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-400'
            : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400'
        }`}
        duration={3500}
      >
        <Toast.Title className="font-bold">{toastMsg.title}</Toast.Title>
        {toastMsg.description && (
          <Toast.Description className="text-xs opacity-80">{toastMsg.description}</Toast.Description>
        )}
      </Toast.Root>
      <Toast.Viewport />
    </Toast.Provider>
  );
}
