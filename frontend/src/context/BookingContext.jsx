import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { bookingService } from '../services/bookingService';

const BookingContext = createContext(null);

const STORAGE_KEY = 'cinebook_booking_draft';
const MAX_SEATS = 10;

const loadDraft = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null') || {};
  } catch {
    return {};
  }
};

export const BookingProvider = ({ children }) => {
  const draft = useRef(loadDraft()).current;
  const [selectedShow, setSelectedShow] = useState(draft.show || null);
  const [selectedSeats, setSelectedSeats] = useState(draft.seats || []);
  const [pricingSummary, setPricingSummary] = useState(draft.pricing || null);
  const [calculatingPrice, setCalculatingPrice] = useState(false);

  const seatsRef = useRef(selectedSeats); // always the latest seats, even between renders
  const requestId = useRef(0); // lets us ignore out-of-date price responses

  // Keep the selection across a page refresh (sessionStorage = this tab only)
  useEffect(() => {
    try {
      if (selectedShow && selectedSeats.length > 0) {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ show: selectedShow, seats: selectedSeats, pricing: pricingSummary })
        );
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* storage may be unavailable (private mode) - not critical */
    }
  }, [selectedShow, selectedSeats, pricingSummary]);

  const recalculate = useCallback(async (show, seats) => {
    const id = ++requestId.current;
    if (!show || seats.length === 0) {
      setPricingSummary(null);
      setCalculatingPrice(false);
      return;
    }
    setCalculatingPrice(true);
    try {
      const res = await bookingService.calculatePrice(show._id, seats.map((s) => s.seatId));
      if (id === requestId.current && res.pricing) setPricingSummary(res.pricing);
    } catch (err) {
      console.error('Failed to calculate price on server:', err.message);
    } finally {
      if (id === requestId.current) setCalculatingPrice(false);
    }
  }, []);

  /**
   * Called when the seat page loads a show. If the visitor comes back to the SAME show
   * (e.g. "back" from checkout) their seats are kept, minus any that were taken meanwhile.
   */
  const selectShow = useCallback(
    (show) => {
      const sameShow = selectedShow && selectedShow._id === show._id;
      const taken = new Set((show.occupiedSeats || []).map((s) => s.toUpperCase()));
      const kept = sameShow ? seatsRef.current.filter((s) => !taken.has(s.seatId.toUpperCase())) : [];
      seatsRef.current = kept;
      setSelectedShow(show);
      setSelectedSeats(kept);
      recalculate(show, kept);
    },
    [selectedShow, recalculate]
  );

  /** Returns 'max' when the 10-seat limit blocks the click, otherwise 'ok'. */
  const toggleSeat = useCallback(
    (seat) => {
      const current = seatsRef.current;
      const exists = current.some((s) => s.seatId === seat.seatId);
      if (!exists && current.length >= MAX_SEATS) return 'max';

      const next = exists ? current.filter((s) => s.seatId !== seat.seatId) : [...current, seat];
      seatsRef.current = next;
      setSelectedSeats(next);
      recalculate(selectedShow, next);
      return 'ok';
    },
    [selectedShow, recalculate]
  );

  const resetBooking = useCallback(() => {
    requestId.current += 1;
    seatsRef.current = [];
    setSelectedShow(null);
    setSelectedSeats([]);
    setPricingSummary(null);
    setCalculatingPrice(false);
  }, []);

  return (
    <BookingContext.Provider
      value={{
        selectedShow,
        selectShow,
        selectedSeats,
        pricingSummary,
        calculatingPrice,
        maxSeats: MAX_SEATS,
        toggleSeat,
        resetBooking
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within a BookingProvider');
  return context;
};
