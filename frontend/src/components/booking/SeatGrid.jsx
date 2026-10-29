import React from 'react';
import { Sparkles } from 'lucide-react';
import { formatINR } from '../../utils/format';

const TIER_STYLE = {
  VIP: { ring: 'border-seat-vip/70', text: 'text-seat-vip', bar: 'bg-seat-vip', label: 'VIP recliners' },
  Premium: { ring: 'border-seat-premium/70', text: 'text-seat-premium', bar: 'bg-seat-premium', label: 'Premium' },
  Classic: { ring: 'border-seat-classic/70', text: 'text-seat-classic', bar: 'bg-seat-classic', label: 'Classic' }
};

export const SeatGrid = ({ layoutMatrix = [], selectedSeats = [], onToggleSeat, disabled = false }) => {
  const selectedIds = new Set(selectedSeats.map((s) => s.seatId));

  return (
    <div className="select-none">
      {/* Screen + projector beam */}
      <div className="relative mx-auto max-w-2xl mb-14" aria-hidden="true">
        <svg viewBox="0 0 600 70" className="w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="screenGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFD98A" stopOpacity="0.95" />
              <stop offset="1" stopColor="#FFB224" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M20 46 Q300 -8 580 46" fill="none" stroke="#FFD98A" strokeWidth="5" strokeLinecap="round" />
          <path d="M20 46 Q300 -8 580 46 L600 70 L0 70 Z" fill="url(#screenGlow)" opacity="0.28" />
        </svg>
        <div className="absolute inset-x-[8%] top-9 h-24 bg-gradient-to-b from-brand/25 to-transparent [clip-path:polygon(8%_0,92%_0,100%_100%,0_100%)] blur-[2px] animate-beam-flicker" />
        <p className="absolute inset-x-0 -bottom-1 text-center text-[10px] font-extrabold uppercase tracking-[0.45em] text-brand-soft/80">Screen this way</p>
      </div>

      <div className="overflow-x-auto pb-4 -mx-2 px-2">
        <div className="min-w-max mx-auto space-y-8">
          {layoutMatrix.map((tier) => {
            const style = TIER_STYLE[tier.tierName] || TIER_STYLE.Classic;
            return (
              <section key={tier.tierName} aria-label={`${style.label}, ${formatINR(tier.price)} per seat`} className="space-y-3">
                <div className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.16em]">
                  <span className={`h-px flex-1 ${style.bar} opacity-30`} />
                  <span className={`inline-flex items-center gap-1.5 ${style.text}`}>
                    {tier.tierName === 'VIP' && <Sparkles className="w-3.5 h-3.5" />}
                    {style.label} &middot; {formatINR(tier.price)}
                  </span>
                  <span className={`h-px flex-1 ${style.bar} opacity-30`} />
                </div>

                <div className="space-y-2">
                  {tier.rows.map((row) => (
                    <div key={row.row} className="flex items-center justify-center gap-2">
                      <span className="w-5 text-center font-mono text-xs font-semibold text-faint">{row.row}</span>
                      <div className="flex items-center gap-1.5">
                        {row.seats.map((seat) => {
                          const isSelected = selectedIds.has(seat.seatId);
                          const isBooked = seat.status === 'BOOKED';
                          const base =
                            'relative w-7 h-7 sm:w-8 sm:h-8 rounded-t-[10px] rounded-b-[5px] border-b-[3px] text-[10px] sm:text-[11px] font-bold font-mono flex items-center justify-center transition-all duration-150';
                          const state = isBooked
                            ? 'bg-white/[0.04] border-white/10 text-faint/60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-brand border-brand-deep text-on-brand shadow-glow-sm -translate-y-1 scale-110 z-10'
                            : `bg-canvas/70 ${style.ring} text-muted hover:bg-white/10 hover:text-ink hover:-translate-y-0.5 cursor-pointer`;

                          return (
                            <React.Fragment key={seat.seatId}>
                              <button
                                type="button"
                                disabled={isBooked || disabled}
                                aria-pressed={isSelected}
                                aria-label={`Seat ${seat.seatId}, ${seat.tier}, ${formatINR(seat.price)}, ${isBooked ? 'booked' : isSelected ? 'selected' : 'available'}`}
                                title={`${seat.seatId} - ${seat.tier} - ${formatINR(seat.price)}`}
                                onClick={() => onToggleSeat(seat)}
                                className={`${base} ${state}`}
                              >
                                {isBooked ? <span aria-hidden="true">&times;</span> : seat.number}
                              </button>
                              {seat.isAisleAfter && <span className="w-3 sm:w-5" aria-hidden="true" />}
                            </React.Fragment>
                          );
                        })}
                      </div>
                      <span className="w-5 text-center font-mono text-xs font-semibold text-faint">{row.row}</span>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-2xl border border-line bg-canvas/50 px-5 py-4 text-xs text-muted">
        {Object.entries(TIER_STYLE).map(([key, s]) => (
          <li key={key} className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-t-md rounded-b-[3px] border-b-[3px] bg-canvas/70 ${s.ring}`} /> {key}
          </li>
        ))}
        <li className="flex items-center gap-2 text-ink font-semibold">
          <span className="w-5 h-5 rounded-t-md rounded-b-[3px] border-b-[3px] bg-brand border-brand-deep" /> Your seats
        </li>
        <li className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-t-md rounded-b-[3px] border-b-[3px] bg-white/[0.04] border-white/10 text-faint/60 flex items-center justify-center text-xs leading-none">&times;</span> Taken
        </li>
      </ul>
    </div>
  );
};

export default SeatGrid;
