import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Search, User, Ticket, ShieldAlert, LogOut, ChevronDown, Menu, X, Building2, Film, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCity } from '../../context/CityContext';
import useOnClickOutside from '../../hooks/useOnClickOutside';
import Logo from './Logo';
import AuthModal from './AuthModal';

const navLink = ({ isActive }) =>
  `relative px-3.5 py-2 text-sm font-semibold rounded-full transition-colors ${
    isActive ? 'text-on-brand bg-brand' : 'text-muted hover:text-ink hover:bg-white/5'
  }`;

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout, loading } = useAuth();
  const { selectedCity, changeCity, cities } = useCity();
  const navigate = useNavigate();
  const location = useLocation();

  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [cityOpen, setCityOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const cityRef = useRef(null);
  const userRef = useRef(null);
  useOnClickOutside(cityRef, () => setCityOpen(false), cityOpen);
  useOnClickOutside(userRef, () => setUserOpen(false), userOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close menus on navigation
  useEffect(() => {
    setMobileOpen(false);
    setUserOpen(false);
    setCityOpen(false);
  }, [location.pathname, location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      navigate(`/movies?q=${encodeURIComponent(q)}`);
      setQuery('');
    }
  };

  const openAuth = (tab = 'login') => {
    setAuthTab(tab);
    setAuthOpen(true);
    setMobileOpen(false);
  };

  const renderSearch = (id, className = '') => (
    <form onSubmit={handleSearch} role="search" className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">Search movies</label>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-faint pointer-events-none" />
      <input
        id={id}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search films, genres, directors"
        className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-sm text-ink placeholder-faint focus:outline-none focus:border-brand focus:bg-white/[0.08] transition-colors"
      />
    </form>
  );

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-canvas/85 backdrop-blur-xl border-b border-line' : 'bg-canvas/40 backdrop-blur-md border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center gap-3 lg:gap-6">
          <Logo />

          {/* City picker */}
          <div className="relative hidden md:block" ref={cityRef}>
            <button
              type="button"
              onClick={() => setCityOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={cityOpen}
              className="flex items-center gap-2 py-2 pl-3 pr-2.5 rounded-full bg-white/5 border border-white/10 hover:border-brand/50 text-sm font-semibold text-ink transition-colors"
            >
              <MapPin className="w-4 h-4 text-brand" />
              <span>{selectedCity}</span>
              <ChevronDown className={`w-4 h-4 text-faint transition-transform ${cityOpen ? 'rotate-180' : ''}`} />
            </button>

            {cityOpen && (
              <div role="listbox" aria-label="Select city" className="absolute left-0 mt-2 w-60 card shadow-lift p-2 animate-fade-in max-h-80 overflow-y-auto">
                {cities.map((city) => (
                  <button
                    key={city}
                    role="option"
                    aria-selected={city === selectedCity}
                    type="button"
                    onClick={() => {
                      changeCity(city);
                      setCityOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${
                      city === selectedCity ? 'bg-brand/15 text-brand font-bold' : 'text-muted hover:bg-white/5 hover:text-ink'
                    }`}
                  >
                    {city}
                    {city === selectedCity && <Check className="w-4 h-4" />}
                  </button>
                ))}
                <Link to="/select-city" className="block text-center mt-1 pt-2 border-t border-line text-xs font-bold text-brand hover:underline">
                  Browse all cities
                </Link>
              </div>
            )}
          </div>

          <div className="hidden lg:block flex-1 max-w-sm ml-auto">
            {renderSearch('nav-search')}
          </div>

          <nav className="hidden md:flex items-center gap-1 ml-auto lg:ml-0" aria-label="Primary">
            <NavLink to="/movies" className={navLink}>Movies</NavLink>
            <NavLink to="/theatres" className={navLink}>Cinemas</NavLink>
            {isAuthenticated && <NavLink to="/my-bookings" className={navLink}>My tickets</NavLink>}
            {isAdmin && <NavLink to="/admin" className={navLink}>Admin</NavLink>}
          </nav>

          {/* Account */}
          <div className="flex items-center gap-2 ml-auto md:ml-0">
            {loading ? (
              <div className="skeleton w-24 h-10 rounded-full" aria-hidden="true" />
            ) : isAuthenticated ? (
              <div className="relative" ref={userRef}>
                <button
                  type="button"
                  onClick={() => setUserOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={userOpen}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-brand/50 transition-colors"
                >
                  <span className="w-8 h-8 rounded-full bg-brand text-on-brand font-extrabold text-sm flex items-center justify-center uppercase">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                  <span className="hidden sm:block text-sm font-semibold max-w-[110px] truncate">{user?.name}</span>
                  <ChevronDown className="w-4 h-4 text-faint hidden sm:block" />
                </button>

                {userOpen && (
                  <div role="menu" className="absolute right-0 mt-2 w-60 card shadow-lift p-2 animate-fade-in">
                    <div className="px-3 py-2.5 mb-1 border-b border-line">
                      <p className="text-sm font-bold truncate">{user?.name}</p>
                      <p className="text-xs text-muted truncate">{user?.email}</p>
                    </div>
                    <Link role="menuitem" to="/my-bookings" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted hover:text-ink hover:bg-white/5">
                      <Ticket className="w-4 h-4 text-brand" /> My tickets
                    </Link>
                    <Link role="menuitem" to="/profile" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted hover:text-ink hover:bg-white/5">
                      <User className="w-4 h-4 text-brand" /> Profile &amp; security
                    </Link>
                    {isAdmin && (
                      <Link role="menuitem" to="/admin" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted hover:text-ink hover:bg-white/5">
                        <ShieldAlert className="w-4 h-4 text-brand" /> Control panel
                      </Link>
                    )}
                    <button
                      role="menuitem"
                      type="button"
                      onClick={() => {
                        logout();
                        setUserOpen(false);
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-xl text-sm text-velvet-soft hover:bg-velvet/10 text-left border-t border-line"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button type="button" onClick={() => openAuth('login')} className="btn-primary btn-sm !rounded-full !px-5 !py-2.5">
                Sign in
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="md:hidden p-2.5 rounded-full bg-white/5 border border-white/10 text-ink"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile sheet */}
        {mobileOpen && (
          <div className="md:hidden border-t border-line bg-canvas/95 backdrop-blur-xl px-4 py-5 space-y-5 animate-fade-in">
            {renderSearch('nav-search-m')}

            <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted">
                <MapPin className="w-4 h-4 text-brand" /> City
              </span>
              <select
                value={selectedCity}
                onChange={(e) => changeCity(e.target.value)}
                aria-label="Select city"
                className="bg-canvas border border-white/10 rounded-lg text-sm py-1.5 px-3 text-ink font-semibold"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link to="/movies" className="btn-ghost justify-start"><Film className="w-4 h-4 text-brand" /> Movies</Link>
              <Link to="/theatres" className="btn-ghost justify-start"><Building2 className="w-4 h-4 text-brand" /> Cinemas</Link>
              {isAuthenticated && <Link to="/my-bookings" className="btn-ghost justify-start"><Ticket className="w-4 h-4 text-brand" /> My tickets</Link>}
              {isAuthenticated && <Link to="/profile" className="btn-ghost justify-start"><User className="w-4 h-4 text-brand" /> Profile</Link>}
              {isAdmin && <Link to="/admin" className="btn-ghost justify-start col-span-2"><ShieldAlert className="w-4 h-4 text-brand" /> Control panel</Link>}
            </div>
          </div>
        )}
      </header>

      <AuthModal isOpen={authOpen} initialTab={authTab} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default Navbar;
