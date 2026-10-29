import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, CalendarPlus, MapPin } from 'lucide-react';
import PosterImage from '../ui/PosterImage';
import { formatDateShort, formatINR, downloadBookingICS, hasBookingStarted } from '../../utils/format';

const Field = ({ label, children, className = '' }) => (
  <div className={className}>
    <dt className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-paper-ink/55">{label}</dt>
    <dd className="mt-0.5 font-mono text-[13px] font-semibold text-paper-ink">{children}</dd>
  </div>
);

export const DigitalTicket = ({ booking }) => {
  if (!booking) return null;

  const movie = booking.movieSnapshot || {};
  const theatre = booking.theatreSnapshot || {};
  const show = booking.showSnapshot || {};
  const seats = booking.seats || [];
  const cancelled = booking.bookingStatus === 'CANCELLED';
  const started = hasBookingStarted(booking);

  return (
    <div className="w-full max-w-xl mx-auto space-y-5">
      <div id="printable-ticket" className="paper-ticket shadow-lift relative" style={{ '--notch-y': '63%' }}>
        {/* header strip */}
        <div className="bg-canvas text-ink px-6 py-4 flex items-center justify-between rounded-t-[18px]">
          <div>
            <p className="display text-2xl leading-none">Cine<span className="text-brand">Book</span></p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.3em] text-muted">Admit {seats.length} &middot; digital pass</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted">Booking ref</p>
            <p className="font-mono text-sm font-semibold text-brand">{booking.bookingReference}</p>
          </div>
        </div>
        <div className="marquee-lights" aria-hidden="true" />

        {/* body */}
        <div className="px-6 pt-6 pb-7 flex gap-5">
          <PosterImage src={movie.posterUrl} alt={movie.title} fallbackLabel={movie.title} className="w-24 h-36 shrink-0 rounded-lg object-cover border border-paper-ink/15 shadow" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="rounded bg-paper-ink px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-paper">{movie.format || '2D'}</span>
              <span className="rounded border border-paper-ink/30 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider text-paper-ink">{movie.certificate || 'UA'}</span>
            </div>
            <h3 className="display text-[34px] sm:text-[40px] text-paper-ink">{movie.title}</h3>
            <p className="mt-1.5 flex items-start gap-1 text-xs font-semibold text-paper-ink/70">
              <MapPin className="w-3.5 h-3.5 mt-px shrink-0" /> {theatre.name}, {theatre.city}
            </p>
            <p className="text-xs text-paper-ink/60 mt-0.5">{movie.language || 'English'}</p>
          </div>
        </div>

        <dl className="mx-6 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 rounded-xl bg-paper-dark/70 px-4 py-3.5">
          <Field label="Date">{formatDateShort(show.showDate)}</Field>
          <Field label="Time">{show.showTime}</Field>
          <Field label="Screen">{(theatre.screenName || 'Screen 1').split(' - ')[0]}</Field>
          <Field label={`Seats (${seats.length})`} className="col-span-2 sm:col-span-1">
            <span className="break-words">{seats.map((s) => s.seatId).join(', ')}</span>
          </Field>
        </dl>

        <div className="mx-6 perforation" />

        {/* stub */}
        <div className="px-6 pt-6 pb-6 flex items-center justify-between gap-5">
          <div className="space-y-2 min-w-0">
            <p className={`text-xs font-extrabold uppercase tracking-[0.18em] ${cancelled ? 'text-velvet' : started ? 'text-paper-ink/60' : 'text-emerald-700'}`}>
              {cancelled ? 'Cancelled' : started ? 'Screening started' : 'Confirmed - ready to scan'}
            </p>
            <p className="text-sm text-paper-ink/80">
              Paid <span className="font-mono font-bold text-paper-ink">{formatINR(booking.totalAmount)}</span>
            </p>
            {cancelled && booking.refundAmount > 0 && (
              <p className="text-xs text-paper-ink/70">Refunded {formatINR(booking.refundAmount)} (fee &amp; GST are non-refundable)</p>
            )}
            <div className="barcode w-40 max-w-full opacity-80" aria-hidden="true" />
          </div>
          <div className="shrink-0 rounded-xl bg-white p-2 shadow-md">
            <QRCodeSVG value={booking.qrCodeData || booking.bookingReference} size={92} level="M" />
          </div>
        </div>

        {cancelled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
            <span className="display -rotate-12 rounded-lg border-4 border-velvet px-5 py-1 text-6xl text-velvet/80">Cancelled</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 no-print">
        <button type="button" onClick={() => window.print()} className="btn-ghost btn-sm">
          <Printer className="w-4 h-4" /> Print
        </button>
        {!cancelled && !started && (
          <button type="button" onClick={() => downloadBookingICS(booking)} className="btn-ghost btn-sm">
            <CalendarPlus className="w-4 h-4" /> Add to calendar
          </button>
        )}
      </div>
    </div>
  );
};

export default DigitalTicket;
