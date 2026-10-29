import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Compass, AlertCircle } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { hasBookingStarted } from '../utils/format';
import { useConfirm, useToast } from '../context/UiContext';
import BookingCard from '../components/ticket/BookingCard';
import DigitalTicket from '../components/ticket/DigitalTicket';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/ui/Modal';
import Loader from '../components/common/Loader';

const TABS = [
  ['upcoming', 'Upcoming'],
  ['watched', 'Watched'],
  ['cancelled', 'Cancelled']
];

const statusOf = (b) => {
  if (b.bookingStatus === 'CANCELLED') return 'cancelled';
  return hasBookingStarted(b) ? 'watched' : 'upcoming';
};

export const MyBookingsPage = () => {
  const confirm = useConfirm();
  const toast = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('upcoming');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  // The route is wrapped in <ProtectedRoute>, so by the time this mounts the session is verified.
  useEffect(() => {
    let cancelled = false;
    bookingService
      .getMyBookings()
      .then((res) => !cancelled && setBookings(res.bookings || []))
      .catch((err) => !cancelled && setError(err.message || 'Your tickets could not be loaded.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(() => {
    const g = { upcoming: [], watched: [], cancelled: [] };
    bookings.forEach((b) => g[statusOf(b)].push(b));
    // soonest show first for upcoming, most recent first for the rest
    g.upcoming.sort((a, b) => new Date(a.showSnapshot?.startTime || 0) - new Date(b.showSnapshot?.startTime || 0));
    g.watched.sort((a, b) => new Date(b.showSnapshot?.startTime || 0) - new Date(a.showSnapshot?.startTime || 0));
    return g;
  }, [bookings]);

  // jump to the first tab that has something in it when the list first loads
  useEffect(() => {
    if (!loading && grouped.upcoming.length === 0) {
      const first = TABS.find(([key]) => grouped[key].length > 0);
      if (first) setTab(first[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const handleCancel = async (booking) => {
    const ok = await confirm({
      title: 'Cancel this booking?',
      message: `Your seats (${booking.seats?.map((s) => s.seatId).join(', ')}) will be released straight away. The ticket price is refunded; the convenience fee and GST are not.`,
      confirmLabel: 'Yes, cancel booking',
      cancelLabel: 'Keep my tickets',
      tone: 'danger'
    });
    if (!ok) return;

    setCancellingId(booking._id);
    try {
      const res = await bookingService.cancelBooking(booking._id);
      const updated = res.booking || { bookingStatus: 'CANCELLED', paymentStatus: 'REFUNDED' };
      setBookings((prev) => prev.map((b) => (b._id === booking._id ? { ...b, ...updated } : b)));
      toast.success('Booking cancelled. Your seats were released.');
    } catch (err) {
      toast.error(err.message || 'Cancellation failed. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <Loader message="Fetching your tickets..." />;

  const list = grouped[tab];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <PageHeader
        eyebrow="Your bookings"
        title="My tickets"
        actions={<Link to="/movies" className="btn-primary">Book another film</Link>}
      >
        Open a pass to show the QR code at the entrance, or cancel a booking before the show starts.
      </PageHeader>

      {error ? (
        <EmptyState icon={AlertCircle} title="Could not load your tickets">{error}</EmptyState>
      ) : bookings.length === 0 ? (
        <EmptyState icon={Compass} title="No tickets yet" action={<Link to="/movies" className="btn-primary mt-3">Explore now showing</Link>}>
          Your bookings will appear here as soon as you reserve your first seats.
        </EmptyState>
      ) : (
        <>
          <div role="tablist" aria-label="Ticket status" className="flex gap-2 mb-6 overflow-x-auto scrollbar-none">
            {TABS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`chip whitespace-nowrap ${tab === key ? 'chip-active' : ''}`}
              >
                {label}
                <span className={`font-mono text-[11px] ${tab === key ? 'text-on-brand/70' : 'text-faint'}`}>{grouped[key].length}</span>
              </button>
            ))}
          </div>

          {list.length === 0 ? (
            <EmptyState icon={Ticket} title={`No ${tab} tickets`}>
              {tab === 'upcoming' ? 'Nothing booked for an upcoming show.' : tab === 'watched' ? 'Shows you have attended will move here.' : 'You have not cancelled any bookings.'}
            </EmptyState>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {list.map((b) => (
                <BookingCard key={b._id} booking={b} status={tab} onView={setSelectedTicket} onCancel={handleCancel} cancelling={cancellingId === b._id} />
              ))}
            </div>
          )}
        </>
      )}

      <Modal isOpen={Boolean(selectedTicket)} onClose={() => setSelectedTicket(null)} title="Your pass" maxWidth="max-w-xl">
        {selectedTicket && <div className="p-4 sm:p-6"><DigitalTicket booking={selectedTicket} /></div>}
      </Modal>
    </div>
  );
};

export default MyBookingsPage;
