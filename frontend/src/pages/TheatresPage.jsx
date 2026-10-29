import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Search, Clock, Sparkles } from 'lucide-react';
import { theatreService } from '../services/theatreService';
import { showService } from '../services/showService';
import { useCity } from '../context/CityContext';
import { toLocalDateStr, formatINR } from '../utils/format';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';

export const TheatresPage = () => {
  const { selectedCity } = useCity();
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    Promise.all([
      theatreService.getTheatres(selectedCity),
      showService.getShows({ city: selectedCity, date: toLocalDateStr() })
    ])
      .then(([theatresRes, showsRes]) => {
        if (cancelled) return;
        setTheatres(theatresRes.theatres || []);
        setShows(showsRes.shows || []);
      })
      .catch((err) => !cancelled && setError(err.message || 'Cinemas could not be loaded.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [selectedCity]);

  const showsByTheatre = useMemo(() => {
    const map = new Map();
    shows.forEach((s) => {
      const id = s.theatre?._id || s.theatreId;
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(s);
    });
    return map;
  }, [shows]);

  const q = search.trim().toLowerCase();
  const visible = theatres.filter(
    (t) => !q || [t.name, t.address, t.city].some((v) => v?.toLowerCase().includes(q))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <PageHeader
        eyebrow={`Cinemas in ${selectedCity}`}
        title="Today at the cinema"
        actions={
          <div className="relative w-full sm:w-72">
            <label htmlFor="theatre-search" className="sr-only">Search cinemas</label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-faint pointer-events-none" />
            <input id="theatre-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cinema or area" className="input pl-11" />
          </div>
        }
      >
        Every screening still to start today, grouped by cinema. Pick a showtime to choose your seats.
      </PageHeader>

      {loading ? (
        <Loader message="Loading cinemas and showtimes..." />
      ) : error ? (
        <EmptyState icon={Building2} title="Could not load cinemas">{error}</EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState icon={Building2} title={`No cinemas found in ${selectedCity}`}>
          Try another city or clear the search box.
          <Link to="/select-city" className="btn-primary mt-4 inline-flex">Change city</Link>
        </EmptyState>
      ) : (
        <div className="space-y-6">
          {visible.map((theatre) => {
            const theatreShows = showsByTheatre.get(theatre._id) || [];
            return (
              <section key={theatre._id} className="card p-6 sm:p-7 space-y-5" aria-labelledby={`t-${theatre._id}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-dashed border-white/15">
                  <div className="space-y-1.5 min-w-0">
                    <h2 id={`t-${theatre._id}`} className="display text-3xl text-ink">{theatre.name}</h2>
                    <p className="flex items-start gap-1.5 text-sm text-muted">
                      <MapPin className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                      <span>{[theatre.address, theatre.city].filter(Boolean).join(', ')}</span>
                    </p>
                  </div>
                  {theatre.amenities?.length > 0 && (
                    <ul className="flex flex-wrap gap-1.5 sm:justify-end">
                      {theatre.amenities.map((a) => (
                        <li key={a} className="chip !py-1 !text-[11px] pointer-events-none">{a}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {theatreShows.length === 0 ? (
                  <p className="flex items-center gap-2 text-sm text-faint">
                    <Sparkles className="w-4 h-4" /> No more screenings today at this cinema.
                  </p>
                ) : (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {theatreShows.map((s) => (
                      <li key={s._id}>
                        <Link
                          to={`/book/${s._id}`}
                          className="group flex items-center justify-between gap-3 rounded-xl border border-line bg-canvas/60 p-3.5 transition-all hover:border-brand/60 hover:bg-raised-hover"
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-bold text-sm text-ink group-hover:text-brand transition-colors">{s.movie?.title || 'Screening'}</span>
                            <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted">
                              <Clock className="w-3 h-3" /> <span className="font-mono">{s.showTime}</span> &middot; {s.format} &middot; {s.language}
                            </span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className="block text-[10px] uppercase tracking-wider text-faint">From</span>
                            <span className="font-mono text-sm font-bold text-brand">{formatINR(s.pricing?.classic)}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TheatresPage;
