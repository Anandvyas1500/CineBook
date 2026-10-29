const Booking = require('../models/Booking');
const Show = require('../models/Show');
const { calculatePricing } = require('../services/pricingService');
const { processBooking, cancelBooking } = require('../services/bookingService');
const { AppError, asyncHandler } = require('../middleware/errorMiddleware');

// @desc    Calculate authoritative checkout price breakdown
// @route   POST /api/bookings/calculate-price
// @access  Public / Private
const calculateCheckoutPrice = asyncHandler(async (req, res, next) => {
  const { showId, seats } = req.body;

  if (!showId || !seats || !Array.isArray(seats) || seats.length === 0 || seats.length > 10) {
    return next(new AppError('Show ID and 1 to 10 selected seats are required.', 400));
  }

  const show = await Show.findById(showId).populate('screen');
  if (!show) {
    return next(new AppError('Show not found', 404));
  }

  const pricing = calculatePricing(seats, show, show.screen);

  res.status(200).json({
    success: true,
    pricing
  });
});

// @desc    Create a new movie ticket booking with atomic seat reservation
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res, next) => {
  const { showId, seats, paymentMethod, paymentDetails } = req.body;

  const booking = await processBooking({
    userId: req.user._id,
    showId,
    seats,
    paymentMethod: paymentMethod || 'DEMO_UPI',
    paymentDetails: paymentDetails || {}
  });

  res.status(201).json({
    success: true,
    message: 'Booking confirmed successfully!',
    booking
  });
});

// @desc    Get bookings of the currently logged-in user
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('payment')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: bookings.length,
    bookings
  });
});

// @desc    Get booking by reference ID or Mongo ID
// @route   GET /api/bookings/:refOrId
// @access  Private
const getBookingByReference = asyncHandler(async (req, res, next) => {
  const { refOrId } = req.params;

  let query;
  if (refOrId.match(/^[0-9a-fA-F]{24}$/)) {
    query = { _id: refOrId };
  } else {
    query = { bookingReference: refOrId.toUpperCase() };
  }

  const booking = await Booking.findOne(query).populate('payment');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Authorization check: must be owner or admin
  if (
    req.user.role !== 'admin' &&
    booking.user.toString() !== req.user._id.toString()
  ) {
    return next(new AppError('You are not authorized to view this booking.', 403));
  }

  res.status(200).json({
    success: true,
    booking
  });
});

// @desc    Cancel a booking and release reserved seats
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelUserBooking = asyncHandler(async (req, res) => {
  const booking = await cancelBooking({
    bookingId: req.params.id,
    userId: req.user._id,
    isAdmin: req.user.role === 'admin'
  });

  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully. Seats have been released.',
    booking
  });
});

// @desc    Get cinema cancellation rules & refund policies
// @route   GET /api/bookings/cancellation-rules
// @access  Public
const getCancellationRules = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    rules: {
      cutoffDescription: 'Tickets may be cancelled before the scheduled screening start time.',
      refundPolicy: '100% of the base ticket amount is refunded to original payment method.',
      convenienceFeePolicy: 'Convenience fees and taxes are non-refundable per ticketing policy.',
      seatRelease: 'Occupied seats are instantly and atomically returned to public auditorium inventory.',
      mode: 'Self-service cancellation supported directly through My Bookings portal.'
    }
  });
});

module.exports = {
  calculateCheckoutPrice,
  createBooking,
  getMyBookings,
  getBookingByReference,
  cancelUserBooking,
  getCancellationRules
};
