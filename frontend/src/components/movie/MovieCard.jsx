import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, Clock } from 'lucide-react';
import PosterImage from '../ui/PosterImage';
import TrailerModal from '../common/TrailerModal';
import { formatDuration } from '../../utils/format';

export const MovieCard = ({ movie, index = 0 }) => {
  const [trailerOpen, setTrailerOpen] = useState(false);
  if (!movie) return null;

  const href = `/movie/${movie.slug || movie._id}`;

  return (
    <>
      <article
        className="group relative flex flex-col animate-fade-up"
        style={{ animationDelay: `${Math.min(index, 11) * 45}ms` }}
      >
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-raised border border-line shadow-lift transition-all duration-500 group-hover:-translate-y-1.5 group-hover:border-brand/60 group-hover:shadow-[0_22px_44px_-18px_rgba(255,178,36,0.35)]">
          <PosterImage
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            fallbackLabel={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

          {movie.rating > 0 && (
            <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-black/70 backdrop-blur px-2.5 py-1 text-xs font-extrabold text-brand-soft">
              <Star className="w-3.5 h-3.5 fill-brand text-brand" /> {movie.rating.toFixed(1)}
            </span>
          )}

          <span className="absolute top-3 right-3 rounded-md border border-white/25 bg-black/60 backdrop-blur px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider text-ink">
            {movie.certificate || 'UA'}
          </span>

          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
            {movie.formats?.slice(0, 2).map((fmt) => (
              <span key={fmt} className="rounded-md bg-brand px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-on-brand">
                {fmt}
              </span>
            ))}
          </div>

          {movie.trailerUrl && (
            <button
              type="button"
              onClick={() => setTrailerOpen(true)}
              aria-label={`Watch ${movie.title} trailer`}
              className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-brand text-on-brand flex items-center justify-center shadow-glow opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 focus-visible:opacity-100 focus-visible:scale-100 transition-all duration-300"
            >
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </button>
          )}
        </div>

        {/* Meta */}
        <div className="pt-3.5 px-1 space-y-1.5">
          <h3 className="font-extrabold text-[15px] leading-snug text-ink line-clamp-1 group-hover:text-brand transition-colors">
            {/* the ::after stretches the link over the whole card */}
            <Link to={href} className="after:absolute after:inset-0 after:z-[5] focus-visible:after:ring-2 focus-visible:after:ring-brand after:rounded-2xl" title={movie.title}>
              {movie.title}
            </Link>
          </h3>
          <p className="flex items-center gap-2 text-xs text-muted">
            {movie.duration > 0 && (
              <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDuration(movie.duration)}</span>
            )}
            {movie.duration > 0 && movie.genre?.length > 0 && <span aria-hidden="true">&middot;</span>}
            <span className="truncate">{movie.genre?.slice(0, 2).join(', ')}</span>
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-faint truncate">{movie.language?.join(' / ')}</p>
        </div>
      </article>

      <TrailerModal isOpen={trailerOpen} onClose={() => setTrailerOpen(false)} trailerUrl={movie.trailerUrl} movieTitle={movie.title} />
    </>
  );
};

export default MovieCard;
