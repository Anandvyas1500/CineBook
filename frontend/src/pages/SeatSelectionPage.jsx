import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, MapPin, Film, AlertTriangle } from 'lucide-react';
import { showService } from '../services/showService';
import { useBooking } from '../context/BookingContext';
import { useToast } from '../context/UiContext';
import SeatGrid from '../components/booking/SeatGrid';
import PriceSummary from '../components/booking/PriceSummary';
import EmptyState from '../components/common/EmptyState';
import { formatINR, formatDateShort } from '../utils/format';

const POLL_MS = 15000;

/** Re-apply a fresh list of occupied seats onto an already loaded seat map. */
const withOccupied = (show, occupiedSeats) => {
  const taken = new Set(occupiedSeats.map((s) => s.toUpperCase()));
  return {
    ...show,
    occupiedSeats,
    layoutMatrix: show.layoutMatrix.map((tier) => ({
      ...tier,
      rows: tier.rows.map((row) => ({
        ...row,
        seats: row.seats.map((seat) => ({ ...seat, status: taken.has(seat.seatId) ? 'BOOKED' : 'AVAILABLE' }))
      }))
    }))
  };
};

export const SeatSelectionPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { selectShow, selectedSeats, toggleSeat, pricingSummary, calculatingPrice } = useBooking();

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const selectedRef = useRef(selectedSeats);
  selectedRef.current = selectedSeats;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    showService
      .getShowById(showId)
      .then((res) => {
        if (cancelled || !res.show) return;
        setShow(res.show);
        selectShow(res.show);
      })
      .catch((err) => !cancelled && setError(err.message || 'This screening could not be loaded.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [showId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Live availability: other people may grab seats while you are choosing.
  useEffect(() => {
    if (!show || show.hasStarted) return undefined;
    const timer = setInterval(async () => {
      if (document.hidden) return;
      try {
        const res = await showService.getSeatAvailability(showId);
        const occupied = res.occupiedSeats || [];
        setShow((prev) => (prev ? withOccupied(prev, occupied) : prev));

        const taken = new Set(occupied.map((s) => s.toUpperCase()));
        const lost = selectedRef.current.filter((s) => taken.has(s.seatId.toUpperCase()));
        if (lost.length > 0) {
          lost.forEach((seat) => toggleSeat(seat)); // un-select them
          toast.error(`Seat ${lost.map((s) => s.seatId).join(', ')} was just booked by someone else.`);
        }
      } catch {
        /* a failed poll is not worth interrupting the user for */
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [show?._id, show?.hasStarted, showId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = (seat) => {
    if (toggleSeat(seat) === 'max') toast.info('You can book up to 10 seats at a time.');
  };

  const proceed = () => {
    if (selectedSeats.length > 0) navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6" aria-busy="true">
        <div className="skeleton h-24" />
        <div className="grid lg:grid-cols-3 gap-8"><div className="skeleton h-[560px] lg:col-span-2" /><div className="skeleton h-[420px]" /></div>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24">
        <EmptyState icon={Film} title="Screening not found" action={<Link to="/movies" className="btn-primary mt-2">Browse movies</Link>}>
          {error || 'This screening is invalid or no longer available.'}
        </EmptyState>
      </div>
    );
  }

  const { movie, theatre } = show;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-36 lg:pb-12 animate-fade-in">
      {/* Header */}
      <header className="card p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0">
          <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted hover:text-ink transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="display text-4xl sm:text-5xl text-ink truncate max-w-full">{movie?.title}</h1>
              <span className="rounded-md bg-brand px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-on-brand">{show.format}</span>
            </div>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
              <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-brand" />{theatre?.name}</span>
              <span>{show.screen?.name}</span>
              <span className="inline-flex items-center gap-1 font-mono font-semibold text-ink"><Clock className="w-3.5 h-3.5 text-brand" />{formatDateShort(show.showDate)} &middot; {show.showTime}</span>
            </p>
          </div>
        </div>

        <dl className="flex gap-2 text-center shrink-0">
          {[['Classic', show.pricing?.classic, 'text-seat-classic'], ['Premium', show.pricing?.premium, 'text-seat-premium'], ['VIP', show.pricing?.vip, 'text-seat-vip']].map(([label, price, tone]) => (
            <div key={label} className="rounded-xl border border-line bg-canvas/60 px-3.5 py-2">
              <dt className={`text-[10px] font-extrabold uppercase tracking-wider ${tone}`}>{label}</dt>
              <dd className="font-mono text-sm font-bold text-ink">{formatINR(price)}</dd>
            </div>
          ))}
        </dl>
      </header>

      {show.hasStarted && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-velvet/40 bg-velvet/10 px-5 py-4 text-sm text-velvet-soft">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>This screening has already started, so seats can no longer be booked. <Link to={`/movie/${movie?.slug || movie?._id}`} className="font-bold underline">Choose another showtime</Link>.</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 card p-5 sm:p-8">
          <SeatGrid layoutMatrix={show.layoutMatrix} selectedSeats={selectedSeats} onToggleSeat={handleToggle} disabled={show.hasStarted} />
        </div>

        <div className="hidden lg:block sticky top-24">
          <PriceSummary show={show} selectedSeats={selectedSeats} pricingSummary={pricingSummary} calculatingPrice={calculatingPrice} onProceed={proceed} />
        </div>
      </div>

      {/* Mobile bottom bar */}
      {selectedSeats.length > 0 && !show.hasStarted && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-line bg-canvas/95 backdrop-blur-xl px-4 pt-3 pb-safe animate-fade-up">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted">{selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'} &middot; <span className="font-mono">{selectedSeats.map((s) => s.seatId).join(', ')}</span></p>
              <p className={`display text-3xl text-brand leading-none ${calculatingPrice ? 'opacity-50' : ''}`}>{pricingSummary ? formatINR(pricingSummary.totalAmount) : '--'}</p>
            </div>
            <button type="button" disabled={calculatingPrice || !pricingSummary} onClick={proceed} className="btn-primary">
              Pay <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelectionPage;
