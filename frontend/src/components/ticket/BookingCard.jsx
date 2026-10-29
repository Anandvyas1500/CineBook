import React from 'react';
import { Eye, Calendar, MapPin } from 'lucide-react';
import PosterImage from '../ui/PosterImage';
import { formatDateShort, formatINR } from '../../utils/format';

const STATUS_STYLE = {
  upcoming: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
  watched: 'bg-white/5 text-muted border-white/15',
  cancelled: 'bg-velvet/10 text-velvet-soft border-velvet/30'
};
const STATUS_LABEL = { upcoming: 'Upcoming', watched: 'Watched', cancelled: 'Cancelled' };

/** One row in "My tickets". `status` is 'upcoming' | 'watched' | 'cancelled'. */
export const BookingCard = ({ booking, status, onView, onCancel, cancelling }) => {
  const movie = booking.movieSnapshot || {};
  const theatre = booking.theatreSnapshot || {};
  const show = booking.showSnapshot || {};

  return (
    <article className={`card p-5 flex gap-5 transition-colors ${status === 'upcoming' ? 'hover:border-brand/40' : 'opacity-90'}`}>
      <PosterImage src={movie.posterUrl} alt={movie.title} fallbackLabel={movie.title} className={`w-20 sm:w-24 aspect-[2/3] object-cover rounded-xl border border-line shrink-0 ${status !== 'upcoming' ? 'grayscale-[40%]' : ''}`} />

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-extrabold text-lg text-ink leading-snug line-clamp-1">{movie.title}</h3>
            <p className="text-xs text-muted mt-0.5">{movie.format || '2D'} &middot; {movie.language || 'English'}</p>
          </div>
          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${STATUS_STYLE[status]}`}>
            {STATUS_LABEL[status]}
          </span>
        </div>

        <ul className="mt-3 space-y-1 text-xs text-muted">
          <li className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-brand shrink-0" /><span className="font-mono font-semibold text-ink">{formatDateShort(show.showDate)} &middot; {show.showTime}</span></li>
          <li className="flex items-center gap-1.5 min-w-0"><MapPin className="w-3.5 h-3.5 text-brand shrink-0" /><span className="truncate">{theatre.name}, {theatre.city}</span></li>
        </ul>

        <div className="mt-3 flex items-end justify-between gap-3 text-xs">
          <div>
            <p className="label !mb-0.5">Seats</p>
            <p className="font-mono font-bold text-ink">{booking.seats?.map((s) => s.seatId).join(', ')}</p>
          </div>
          <div className="text-right">
            <p className="label !mb-0.5">{status === 'cancelled' ? 'Refunded' : 'Paid'}</p>
            <p className="display text-2xl leading-none text-brand">{formatINR(status === 'cancelled' ? booking.refundAmount || 0 : booking.totalAmount)}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-dashed border-white/15">
          <button type="button" onClick={() => onView(booking)} className="btn-ghost btn-sm flex-1 sm:flex-none">
            <Eye className="w-4 h-4 text-brand" /> View pass
          </button>
          {status === 'upcoming' && (
            <button type="button" disabled={cancelling} onClick={() => onCancel(booking)} className="btn-danger btn-sm">
              {cancelling ? 'Cancelling...' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default BookingCard;
