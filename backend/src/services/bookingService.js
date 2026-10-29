const crypto = require('crypto');
const mongoose = require('mongoose');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const config = require('../config/config');
const { calculatePricing } = require('./pricingService');
const { getPaymentAdapter, containsSensitiveKeys } = require('./paymentAdapter');
const { AppError } = require('../middleware/errorMiddleware');

const ALLOWED_PAYMENT_METHODS = ['DEMO_UPI', 'DEMO_CARD', 'DEMO_NETBANKING', 'DEMO_WALLET'];

// No 0/O/1/I so references are easy to read out at the counter
const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const randomChars = (n) =>
  Array.from({ length: n }, () => REF_ALPHABET[crypto.randomInt(REF_ALPHABET.length)]).join('');

/** Human-friendly, cryptographically random reference, e.g. CNB-8F4K-9281 */
const generateBookingReference = () => `CNB-${randomChars(4)}-${crypto.randomInt(1000, 10000)}`;

const releaseSeats = async (showId, seats) => {
  try {
    await Show.updateOne({ _id: showId }, { $pull: { occupiedSeats: { $in: seats } } });
  } catch (err) {
    console.error('[Booking] CRITICAL: failed to release seats', showId.toString(), seats, err.message);
  }
};

/**
 * Creates the Booking, retrying with a fresh reference in the (very unlikely)
 * event of a reference collision.
 */
const createBookingWithUniqueReference = async (buildData) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const reference = generateBookingReference();
    try {
      return await Booking.create(buildData(reference));
    } catch (err) {
      const isRefCollision = err.code === 11000 && err.keyPattern && err.keyPattern.bookingReference;
      if (!isRefCollision) throw err;
    }
  }
  throw new Error('Could not allocate a unique booking reference.');
};

/**
 * Full ticket booking flow with atomic seat reservation and double-booking protection.
 *
 *  1. validate input   2. server-side pricing   3. atomic seat lock
 *  4. (demo) payment   5. persist payment + booking
 *
 * If ANYTHING fails after the seats were locked, the seats are released again
 * (and a captured payment is refunded) so seats can never get stuck.
 */
const processBooking = async ({
  userId,
  showId,
  seats,
  paymentMethod = 'DEMO_UPI',
  paymentDetails = {}
}) => {
  if (!showId || !mongoose.isValidObjectId(showId)) {
    throw new AppError('A valid show ID is required.', 400);
  }

  if (!Array.isArray(seats) || seats.length === 0) {
    throw new AppError('At least one seat must be selected.', 400);
  }

  const maxSeats = config.booking.maxSeatsPerBooking;
  if (seats.length > maxSeats) {
    throw new AppError(`Maximum ${maxSeats} seats can be booked in a single transaction.`, 400);
  }

  if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
    throw new AppError(`Unsupported payment method. Use one of: ${ALLOWED_PAYMENT_METHODS.join(', ')}.`, 400);
  }

  if (paymentDetails === null || typeof paymentDetails !== 'object' || Array.isArray(paymentDetails)) {
    throw new AppError('Invalid payment details.', 400);
  }
  if (containsSensitiveKeys(paymentDetails)) {
    throw new AppError(
      'Security violation: sensitive financial credentials (card number, CVV, PIN) must never be sent.',
      400
    );
  }

  // Normalize seat IDs and reject duplicates inside the same request
  const normalizedSeats = seats.map((s) => String(s).trim().toUpperCase());
  if (new Set(normalizedSeats).size !== normalizedSeats.length) {
    throw new AppError('Duplicate seats selected in request.', 400);
  }

  // 1. Fetch show + related documents
  const show = await Show.findById(showId)
    .populate('movie')
    .populate('theatre')
    .populate('screen');

  if (!show || !show.isActive || (show.movie && show.movie.isActive === false)) {
    throw new AppError('The requested movie show is not available.', 404);
  }

  if (show.startTime && show.startTime.getTime() <= Date.now()) {
    throw new AppError('Booking is closed: this screening has already started or passed.', 400);
  }

  // 2. Server-authoritative price calculation (also validates that every seat exists on this screen)
  const pricing = calculatePricing(normalizedSeats, show, show.screen);

  // 3. Fast-fail check against the currently occupied seats
  const alreadyBooked = normalizedSeats.filter((seat) => show.occupiedSeats.includes(seat));
  if (alreadyBooked.length > 0) {
    throw new AppError(
      `Seat(s) ${alreadyBooked.join(', ')} are already booked. Please choose other seats.`,
      409
    );
  }

  // 4. ATOMIC SEAT LOCK - the $nin guard makes the check-and-set a single DB operation,
  //    so two simultaneous requests can never both claim the same seat.
  const lockedShow = await Show.findOneAndUpdate(
    { _id: showId, occupiedSeats: { $nin: normalizedSeats } },
    { $push: { occupiedSeats: { $each: normalizedSeats } } },
    { new: true }
  );

  if (!lockedShow) {
    throw new AppError(
      'One or more of your selected seats were just reserved by another guest. Please choose different seats.',
      409
    );
  }

  const paymentAdapter = getPaymentAdapter();
  let paymentResult = null;
  let paymentDoc = null;
  let booking = null;

  try {
    // 5. Payment (demo adapter). Client-supplied details can never override server metadata.
    paymentResult = await paymentAdapter.processPayment({
      amount: pricing.totalAmount,
      currency: 'INR',
      method: paymentMethod,
      metadata: {
        simulateFailure: paymentDetails.simulateFailure === true,
        note: typeof paymentDetails.testNote === 'string' ? paymentDetails.testNote.slice(0, 200) : '',
        userId: userId.toString(),
        showId: showId.toString(),
        seats: normalizedSeats
      }
    });

    if (!paymentResult.success) {
      throw new AppError(
        `Payment processing failed: ${paymentResult.error || 'transaction declined.'}`,
        402
      );
    }

    // 6. Persist payment, then booking
    paymentDoc = await Payment.create({
      booking: null, // linked right after the booking exists
      user: userId,
      amount: pricing.totalAmount,
      currency: 'INR',
      method: paymentMethod,
      provider: paymentResult.provider,
      transactionId: paymentResult.transactionId,
      status: paymentResult.status,
      isDemo: paymentResult.isDemo,
      paidAt: paymentResult.paidAt
    });

    booking = await createBookingWithUniqueReference((bookingReference) => ({
      bookingReference,
      user: userId,
      show: showId,
      movieSnapshot: {
        id: show.movie?._id,
        title: show.movie?.title,
        posterUrl: show.movie?.posterUrl,
        certificate: show.movie?.certificate,
        format: show.format,
        language: show.language
      },
      theatreSnapshot: {
        id: show.theatre?._id,
        name: show.theatre?.name,
        city: show.theatre?.city,
        location: show.theatre?.location,
        screenName: show.screen?.name || 'Screen 1'
      },
      showSnapshot: {
        showDate: show.showDate,
        showTime: show.showTime,
        startTime: show.startTime
      },
      seats: pricing.seats,
      seatCount: pricing.seatCount,
      baseAmount: pricing.baseAmount,
      convenienceFee: pricing.convenienceFee,
      taxAmount: pricing.taxAmount,
      totalAmount: pricing.totalAmount,
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PAID',
      payment: paymentDoc._id,
      // QR payload used for scanning at the cinema entrance
      qrCodeData: JSON.stringify({
        ref: bookingReference,
        movie: show.movie?.title || 'Movie',
        theatre: show.theatre?.name || 'Cinema',
        screen: show.screen?.name || 'Screen',
        date: show.showDate,
        time: show.showTime,
        seats: normalizedSeats,
        total: pricing.totalAmount
      })
    }));

    paymentDoc.booking = booking._id;
    await paymentDoc.save();

    return booking;
  } catch (err) {
    // ROLLBACK: never leave seats locked or money captured without a booking
    await releaseSeats(showId, normalizedSeats);

    if (paymentDoc && !booking) {
      try {
        await paymentAdapter.refundPayment({
          transactionId: paymentDoc.transactionId,
          amount: paymentDoc.amount
        });
        paymentDoc.status = 'REFUNDED';
        await paymentDoc.save();
      } catch (refundErr) {
        console.error('[Booking] CRITICAL: refund after failed booking did not complete', refundErr.message);
      }
    }

    if (err instanceof AppError) throw err;
    console.error('[Booking] Unexpected failure while finalising booking:', err);
    throw new AppError(
      'Your booking could not be completed. Your seats were released and you have not been charged.',
      500
    );
  }
};

