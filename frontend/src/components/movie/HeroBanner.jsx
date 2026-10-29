import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, Ticket, Star, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import PosterImage from '../ui/PosterImage';
import TrailerModal from '../common/TrailerModal';
import { formatDuration } from '../../utils/format';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const HeroBanner = ({ movies = [] }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const count = movies.length;
  const current = movies[index] || movies[0] || null;

  const go = useCallback((i) => setIndex((i + count) % count), [count]);

  // auto-advance, but never while hovered, focused, playing a trailer, or when motion is reduced
  useEffect(() => {
    if (count <= 1 || paused || trailerOpen || prefersReducedMotion()) return undefined;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearTimeout(timer);
  }, [index, count, paused, trailerOpen]);

  if (!current) return null;

  const href = `/movie/${current.slug || current._id}`;

  return (
    <section
      className="relative isolate overflow-hidden grain"
      aria-roledescription="carousel"
      aria-label="Featured films"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* backdrop */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <PosterImage
          key={current._id}
          src={current.backdropUrl || current.posterUrl}
          alt=""
          className="w-full h-full object-cover object-top opacity-45 animate-fade-in scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/70 to-canvas/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/75 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(255,178,36,0.14),transparent_55%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[560px] lg:min-h-[640px] pt-16 pb-24 grid lg:grid-cols-12 gap-10 items-end">
        <div key={current._id} className="lg:col-span-7 space-y-5 animate-fade-up">
          <p className="eyebrow flex items-center gap-2">
            <span className="inline-block w-8 h-px bg-brand" /> Now showing
          </p>

          <h1 className="display text-[clamp(3.25rem,9vw,7.5rem)] text-ink text-glow">{current.title}</h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
            {current.rating > 0 && (
              <span className="inline-flex items-center gap-1 font-extrabold text-brand-soft">
                <Star className="w-4 h-4 fill-brand text-brand" /> {current.rating.toFixed(1)}
              </span>
            )}
            <span className="rounded border border-white/25 px-1.5 py-0.5 text-[11px] font-extrabold tracking-wider text-ink">{current.certificate || 'UA'}</span>
            {current.duration > 0 && (
              <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" />{formatDuration(current.duration)}</span>
            )}
            <span>{current.genre?.join(' · ')}</span>
          </div>

          <p className="max-w-xl text-[15px] leading-relaxed text-muted line-clamp-3">{current.synopsis}</p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to={href} className="btn-primary !px-7 !py-3.5">
              <Ticket className="w-4 h-4" /> Book tickets
            </Link>
            {current.trailerUrl && (
              <button type="button" onClick={() => setTrailerOpen(true)} className="btn-ghost !py-3.5 backdrop-blur">
                <Play className="w-4 h-4 fill-current" /> Watch trailer
              </button>
            )}
          </div>

          {current.formats?.length > 0 && (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-faint">
              In {current.formats.join(' · ')}
            </p>
          )}
        </div>

        {/* poster stack (desktop) */}
        <div className="hidden lg:flex lg:col-span-5 justify-end items-end gap-4">
          <Link to={href} tabIndex={-1} aria-hidden="true" className="relative w-60 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-white/15 shadow-lift rotate-[3deg] hover:rotate-0 transition-transform duration-500">
            <PosterImage key={current._id} src={current.posterUrl} alt="" fallbackLabel={current.title} className="w-full h-full object-cover animate-fade-in" />
          </Link>
        </div>
      </div>

      {/* controls */}
      {count > 1 && (
        <div className="absolute bottom-10 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2" role="tablist" aria-label="Choose featured film">
              {movies.map((m, i) => (
                <button
                  key={m._id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Show ${m.title}`}
                  onClick={() => go(i)}
                  className="relative h-1.5 w-10 rounded-full bg-white/20 overflow-hidden"
                >
                  {i === index && (
                    <span
                      key={`${index}-${paused}`}
                      className={`absolute inset-0 origin-left bg-brand ${paused || prefersReducedMotion() ? '' : 'animate-progress-bar'}`}
                      style={paused || prefersReducedMotion() ? { transform: 'scaleX(1)' } : undefined}
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => go(index - 1)} aria-label="Previous film" className="p-2.5 rounded-full bg-black/50 border border-white/15 hover:bg-brand hover:text-on-brand transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => go(index + 1)} aria-label="Next film" className="p-2.5 rounded-full bg-black/50 border border-white/15 hover:bg-brand hover:text-on-brand transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 inset-x-0 marquee-lights" aria-hidden="true" />

      <TrailerModal isOpen={trailerOpen} onClose={() => setTrailerOpen(false)} trailerUrl={current.trailerUrl} movieTitle={current.title} />
    </section>
  );
};

export default HeroBanner;
