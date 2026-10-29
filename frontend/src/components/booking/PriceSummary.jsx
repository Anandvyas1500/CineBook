import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import PosterImage from '../ui/PosterImage';
import { formatINR, formatDateShort } from '../../utils/format';

export const PriceSummary = ({ show, selectedSeats = [], pricingSummary, calculatingPrice = false, onProceed }) => {
  if (!show) return null;
  const { movie, theatre } = show;
  const empty = selectedSeats.length === 0;

  return (
    <div className="card overflow-hidden">
      <div className="p-5 flex gap-4 border-b border-dashed border-white/15">
        <PosterImage src={movie?.posterUrl} alt={movie?.title} fallbackLabel={movie?.title} className="w-16 h-24 object-cover rounded-xl border border-line shrink-0" />
        <div className="min-w-0 space-y-1">
          <h3 className="font-extrabold text-ink leading-snug line-clamp-2">{movie?.title}</h3>
          <p className="text-xs text-muted">{show.format} &middot; {show.language}</p>
          <p className="text-xs text-muted truncate">{theatre?.name}</p>
          <p className="font-mono text-xs font-semibold text-brand">{formatDateShort(show.showDate)} &middot; {show.showTime}</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {empty ? (
          <p className="text-sm text-muted text-center py-6">Tap seats on the map to start your booking.</p>
        ) : (
          <>
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="label !mb-0">Seats ({selectedSeats.length})</span>
                <span className="text-[11px] font-semibold text-faint">Max 10</span>
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {selectedSeats.map((seat) => (
                  <li key={seat.seatId} className="rounded-lg border border-brand/40 bg-brand/10 px-2.5 py-1 font-mono text-xs font-bold text-brand">
                    {seat.seatId}
                  </li>
                ))}
              </ul>
            </div>

            <dl className="space-y-2.5 text-sm" aria-live="polite">
              <div className="flex justify-between text-muted">
                <dt>Tickets</dt>
                <dd className="text-ink">{pricingSummary ? formatINR(pricingSummary.baseAmount) : <span className="skeleton inline-block w-14 h-4" />}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>Convenience fee</dt>
                <dd>{pricingSummary ? formatINR(pricingSummary.convenienceFee) : '-'}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>GST (18% on fee)</dt>
                <dd>{pricingSummary ? formatINR(pricingSummary.taxAmount) : '-'}</dd>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-line">
                <dt className="font-bold text-ink">Total</dt>
                <dd className={`display text-4xl text-brand ${calculatingPrice ? 'opacity-50' : ''}`}>
                  {pricingSummary ? formatINR(pricingSummary.totalAmount) : '--'}
                </dd>
              </div>
            </dl>
          </>
        )}

        <button type="button" disabled={empty || calculatingPrice || !pricingSummary} onClick={onProceed} className="btn-primary w-full !py-3.5">
          Continue to payment <ArrowRight className="w-4 h-4" />
        </button>

        <p className="flex items-center justify-center gap-1.5 text-[11px] text-faint">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Final price is confirmed by our server
        </p>
      </div>
    </div>
  );
};

export default PriceSummary;
