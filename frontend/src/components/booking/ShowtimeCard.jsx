import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { formatINR } from '../../utils/format';

const STATUS = {
  AVAILABLE: { dot: 'bg-emerald-400', text: 'text-emerald-300', label: 'Available' },
  FAST_FILLING: { dot: 'bg-brand', text: 'text-brand', label: 'Filling fast' },
  ALMOST_FULL: { dot: 'bg-velvet', text: 'text-velvet-soft', label: 'Almost full' },
  SOLD_OUT: { dot: 'bg-faint', text: 'text-faint', label: 'Sold out' }
};

export const ShowtimeCard = ({ groupedTheatre }) => {
  const { theatre, shows } = groupedTheatre;
  if (!theatre || !shows || shows.length === 0) return null;

  return (
    <article className="card p-5 sm:p-6">
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-dashed border-white/15">
        <div>
          <h3 className="font-extrabold text-lg text-ink">{theatre.name}</h3>
          <p className="flex items-center gap-1.5 text-xs text-muted mt-1">
            <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
            {theatre.location || theatre.address}
          </p>
        </div>
        <ul className="flex flex-wrap gap-1.5">
          {theatre.amenities?.slice(0, 3).map((a) => (
            <li key={a} className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold text-muted">{a}</li>
          ))}
        </ul>
      </header>

      <ul className="mt-5 flex flex-wrap gap-3">
        {shows.map((show) => {
          const status = STATUS[show.availabilityStatus] || STATUS.AVAILABLE;
          const closed = show.isPast || show.availabilityStatus === 'SOLD_OUT';
          const body = (
            <>
              <span className={`font-mono text-[15px] font-semibold ${closed ? 'line-through' : 'text-ink group-hover:text-on-brand'}`}>{show.showTime}</span>
              <span className={`mt-0.5 text-[10px] font-bold uppercase tracking-wider ${closed ? 'text-faint' : 'text-muted group-hover:text-on-brand/80'}`}>
                {show.format} &middot; {show.screenName?.split(' - ')[0]}
              </span>
              <span className={`mt-1.5 flex items-center gap-1.5 text-[10px] font-bold ${closed ? 'text-faint' : `${status.text} group-hover:text-on-brand`}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot} group-hover:bg-on-brand`} />
                {show.isPast ? 'Started' : show.availabilityStatus === 'SOLD_OUT' ? 'Sold out' : `from ${formatINR(show.pricing?.classic)}`}
              </span>
            </>
          );

          return (
            <li key={show._id}>
              {closed ? (
                <span aria-disabled="true" className="flex flex-col items-center min-w-[112px] rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-faint cursor-not-allowed">
                  {body}
                </span>
              ) : (
                <Link
                  to={`/book/${show._id}`}
                  title={`${status.label} - pick seats`}
                  className="group flex flex-col items-center min-w-[112px] rounded-xl border border-white/15 bg-canvas/60 px-4 py-3 transition-all hover:bg-brand hover:border-brand hover:-translate-y-0.5 hover:shadow-glow-sm"
                >
                  {body}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
};

export default ShowtimeCard;
