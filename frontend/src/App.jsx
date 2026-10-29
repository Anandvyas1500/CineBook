import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { Film } from 'lucide-react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Loader from './components/common/Loader';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import MovieDetailPage from './pages/MovieDetailPage';
import SelectCityPage from './pages/SelectCityPage';
import TheatresPage from './pages/TheatresPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';
import BookingSuccessPage from './pages/BookingSuccessPage';

// The control panel is large and only admins ever open it, so it loads on demand.
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

// Scroll to top when navigating to a new route
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFoundPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-brand/15 text-brand flex items-center justify-center mx-auto border border-brand/30">
        <Film className="w-8 h-8" />
      </div>
      <h1 className="display text-6xl">Scene not found</h1>
      <p className="text-sm text-muted">The page you are looking for has left the auditorium.</p>
      <Link to="/" className="btn-primary">Back to the lobby</Link>
    </div>
  );
}

export function App() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] btn-primary">
        Skip to content
      </a>
      <ScrollToTop />
      <Navbar />

      <main id="main" className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movie/:idOrSlug" element={<MovieDetailPage />} />
          <Route path="/select-city" element={<SelectCityPage />} />
          <Route path="/theatres" element={<TheatresPage />} />
          <Route path="/book/:showId" element={<SeatSelectionPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/booking-success/:bookingReference" element={<ProtectedRoute><BookingSuccessPage /></ProtectedRoute>} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute adminOnly>
                <Suspense fallback={<Loader message="Opening control panel..." />}>
                  <AdminDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
