import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, Ticket, ArrowRight, Film } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import DigitalTicket from '../components/ticket/DigitalTicket';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';

export const BookingSuccessPage = () => {
  const { bookingReference } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    bookingService
      .getBookingByRef(bookingReference)
      .then((res) => !cancelled && setBooking(res.booking))
      .catch((err) => !cancelled && setError(err.message || 'Your ticket could not be loaded.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [bookingReference]);

  if (loading) return <Loader message="Printing your ticket..." fullScreen />;

  if (error || !booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24">
        <EmptyState icon={Film} title="Ticket not found" action={<Link to="/my-bookings" className="btn-primary mt-2">Open My tickets</Link>}>
          {error || 'We could not find that booking reference. Sign in with the account you booked with.'}
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fade-in">
      <div className="text-center space-y-3 no-print">
        <div className="w-16 h-16 rounded-full bg-emerald-400/15 border border-emerald-400/40 text-emerald-300 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(52,211,153,0.25)]">
          <Check className="w-8 h-8" strokeWidth={3} />
        </div>
        <h1 className="display text-6xl sm:text-7xl">You&rsquo;re in!</h1>
        <p className="text-sm text-muted max-w-md mx-auto">Your seats are locked. Show the QR code below at the entrance &mdash; it is also saved in My tickets.</p>
      </div>

      <DigitalTicket booking={booking} />

      <div className="flex flex-wrap items-center justify-center gap-3 no-print">
        <Link to="/my-bookings" className="btn-ghost"><Ticket className="w-4 h-4 text-brand" /> All my tickets</Link>
        <Link to="/movies" className="btn-primary">Find another film <ArrowRight className="w-4 h-4" /></Link>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
