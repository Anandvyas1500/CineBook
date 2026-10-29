import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, Clock, Calendar, Compass, Users, Film } from 'lucide-react';
import { movieService } from '../services/movieService';
import { showService } from '../services/showService';
import { useCity } from '../context/CityContext';
import DateSelector from '../components/booking/DateSelector';
import ShowtimeCard from '../components/booking/ShowtimeCard';
import TrailerModal from '../components/common/TrailerModal';
import PosterImage from '../components/ui/PosterImage';
import EmptyState from '../components/common/EmptyState';
import { toLocalDateStr, formatDuration } from '../utils/format';

export const MovieDetailPage = () => {
  const { idOrSlug } = useParams();
  const { selectedCity } = useCity();

  const [movie, setMovie] = useState(null);
  const [loadingMovie, setLoadingMovie] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState(toLocalDateStr());
  const [groupedShows, setGroupedShows] = useState([]);
  const [loadingShows, setLoadingShows] = useState(false);
  const [showsError, setShowsError] = useState('');
  const showsRequest = useRef(0);

  useEffect(() => {
    let cancelled = false;
    setLoadingMovie(true);
    setNotFound(false);
    movieService
      .getMovieById(idOrSlug)
      .then((res) => !cancelled && setMovie(res.movie))
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoadingMovie(false));
    return () => {
      cancelled = true;
    };
  }, [idOrSlug]);

  useEffect(() => {
    if (!movie?._id) return;
    const id = ++showsRequest.current;
    setLoadingShows(true);
    setShowsError('');
    showService
      .getShows({ movieId: movie._id, city: selectedCity, date: selectedDate })
      .then((res) => id === showsRequest.current && setGroupedShows(res.groupedShows || []))
      .catch((err) => {
        if (id === showsRequest.current) {
          setGroupedShows([]);
          setShowsError(err.message || 'Could not load showtimes.');
        }
      })
      .finally(() => id === showsRequest.current && setLoadingShows(false));
  }, [movie?._id, selectedCity, selectedDate]);

  if (loadingMovie) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-[260px_1fr] gap-10" aria-busy="true">
        <div className="skeleton aspect-[2/3]" />
        <div className="space-y-4"><div className="skeleton h-14 w-2/3" /><div className="skeleton h-5 w-1/2" /><div className="skeleton h-28 w-full" /></div>
      </div>
    );
  }

  if (notFound || !movie) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24">
        <EmptyState icon={Film} title="Movie not found" action={<Link to="/movies" className="btn-primary mt-2">Browse movies</Link>}>
          This film may have left the cinemas, or the link is wrong.
        </EmptyState>
      </div>
    );
  }

  const allPast = groupedShows.length > 0 && groupedShows.every((g) => g.shows.every((s) => s.isPast));

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-line grain">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <PosterImage src={movie.backdropUrl || movie.posterUrl} alt="" className="w-full h-full object-cover object-top opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/80 to-canvas/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/60 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-14 flex flex-col md:flex-row gap-8 md:gap-12 md:items-end">
          <div className="relative w-48 sm:w-60 md:w-64 aspect-[2/3] shrink-0 rounded-2xl overflow-hidden border-2 border-white/15 shadow-lift">
            <PosterImage src={movie.posterUrl} alt={`${movie.title} poster`} fallbackLabel={movie.title} className="w-full h-full object-cover" />
            {movie.trailerUrl && (
              <button type="button" onClick={() => setTrailerOpen(true)} aria-label="Watch trailer" className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/10 group transition-colors">
                <span className="w-14 h-14 rounded-full bg-brand text-on-brand flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </span>
              </button>
            )}
          </div>

          <div className="space-y-5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              <span className="rounded border border-white/25 px-1.5 py-0.5 text-[11px] font-extrabold tracking-wider text-ink">{movie.certificate || 'UA'}</span>
              {movie.rating > 0 && (
                <span className="inline-flex items-center gap-1 font-extrabold text-brand-soft">
                  <Star className="w-4 h-4 fill-brand text-brand" /> {movie.rating.toFixed(1)}<span className="font-semibold text-faint">/10</span>
                </span>
              )}
              {movie.duration > 0 && <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" />{formatDuration(movie.duration)}</span>}
              {movie.releaseDate && <span>{new Date(movie.releaseDate).getFullYear()}</span>}
            </div>

            <h1 className="display text-[clamp(3rem,8vw,6.5rem)] text-ink text-glow">{movie.title}</h1>

            <ul className="flex flex-wrap gap-2">
              {movie.genre?.map((g) => <li key={g} className="chip">{g}</li>)}
              {movie.formats?.map((f) => <li key={f} className="rounded-full bg-brand/15 border border-brand/30 px-3 py-1.5 text-xs font-bold text-brand">{f}</li>)}
            </ul>

            <p className="text-[15px] leading-relaxed text-muted max-w-2xl">{movie.synopsis}</p>

            <dl className="flex flex-wrap gap-x-10 gap-y-3 text-sm">
              {movie.director && movie.director !== 'Unknown' && (
                <div><dt className="label !mb-0.5">Director</dt><dd className="font-semibold text-ink">{movie.director}</dd></div>
              )}
              {movie.language?.length > 0 && (
                <div><dt className="label !mb-0.5">Languages</dt><dd className="font-semibold text-ink">{movie.language.join(', ')}</dd></div>
              )}
            </dl>
          </div>
        </div>
        <div className="marquee-lights" aria-hidden="true" />
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 pt-12">
        {/* Cast */}
        {movie.cast?.length > 0 && (
          <section aria-labelledby="cast-title">
            <h2 id="cast-title" className="display text-4xl mb-5 flex items-center gap-3"><Users className="w-6 h-6 text-brand" /> Top cast</h2>
            <ul className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {movie.cast.map((actor) => (
                <li key={actor.name} className="card shrink-0 flex items-center gap-3 p-2.5 pr-5">
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-surface border border-line shrink-0">
                    {actor.avatar ? (
                      <PosterImage src={actor.avatar} alt="" fallbackLabel="" className="w-full h-full object-cover" />
                    ) : null}
                    <span className="sr-only">{actor.name}</span>
                  </div>
                  <div className="text-sm min-w-0">
                    <p className="font-bold text-ink line-clamp-1">{actor.name}</p>
                    <p className="text-xs text-muted line-clamp-1">{actor.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Showtimes */}
        <section aria-labelledby="showtimes-title" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Book your seat</p>
              <h2 id="showtimes-title" className="display text-5xl mt-1">Showtimes in {selectedCity}</h2>
            </div>
            <Link to="/select-city" className="text-sm font-bold text-brand hover:underline">Change city</Link>
          </div>

          <DateSelector selectedDate={selectedDate} onSelectDate={setSelectedDate} />

          <div aria-live="polite" aria-busy={loadingShows}>
            {loadingShows ? (
              <div className="space-y-4" aria-hidden="true">{[0, 1].map((i) => <div key={i} className="skeleton h-40" />)}</div>
            ) : showsError ? (
              <EmptyState icon={Compass} title="Showtimes unavailable">{showsError}</EmptyState>
            ) : groupedShows.length === 0 ? (
              <EmptyState icon={Calendar} title={`No screenings in ${selectedCity}`}>
                There is nothing scheduled for this date. Try another day, or switch city.
              </EmptyState>
            ) : (
              <div className="space-y-4">
                {allPast && (
                  <p className="rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand-soft">
                    All of today&rsquo;s screenings have already started. Pick another date to book.
                  </p>
                )}
                {groupedShows.map((g) => <ShowtimeCard key={g.theatre._id} groupedTheatre={g} />)}
              </div>
            )}
          </div>
        </section>
      </div>

      <TrailerModal isOpen={trailerOpen} onClose={() => setTrailerOpen(false)} trailerUrl={movie.trailerUrl} movieTitle={movie.title} />
    </div>
  );
};

export default MovieDetailPage;
