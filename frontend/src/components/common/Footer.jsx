import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Logo from './Logo';
import { useCity } from '../../context/CityContext';
import { useAuth } from '../../context/AuthContext';

export const Footer = () => {
  const { cities, changeCity } = useCity();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <footer className="mt-24 relative">
      <div className="marquee-lights opacity-70" aria-hidden="true" />
      <div className="bg-surface border-t border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-5 space-y-4">
              <Logo />
              <p className="text-sm text-muted leading-relaxed max-w-sm">
                Book movie tickets in a few taps. Pick your film, choose the exact seat, and carry a scannable pass on your phone.
              </p>
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" /> Demo payments only - no real money is ever charged
              </p>
            </div>

            <nav className="md:col-span-3" aria-label="Explore">
              <h2 className="eyebrow mb-4">Explore</h2>
              <ul className="space-y-2.5 text-sm text-muted">
                <li><Link className="hover:text-ink" to="/movies">All movies</Link></li>
                <li><Link className="hover:text-ink" to="/theatres">Cinemas near you</Link></li>
                <li><Link className="hover:text-ink" to="/my-bookings">My tickets</Link></li>
                <li><Link className="hover:text-ink" to="/profile">Profile</Link></li>
                {isAdmin && <li><Link className="hover:text-brand" to="/admin">Control panel</Link></li>}
              </ul>
            </nav>

            <nav className="md:col-span-4" aria-label="Cities">
              <h2 className="eyebrow mb-4">Cities</h2>
              <ul className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <li key={city}>
                    <button
                      type="button"
                      onClick={() => {
                        changeCity(city);
                        navigate('/theatres');
                      }}
                      className="chip"
                    >
                      {city}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-12 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-faint">
            <p>&copy; {new Date().getFullYear()} CineBook. A demo ticketing project.</p>
            <p>Seat prices, fees and GST are calculated on the server.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
