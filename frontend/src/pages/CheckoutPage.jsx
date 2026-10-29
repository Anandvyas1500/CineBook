import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { QrCode, CreditCard, Building2, ShieldCheck, AlertCircle, ArrowLeft, Lock, Check } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import { showService } from '../services/showService';
import AuthModal from '../components/common/AuthModal';
import PosterImage from '../components/ui/PosterImage';
import EmptyState from '../components/common/EmptyState';
import { formatINR, formatDateShort } from '../utils/format';

const METHODS = [
  { id: 'DEMO_UPI', icon: QrCode, title: 'UPI / QR', hint: 'GPay, PhonePe, Paytm' },
  { id: 'DEMO_CARD', icon: CreditCard, title: 'Card', hint: 'Simulated Visa / MC' },
  { id: 'DEMO_NETBANKING', icon: Building2, title: 'Net banking', hint: 'Sandbox bank' }
];

const Steps = () => (
  <ol className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em]" aria-label="Booking progress">
    {['Seats', 'Payment', 'Ticket'].map((label, i) => (
      <li key={label} className="flex items-center gap-3" aria-current={i === 1 ? 'step' : undefined}>
        <span className={`flex items-center gap-2 ${i < 1 ? 'text-emerald-300' : i === 1 ? 'text-brand' : 'text-faint'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${i < 1 ? 'bg-emerald-400/20' : i === 1 ? 'bg-brand text-on-brand' : 'bg-white/5'}`}>
            {i < 1 ? <Check className="w-3.5 h-3.5" /> : i + 1}
          </span>
          {label}
        </span>
        {i < 2 && <span className="w-6 sm:w-12 h-px bg-white/15" aria-hidden="true" />}
      </li>
    ))}
  </ol>
);

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { selectedShow, selectedSeats, pricingSummary, resetBooking } = useBooking();
  const { user, isAuthenticated } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState('DEMO_UPI');
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const payAfterSignIn = useRef(false);
  const payRef = useRef(null);

  const ready = selectedShow && selectedSeats.length > 0 && pricingSummary;

  const pay = async () => {
    if (!ready || processing) return;
    setErrorMessage('');
    setProcessing(true);

    try {
      const seatIds = selectedSeats.map((s) => s.seatId);

      // Pre-flight: refresh availability so we fail with a friendly message instead of mid-payment
      try {
        const live = await showService.getSeatAvailability(selectedShow._id);
        const occupied = new Set((live.occupiedSeats || []).map((s) => s.toUpperCase()));
        const conflicts = seatIds.filter((s) => occupied.has(s.toUpperCase()));
        if (conflicts.length > 0) {
          setErrorMessage(`Seat ${conflicts.join(', ')} was just booked by another customer. Please go back and choose different seats.`);
          return;
        }
      } catch {
        /* the server still guards against double-booking atomically */
      }

      const response = await bookingService.createBooking({
        showId: selectedShow._id,
        seats: seatIds,
        paymentMethod,
        paymentDetails: { testNote: 'Simulated payment via CineBook demo adapter' }
      });

      if (response.success && response.booking) {
        confetti({ particleCount: 110, spread: 75, origin: { y: 0.6 }, colors: ['#FFB224', '#FFD98A', '#F3E9D2', '#E63950'], disableForReducedMotion: true });
        const ref = response.booking.bookingReference;
        resetBooking();
        navigate(`/booking-success/${ref}`, { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Your booking could not be completed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };
  payRef.current = pay;

  const handlePayClick = () => {
    if (!isAuthenticated) {
      payAfterSignIn.current = true;
      setAuthOpen(true);
      return;
    }
    pay();
  };

  // After signing in from the modal, continue the payment automatically
  useEffect(() => {
    if (isAuthenticated && payAfterSignIn.current) {
      payAfterSignIn.current = false;
      payRef.current?.();
    }
  }, [isAuthenticated]);

  if (!ready) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24">
        <EmptyState icon={ShieldCheck} title="No active booking" action={<Link to="/movies" className="btn-primary mt-2">Browse movies</Link>}>
          Pick a movie, a showtime and your seats first, then come back to pay.
        </EmptyState>
      </div>
    );
  }

  const { movie, theatre } = selectedShow;

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
            <ArrowLeft className="w-4 h-4" /> Back to seats
          </button>
          <Steps />
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          <div className="space-y-6">
            <div>
              <h1 className="display text-5xl sm:text-6xl">Review &amp; pay</h1>
              <p className="text-sm text-muted mt-1.5">Choose how you would like to pay. This is a demo, so nothing is charged.</p>
            </div>

            {errorMessage && (
              <div role="alert" className="flex items-start gap-3 rounded-2xl border border-velvet/40 bg-velvet/10 p-4 text-sm text-velvet-soft">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">We could not complete your booking</p>
                  <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
                  <Link to={`/book/${selectedShow._id}`} className="inline-block mt-2 font-bold underline">Back to seat map</Link>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-dashed border-brand/40 bg-brand/5 p-4 text-sm text-muted leading-relaxed">
              <p className="eyebrow mb-1">Demo payment gateway</p>
              No real money moves and no card details are collected. Never type a real card number, CVV or UPI PIN anywhere on this site.
            </div>

            <fieldset className="card p-6 space-y-5">
              <legend className="sr-only">Payment method</legend>
              <h2 className="label !mb-0">Payment method</h2>
              <div className="grid sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Payment method">
                {METHODS.map(({ id, icon: Icon, title, hint }) => {
                  const active = paymentMethod === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setPaymentMethod(id)}
                      className={`relative rounded-xl border p-4 text-left transition-all ${active ? 'border-brand bg-brand/10 shadow-glow-sm' : 'border-line bg-canvas/50 hover:border-white/25'}`}
                    >
                      {active && <Check className="absolute top-3 right-3 w-4 h-4 text-brand" />}
                      <Icon className={`w-6 h-6 mb-3 ${active ? 'text-brand' : 'text-muted'}`} />
                      <p className="font-bold text-ink text-sm">{title}</p>
                      <p className="text-[11px] text-muted mt-0.5">{hint}</p>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl bg-canvas/70 border border-line p-4 text-xs space-y-2 font-mono">
                {paymentMethod === 'DEMO_UPI' && <div className="flex justify-between gap-4"><span className="text-muted">Simulated VPA</span><span className="text-ink truncate">{(user?.email || 'guest').split('@')[0]}@cinebook.upi</span></div>}
                {paymentMethod === 'DEMO_CARD' && <div className="flex justify-between gap-4"><span className="text-muted">Test card</span><span className="text-ink">&bull;&bull;&bull;&bull; 4242 (TEST)</span></div>}
                {paymentMethod === 'DEMO_NETBANKING' && <div className="flex justify-between gap-4"><span className="text-muted">Gateway</span><span className="text-ink">Sandbox Bank</span></div>}
                <div className="flex justify-between gap-4"><span className="text-muted">Verification</span><span className="text-emerald-300 inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Server-side</span></div>
              </div>
            </fieldset>

            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-line bg-raised p-4 text-sm">
                <span className="text-muted">Sign in to attach this ticket to your account. We will continue your payment right after.</span>
                <button type="button" onClick={() => { payAfterSignIn.current = false; setAuthOpen(true); }} className="btn-ghost btn-sm shrink-0">Sign in</button>
              </div>
            )}
          </div>

          {/* Receipt */}
          <aside className="card overflow-hidden lg:sticky lg:top-24" aria-label="Order summary">
            <div className="p-5 flex gap-4 border-b border-dashed border-white/15">
              <PosterImage src={movie?.posterUrl} alt={movie?.title} fallbackLabel={movie?.title} className="w-16 h-24 object-cover rounded-xl border border-line shrink-0" />
              <div className="min-w-0 space-y-1">
                <h3 className="font-extrabold text-ink leading-snug line-clamp-2">{movie?.title}</h3>
                <p className="text-xs text-muted">{selectedShow.format} &middot; {selectedShow.language}</p>
                <p className="text-xs text-muted truncate">{theatre?.name}</p>
                <p className="font-mono text-xs font-semibold text-brand">{formatDateShort(selectedShow.showDate)} &middot; {selectedShow.showTime}</p>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <ul className="flex flex-wrap gap-1.5">
                {selectedSeats.map((s) => (
                  <li key={s.seatId} className="rounded-lg border border-brand/40 bg-brand/10 px-2.5 py-1 font-mono text-xs font-bold text-brand">{s.seatId}</li>
                ))}
              </ul>
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between text-muted"><dt>Tickets ({selectedSeats.length})</dt><dd className="text-ink">{formatINR(pricingSummary.baseAmount)}</dd></div>
                <div className="flex justify-between text-muted"><dt>Convenience fee</dt><dd>{formatINR(pricingSummary.convenienceFee)}</dd></div>
                <div className="flex justify-between text-muted"><dt>GST (18% on fee)</dt><dd>{formatINR(pricingSummary.taxAmount)}</dd></div>
                <div className="flex justify-between items-baseline pt-3 border-t border-line"><dt className="font-bold">Amount payable</dt><dd className="display text-4xl text-brand">{formatINR(pricingSummary.totalAmount)}</dd></div>
              </dl>
              <button type="button" disabled={processing} onClick={handlePayClick} className="btn-primary w-full !py-4">
                {processing ? (
                  <><span className="w-5 h-5 rounded-full border-2 border-on-brand border-t-transparent animate-spin" /> Confirming your seats...</>
                ) : (
                  <><Lock className="w-4 h-4" /> Pay {formatINR(pricingSummary.totalAmount)}</>
                )}
              </button>
              <p className="text-center text-[11px] text-faint">Cancel any time before the show: the ticket price is refunded.</p>
            </div>
          </aside>
        </div>
      </div>

      <AuthModal isOpen={authOpen} onClose={() => { setAuthOpen(false); payAfterSignIn.current = false; }} />
    </>
  );
};

export default CheckoutPage;
