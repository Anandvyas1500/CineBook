import React, { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { User, Lock, Mail, Phone, Ticket, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useToast } from '../context/UiContext';

const TABS = [
  ['profile', 'Details', User],
  ['security', 'Password', Lock]
];

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('tab');

  // Bookings live on their own page now (it used to be duplicated here).
  if (requested === 'bookings') return <Navigate to="/my-bookings" replace />;
  const tab = requested === 'security' ? 'security' : 'profile';

  // profile form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  // password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setSavingProfile(true);
    try {
      const res = await authService.updateProfile({ name: name.trim(), phone: phone.trim() });
      if (res.user) updateUser(res.user);
      toast.success('Profile updated.');
    } catch (err) {
      setProfileError(err.message || 'Could not update your profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword === currentPassword) {
      setPasswordError('Your new password must be different from the current one.');
      return;
    }
    setSavingPassword(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      toast.success('Password changed.');
    } catch (err) {
      setPasswordError(err.message || 'Could not change your password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const profileDirty = name.trim() !== (user?.name || '') || phone.trim() !== (user?.phone || '');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      <section className="card p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-center gap-6">
        <div aria-hidden="true" className="display w-20 h-20 rounded-2xl bg-brand text-on-brand flex items-center justify-center text-5xl shadow-glow-sm shrink-0">
          {(user?.name || 'U').charAt(0)}
        </div>
        <div className="text-center sm:text-left flex-1 min-w-0 space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="display text-4xl truncate">{user?.name}</h1>
            <span className="inline-flex items-center gap-1 w-fit mx-auto sm:mx-0 rounded-full border border-brand/40 bg-brand/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brand">
              <ShieldCheck className="w-3 h-3" /> {user?.role === 'admin' ? 'Administrator' : 'Member'}
            </span>
          </div>
          <p className="text-sm text-muted truncate">{user?.email}</p>
        </div>
        <Link to="/my-bookings" className="btn-ghost shrink-0"><Ticket className="w-4 h-4 text-brand" /> My tickets</Link>
      </section>

      <div role="tablist" aria-label="Account settings" className="flex gap-2">
        {TABS.map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setSearchParams({ tab: key })}
            className={`chip ${tab === key ? 'chip-active' : ''}`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === 'profile' ? (
        <form onSubmit={saveProfile} className="card p-6 sm:p-8 space-y-5" aria-label="Edit profile">
          <div>
            <label htmlFor="pf-name" className="label">Full name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-faint pointer-events-none" />
              <input id="pf-name" required maxLength={50} value={name} onChange={(e) => { setName(e.target.value); setProfileError(''); }} className="input pl-11" />
            </div>
          </div>
          <div>
            <label htmlFor="pf-email" className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-faint pointer-events-none" />
              <input id="pf-email" value={user?.email || ''} disabled readOnly className="input pl-11 opacity-60 cursor-not-allowed" />
            </div>
            <p className="mt-1.5 text-xs text-faint">Your email is your sign-in and cannot be changed here.</p>
          </div>
          <div>
            <label htmlFor="pf-phone" className="label">Phone</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-faint pointer-events-none" />
              <input id="pf-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setProfileError(''); }} placeholder="+91 98765 43210" className="input pl-11" />
            </div>
          </div>
          {profileError && <p role="alert" className="rounded-xl border border-velvet/40 bg-velvet/10 px-3.5 py-3 text-sm text-velvet-soft">{profileError}</p>}
          <button type="submit" disabled={savingProfile || !profileDirty} className="btn-primary">
            {savingProfile ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      ) : (
        <form onSubmit={savePassword} className="card p-6 sm:p-8 space-y-5" aria-label="Change password">
          <div>
            <label htmlFor="pw-current" className="label">Current password</label>
            <input id="pw-current" type={showPasswords ? 'text' : 'password'} required autoComplete="current-password" value={currentPassword} onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(''); }} className="input" />
          </div>
          <div>
            <label htmlFor="pw-new" className="label">New password</label>
            <input id="pw-new" type={showPasswords ? 'text' : 'password'} required minLength={8} autoComplete="new-password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }} placeholder="At least 8 characters" className="input" />
          </div>
          <button type="button" onClick={() => setShowPasswords((s) => !s)} className="flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink">
            {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} {showPasswords ? 'Hide' : 'Show'} passwords
          </button>
          {passwordError && <p role="alert" className="rounded-xl border border-velvet/40 bg-velvet/10 px-3.5 py-3 text-sm text-velvet-soft">{passwordError}</p>}
          <button type="submit" disabled={savingPassword} className="btn-primary">
            {savingPassword ? 'Updating...' : 'Update password'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;
