import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Clapperboard, X } from 'lucide-react';
import { movieService } from '../services/movieService';
import MovieCard from '../components/movie/MovieCard';
import MovieFilter from '../components/movie/MovieFilter';
import MovieGridSkeleton from '../components/movie/MovieGridSkeleton';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';

const unique = (lists) => [...new Set(lists.flat())].filter(Boolean).sort((a, b) => a.localeCompare(b));

export const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // The URL is the single source of truth for the search text, so the navbar search
  // keeps working even when you are already on this page.
  const urlQuery = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(urlQuery);
  const [movies, setMovies] = useState([]);
  const [facets, setFacets] = useState({ genres: [], languages: [], formats: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [genre, setGenre] = useState('All');
  const [language, setLanguage] = useState('All');
  const [format, setFormat] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const requestId = useRef(0);

  // keep the input in sync when the URL changes (navbar search, back button, reset)
  useEffect(() => setSearchInput(urlQuery), [urlQuery]);

  // debounce typing -> URL
  useEffect(() => {
    if (searchInput.trim() === urlQuery) return undefined;
    const t = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (searchInput.trim()) next.set('q', searchInput.trim());
      else next.delete('q');
      setSearchParams(next, { replace: true });
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  // filter options come from the real catalogue
  useEffect(() => {
    movieService
      .getMovies()
      .then((res) => {
        const all = res.movies || [];
        setFacets({
          genres: unique(all.map((m) => m.genre || [])),
          languages: unique(all.map((m) => m.language || [])),
          formats: unique(all.map((m) => m.formats || []))
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    setError('');
    movieService
      .getMovies({ q: urlQuery, genre, language, format, sort: sortBy })
      .then((res) => {
        if (id === requestId.current) setMovies(res.movies || []);
      })
      .catch((err) => {
        if (id === requestId.current) setError(err.message || 'Could not load movies.');
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  }, [urlQuery, genre, language, format, sortBy]);

  const resetAll = () => {
    setGenre('All');
    setLanguage('All');
    setFormat('All');
    setSortBy('rating');
    setSearchInput('');
    setSearchParams({}, { replace: true });
  };

  const filtersActive = useMemo(
    () => genre !== 'All' || language !== 'All' || format !== 'All' || urlQuery !== '',
    [genre, language, format, urlQuery]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <PageHeader eyebrow="The catalogue" title="Discover movies" actions={
        <>
          <form onSubmit={(e) => e.preventDefault()} role="search" className="relative w-full sm:w-72">
            <label htmlFor="movie-search" className="sr-only">Search movies</label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-faint pointer-events-none" />
            <input
              id="movie-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search title, genre, director"
              className="input !rounded-full pl-11 !py-2.5"
            />
          </form>
          <label className="sr-only" htmlFor="movie-sort">Sort movies</label>
          <select id="movie-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input !w-auto !rounded-full !py-2.5 pr-8 cursor-pointer">
            <option value="rating">Top rated</option>
            <option value="newest">Newest first</option>
            <option value="title">Title A-Z</option>
          </select>
        </>
      }>
        Every film currently on the schedule. Open one to see showtimes in your city.
      </PageHeader>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
        <MovieFilter
          facets={facets}
          selectedGenre={genre} onGenreChange={setGenre}
          selectedLanguage={language} onLanguageChange={setLanguage}
          selectedFormat={format} onFormatChange={setFormat}
          onReset={resetAll}
        />

        <section aria-live="polite" aria-busy={loading}>
          {urlQuery && (
            <p className="mb-5 flex flex-wrap items-center gap-2 text-sm text-muted">
              Results for <span className="font-bold text-ink">&ldquo;{urlQuery}&rdquo;</span>
              <button type="button" onClick={() => { setSearchInput(''); setSearchParams({}, { replace: true }); }} className="inline-flex items-center gap-1 chip !py-1">
                <X className="w-3 h-3" /> Clear
              </button>
            </p>
          )}

          {loading ? (
            <MovieGridSkeleton count={6} />
          ) : error ? (
            <EmptyState icon={Clapperboard} title="Could not load movies">{error}</EmptyState>
          ) : movies.length === 0 ? (
            <EmptyState
              icon={Clapperboard}
              title="No movies match"
              action={filtersActive ? <button type="button" onClick={resetAll} className="btn-primary mt-2">Clear filters</button> : null}
            >
              Try a different spelling, or loosen the filters.
            </EmptyState>
          ) : (
            <>
              <p className="mb-5 text-xs font-bold uppercase tracking-widest text-faint">{movies.length} {movies.length === 1 ? 'title' : 'titles'}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10">
                {movies.map((movie, i) => (
                  <MovieCard key={movie._id} movie={movie} index={i} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default MoviesPage;
