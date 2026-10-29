import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Clapperboard, Armchair, QrCode, ArrowRight, MapPin, RefreshCw } from 'lucide-react';
import { movieService } from '../services/movieService';
import { useCity } from '../context/CityContext';
import HeroBanner from '../components/movie/HeroBanner';
import MovieCard from '../components/movie/MovieCard';
import MovieGridSkeleton from '../components/movie/MovieGridSkeleton';
import EmptyState from '../components/common/EmptyState';

const FORMAT_FILTERS = ['All', 'IMAX', '4DX', '3D', '2D'];

const STEPS = [
  { icon: Clapperboard, title: 'Pick a film', text: 'Browse what is playing in your city and choose a date and showtime.' },
  { icon: Armchair, title: 'Choose your seat', text: 'See the real auditorium, pick the exact seats you want, and watch the price add up.' },
  { icon: QrCode, title: 'Scan and walk in', text: 'Your pass lands in My tickets with a QR code. No printing, no queue at the counter.' }
];

const TECH = [
  ['IMAX with Laser', 'Floor-to-ceiling picture, huge sound'],
  ['4DX', 'Moving seats, wind, mist and scent'],
  ['Dolby Atmos', 'Sound that moves around the room'],
  ['VIP recliners', 'Lie back. Order a snack. Enjoy.']
];

export const HomePage = () => {
  const { selectedCity } = useCity();
  const [featured, setFeatured] = useState([]);
  const [nowShowing, setNowShowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [format, setFormat] = useState('All');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [featuredRes, cityRes] = await Promise.all([
        movieService.getFeaturedMovies(),
        movieService.getMovies({ city: selectedCity, sort: 'rating' })
      ]);
      setFeatured(featuredRes.movies || []);
      setNowShowing(cityRes.movies || []);
    } catch (err) {
      setError(err.message || 'Could not load movies.');
    } finally {
      setLoading(false);
    }
  }, [selectedCity]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered =
    format === 'All'
      ? nowShowing
      : nowShowing.filter((m) => m.formats?.some((f) => f.toLowerCase().includes(format.toLowerCase())));

  return (
    <div className="animate-fade-in">
      {loading && featured.length === 0 ? <div className="skeleton h-[560px] lg:h-[640px] rounded-none" aria-hidden="true" /> : <HeroBanner movies={featured} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Now showing */}
        <section className="pt-16" aria-labelledby="now-showing">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
            <div>
              <p className="eyebrow flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {selectedCity}</p>
              <h2 id="now-showing" className="display text-5xl sm:text-6xl mt-1">Playing near you</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-none py-1" role="group" aria-label="Filter by format">
              {FORMAT_FILTERS.map((f) => (
                <button key={f} type="button" aria-pressed={format === f} onClick={() => setFormat(f)} className={`chip ${format === f ? 'chip-active' : ''}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <MovieGridSkeleton />
          ) : error ? (
            <EmptyState icon={RefreshCw} title="Could not load movies" action={<button type="button" onClick={load} className="btn-primary mt-2">Try again</button>}>
              {error}
            </EmptyState>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Clapperboard}
              title={nowShowing.length === 0 ? `Nothing playing in ${selectedCity} yet` : 'No films in that format'}
              action={
                nowShowing.length === 0 ? (
                  <Link to="/select-city" className="btn-primary mt-2">Choose another city</Link>
                ) : (
                  <button type="button" onClick={() => setFormat('All')} className="btn-primary mt-2">Show all formats</button>
                )
              }
            >
              {nowShowing.length === 0 ? 'We could not find upcoming screenings in this city. Try a different one.' : `None of today's films are playing in ${format}.`}
            </EmptyState>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
              {filtered.map((movie, i) => (
                <MovieCard key={movie._id} movie={movie} index={i} />
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link to="/movies" className="btn-ghost">Browse the full catalogue <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </section>

        {/* How it works */}
        <section className="pt-24" aria-labelledby="how-it-works">
          <p className="eyebrow text-center">Three taps to the big screen</p>
          <h2 id="how-it-works" className="display text-5xl sm:text-6xl text-center mt-1 mb-10">How it works</h2>
          <ol className="grid md:grid-cols-3 gap-5">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="card p-7 relative overflow-hidden">
                <span className="display absolute -top-3 -right-1 text-[110px] leading-none text-white/[0.04] select-none" aria-hidden="true">{i + 1}</span>
                <div className="w-12 h-12 rounded-xl bg-brand/15 text-brand flex items-center justify-center mb-5"><Icon className="w-6 h-6" /></div>
                <h3 className="font-extrabold text-lg mb-1.5">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Premium formats */}
        <section className="pt-24" aria-labelledby="formats">
          <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-raised to-surface p-8 sm:p-12">
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand/10 blur-3xl pointer-events-none" aria-hidden="true" />
            <div className="relative grid lg:grid-cols-5 gap-10 items-center">
              <div className="lg:col-span-2 space-y-4">
                <p className="eyebrow">Premium formats</p>
                <h2 id="formats" className="display text-5xl sm:text-6xl">Pick the way you watch</h2>
                <p className="text-sm text-muted leading-relaxed">Look for the format badge on every poster, then filter by it on the Movies page.</p>
                <Link to="/movies" className="btn-primary mt-2">Explore films <ArrowRight className="w-4 h-4" /></Link>
              </div>
              <ul className="lg:col-span-3 grid sm:grid-cols-2 gap-3">
                {TECH.map(([name, text]) => (
                  <li key={name} className="rounded-2xl border border-line bg-canvas/50 p-5">
                    <p className="display text-3xl text-brand">{name}</p>
                    <p className="text-xs text-muted mt-1">{text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