/**
 * Cancels a booking and releases its seats.
 * Policy: 100% of the base ticket amount is refunded; convenience fee + GST are non-refundable.
 */
const cancelBooking = async ({ bookingId, userId, isAdmin = false }) => {
  if (!mongoose.isValidObjectId(bookingId)) {
    throw new AppError('Booking not found or you are not authorized to cancel it.', 404);
  }

  const query = { _id: bookingId };
  if (!isAdmin) query.user = userId;

  const booking = await Booking.findOne(query);
  if (!booking) {
    throw new AppError('Booking not found or you are not authorized to cancel it.', 404);
  }

  if (booking.bookingStatus === 'CANCELLED') {
    throw new AppError('This booking is already cancelled.', 400);
  }

  // Cinema rule: a screening that already started cannot be cancelled by the customer
  if (!isAdmin) {
    const show = await Show.findById(booking.show);
    const startTime = (show && show.startTime) || (booking.showSnapshot && booking.showSnapshot.startTime);
    if (startTime && new Date(startTime).getTime() <= Date.now()) {
      throw new AppError(
        'Cannot cancel tickets for a movie screening that has already started or passed.',
        400
      );
    }
  }

  // Atomic status flip: two simultaneous cancel requests can only succeed once
  const refundAmount = booking.baseAmount;
  const cancelled = await Booking.findOneAndUpdate(
    { _id: booking._id, bookingStatus: 'CONFIRMED' },
    {
      $set: {
        bookingStatus: 'CANCELLED',
        paymentStatus: 'REFUNDED',
        refundAmount,
        cancelledAt: new Date()
      }
    },
    { new: true }
  );

  if (!cancelled) {
    throw new AppError('This booking is already cancelled.', 400);
  }

  const seatCodes = booking.seats.map((s) => s.seatId);
  try {
    await Show.updateOne({ _id: booking.show }, { $pull: { occupiedSeats: { $in: seatCodes } } });
    if (booking.payment) {
      await Payment.findByIdAndUpdate(booking.payment, { status: 'REFUNDED' });
    }
  } catch (err) {
    // Put the booking back so seats and status never disagree
    await Booking.updateOne(
      { _id: booking._id },
      { $set: { bookingStatus: 'CONFIRMED', paymentStatus: 'PAID', refundAmount: 0 }, $unset: { cancelledAt: 1 } }
    );
    throw new AppError('Cancellation could not be completed. Please try again.', 500);
  }

  return cancelled;
};

module.exports = {
  processBooking,
  cancelBooking,
  generateBookingReference,
  ALLOWED_PAYMENT_METHODS
};
