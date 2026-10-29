import React, { useState } from 'react';
import { Mail, Lock, User, Phone, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Demo-account shortcuts are for development / presentations only.
// They show in `npm run dev`, or in a build made with VITE_SHOW_DEMO_ACCOUNTS=true.
const SHOW_DEMO = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_ACCOUNTS === 'true';

const DEMO = {
  user: { email: 'user@cinebook.com', password: 'User@123' },
  admin: { email: 'admin@cinebook.com', password: 'Admin@123' }
};

const Field = ({ id, label, icon: Icon, children }) => (
  <div>
    <label htmlFor={id} className="label">{label}</label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-faint pointer-events-none" />
      {children}
    </div>
  </div>
);

/**
 * The ONE sign-in / sign-up form, used by the modal and by the /login and /signup pages.
 * mode: 'login' | 'register'
 */
export const AuthForm = ({ mode, onModeChange, onSuccess, idPrefix = 'auth' }) => {
  const { login, register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isLogin = mode === 'login';

  const update = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const fillDemo = (role) => {
    onModeChange?.('login');
    setForm((f) => ({ ...f, ...DEMO[role] }));
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = isLogin
        ? await login(form.email.trim(), form.password)
        : await register({ name: form.name.trim(), email: form.email.trim(), password: form.password, phone: form.phone.trim() });
      onSuccess?.(res.user);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate={false}>
      {SHOW_DEMO && (
        <div className="rounded-2xl border border-dashed border-brand/40 bg-brand/5 p-3 space-y-2">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-brand">
            <Sparkles className="w-3.5 h-3.5" /> Demo shortcuts
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => fillDemo('user')} className="btn-ghost btn-sm">Fill member</button>
            <button type="button" onClick={() => fillDemo('admin')} className="btn-ghost btn-sm">Fill admin</button>
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-velvet/40 bg-velvet/10 px-3.5 py-3 text-sm text-velvet-soft">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!isLogin && (
        <Field id={`${idPrefix}-name`} label="Full name" icon={User}>
          <input id={`${idPrefix}-name`} name="name" type="text" required maxLength={50} autoComplete="name" value={form.name} onChange={update} placeholder="Rahul Sharma" className="input pl-11" />
        </Field>
      )}

      <Field id={`${idPrefix}-email`} label="Email" icon={Mail}>
        <input id={`${idPrefix}-email`} name="email" type="email" required autoComplete="email" value={form.email} onChange={update} placeholder="you@example.com" className="input pl-11" />
      </Field>

      <Field id={`${idPrefix}-password`} label="Password" icon={Lock}>
        <input
          id={`${idPrefix}-password`}
          name="password"
          type={showPassword ? 'text' : 'password'}
          required
          minLength={isLogin ? undefined : 8}
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          value={form.password}
          onChange={update}
          placeholder={isLogin ? 'Your password' : 'At least 8 characters'}
          className="input pl-11 pr-12"
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-faint hover:text-ink"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </Field>

      {!isLogin && (
        <Field id={`${idPrefix}-phone`} label="Phone (optional)" icon={Phone}>
          <input id={`${idPrefix}-phone`} name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={update} placeholder="+91 98765 43210" className="input pl-11" />
        </Field>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5">
        {loading ? <span className="w-5 h-5 rounded-full border-2 border-on-brand border-t-transparent animate-spin" /> : isLogin ? 'Sign in' : 'Create my account'}
      </button>
    </form>
  );
};

export default AuthForm;
