import React from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/common/AuthForm';
import Logo from '../components/common/Logo';

export const LoginPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  if (!loading && isAuthenticated) return <Navigate to={from} replace />;

  return (
    <div className="max-w-md mx-auto px-4 py-14 animate-fade-up">
      <div className="card overflow-hidden">
        <div className="h-2 marquee-lights" aria-hidden="true" />
        <div className="p-7 sm:p-9 space-y-6">
          <div className="flex flex-col items-center text-center gap-3">
            <Logo compact />
            <h1 className="display text-5xl">Welcome back</h1>
            <p className="text-sm text-muted">Sign in to see your tickets and book faster.</p>
          </div>
          <AuthForm mode="login" idPrefix="login" onSuccess={() => navigate(from, { replace: true })} />
          <p className="text-center text-sm text-muted">
            New to CineBook? <Link to="/signup" state={location.state} className="font-bold text-brand hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
