import React, { useState, useEffect, useRef } from 'react';
import * as Toast from '@radix-ui/react-toast';
import { User, Mail, Lock, Camera } from 'lucide-react';

export default function Profile() {
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
  const avatarInputRef = useRef(null);

  // Toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState({ title: '', description: '', variant: 'success' });

  const token = () => localStorage.getItem('token');

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
      <div className="p-8 max-w-2xl mx-auto space-y-6 bg-gray-50/50 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800">Profile</h1>

        {/* Avatar + Username card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center gap-4">
          <div className="relative">
            {profile?.presignedImageUrl ? (
              <img
                src={profile.presignedImageUrl}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center border-4 border-blue-100">
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
            <p className="text-xl font-bold text-gray-800">{profile?.username}</p>
            <p className="text-sm text-gray-400">Username</p>
          </div>
        </div>

        {/* Email card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
            <Mail size={18} className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">Email Address</h2>
          </div>
          <form onSubmit={handleEmailSave} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
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
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
            <Lock size={18} className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordSave} className="space-y-3">
            <input
              type="password"
              placeholder="Current password"
              value={pwForm.currentPassword}
              onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
            />
            <input
              type="password"
              placeholder="New password"
              value={pwForm.newPassword}
              onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={pwForm.confirmPassword}
              onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
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
      </div>

      {/* Toast */}
      <Toast.Root
        open={toastOpen}
        onOpenChange={setToastOpen}
        className={`fixed bottom-6 right-6 z-50 flex flex-col gap-1 p-4 rounded-2xl shadow-lg border text-sm min-w-[280px] ${
          toastMsg.variant === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
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
