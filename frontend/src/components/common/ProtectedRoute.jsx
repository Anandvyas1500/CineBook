import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

/**
 * Route guard. Waits for the stored session to be verified before deciding,
 * so refreshing /my-bookings, /profile or /admin no longer bounces a signed-in user away.
 */
export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader message="Checking your session..." />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-velvet/15 text-velvet-soft flex items-center justify-center mx-auto border border-velvet/30">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="display text-4xl">Administrator access required</h1>
        <p className="text-sm text-muted">Only CineBook administrators can open the control panel.</p>
        <Link to="/" className="btn-primary">Back to home</Link>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
