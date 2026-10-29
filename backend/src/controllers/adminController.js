const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { cloneDefaultLayout } = require('../config/layout');
const { AppError, asyncHandler } = require('../middleware/errorMiddleware');
const { buildShowStart, formatShowTime, clampInt } = require('../utils/helpers');

// Only these fields can be written from the admin forms (no mass-assignment of slug, _id, ...)
const MOVIE_FIELDS = [
  'title', 'synopsis', 'posterUrl', 'backdropUrl', 'trailerUrl', 'duration', 'releaseDate',
  'genre', 'language', 'formats', 'certificate', 'rating', 'votesCount', 'director', 'cast',
  'isFeatured', 'isActive'
];
const THEATRE_FIELDS = ['name', 'city', 'address', 'location', 'amenities', 'isActive'];
const SCREEN_FIELDS = [
  'theatre', 'screenNumber', 'name', 'soundSystem', 'screenType', 'totalSeats', 'layout', 'isActive'
];

const pick = (source = {}, keys) =>
  keys.reduce((acc, key) => {
    if (source[key] !== undefined) acc[key] = source[key];
    return acc;
  }, {});

// @desc    Get Admin Dashboard Stats & Metrics
// @route   GET /api/admin/stats
// @access  Private / Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalBookings,
    confirmedBookings,
    totalMovies,
    totalTheatres,
    totalScreens,
    revenueResult,
    recentBookings
  ] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ bookingStatus: 'CONFIRMED' }),
    Movie.countDocuments({ isActive: true }),
    Theatre.countDocuments({ isActive: true }),
    Screen.countDocuments({ isActive: true }),
    Booking.aggregate([
      { $match: { bookingStatus: 'CONFIRMED', paymentStatus: 'PAID' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]),
    Booking.find().sort('-createdAt').limit(10).populate('user', 'name email')
  ]);

  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  res.status(200).json({
    success: true,
    stats: {
      totalBookings,
      confirmedBookings,
      totalMovies,
      totalTheatres,
      totalScreens,
      totalRevenue,
      recentBookings
    }
  });
});

// @desc    Create new Movie
// @route   POST /api/admin/movies
// @access  Private / Admin
const createMovie = asyncHandler(async (req, res) => {
  const data = pick(req.body, MOVIE_FIELDS);
  if (data.releaseDate === '' || data.releaseDate === null) {
    delete data.releaseDate;
  }
  const movie = await Movie.create(data);
  res.status(201).json({ success: true, message: 'Movie added successfully', movie });
});

// @desc    Update Movie
// @route   PUT /api/admin/movies/:id
// @access  Private / Admin
const updateMovie = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return next(new AppError('Movie not found', 404));

  const updates = pick(req.body, MOVIE_FIELDS);
  if (updates.releaseDate === '' || updates.releaseDate === null) {
    delete updates.releaseDate;
  }

  Object.assign(movie, updates);
  await movie.save(); // runs validators + regenerates the slug if the title changed

  res.status(200).json({ success: true, message: 'Movie updated successfully', movie });
});

// @desc    Deactivate Movie (soft delete)
// @route   DELETE /api/admin/movies/:id
// @access  Private / Admin
const deleteMovie = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!movie) return next(new AppError('Movie not found', 404));
  res.status(200).json({ success: true, message: 'Movie deactivated successfully' });
});

// @desc    Create new Theatre (with a default screen unless createDefaultScreen === false)
// @route   POST /api/admin/theatres
// @access  Private / Admin
const createTheatre = asyncHandler(async (req, res) => {
  const withScreen = req.body.createDefaultScreen !== false;
  const theatre = await Theatre.create({
    ...pick(req.body, THEATRE_FIELDS),
    screensCount: withScreen ? 1 : 0
  });

  let screen = null;
  if (withScreen) {
    screen = await Screen.create({
      theatre: theatre._id,
      screenNumber: 1,
      name: 'Screen 1',
      screenType: 'Standard',
      totalSeats: 120,
      layout: cloneDefaultLayout()
    });
  }

  res.status(201).json({ success: true, message: 'Theatre created successfully', theatre, screen });
});

// @desc    Update Theatre
// @route   PUT /api/admin/theatres/:id
// @access  Private / Admin
const updateTheatre = asyncHandler(async (req, res, next) => {
  const theatre = await Theatre.findById(req.params.id);
  if (!theatre) return next(new AppError('Theatre not found', 404));

  Object.assign(theatre, pick(req.body, THEATRE_FIELDS));
  await theatre.save();

  res.status(200).json({ success: true, message: 'Theatre updated successfully', theatre });
});

// @desc    Deactivate Theatre (soft delete)
// @route   DELETE /api/admin/theatres/:id
// @access  Private / Admin
const deleteTheatre = asyncHandler(async (req, res, next) => {
  const theatre = await Theatre.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!theatre) return next(new AppError('Theatre not found', 404));
  res.status(200).json({ success: true, message: 'Theatre deactivated successfully' });
});

// @desc    Create new Screen
// @route   POST /api/admin/screens
// @access  Private / Admin
const createScreen = asyncHandler(async (req, res, next) => {
  const data = pick(req.body, SCREEN_FIELDS);
  if (!data.theatre || !mongoose.isValidObjectId(data.theatre) || !(await Theatre.exists({ _id: data.theatre }))) {
    return next(new AppError('A valid theatre is required to add a screen.', 400));
  }
  if (!data.layout) data.layout = cloneDefaultLayout();

  const screen = await Screen.create(data);
  await Theatre.updateOne({ _id: data.theatre }, { $inc: { screensCount: 1 } });

  res.status(201).json({ success: true, message: 'Screen added successfully', screen });
});

// @desc    Schedule a new Show
// @route   POST /api/admin/shows
// @access  Private / Admin
const createShow = asyncHandler(async (req, res, next) => {
  const { movie, theatre, screen, showDate, showTime, format, language, pricing } = req.body;

  const startTime = buildShowStart(showDate, showTime);
  if (!startTime) {
    return next(new AppError('Show date (YYYY-MM-DD) and time (e.g. 06:30 PM) must be valid.', 400));
  }
  if (startTime.getTime() <= Date.now()) {
    return next(new AppError('A show cannot be scheduled in the past.', 400));
  }

  const [movieDoc, theatreDoc, screenDoc] = await Promise.all([
    Movie.findById(movie),
    Theatre.findById(theatre),
    Screen.findById(screen)
  ]);
  if (!movieDoc || !movieDoc.isActive) return next(new AppError('Movie not found or inactive.', 404));
  if (!theatreDoc || !theatreDoc.isActive) return next(new AppError('Theatre not found or inactive.', 404));
  if (!screenDoc) return next(new AppError('Screen not found.', 404));
  if (!screenDoc.theatre.equals(theatreDoc._id)) {
    return next(new AppError('The selected screen does not belong to the selected theatre.', 400));
  }

  // Two films cannot start on the same screen at the same time
  const clash = await Show.exists({ screen: screenDoc._id, startTime, isActive: true });
  if (clash) {
    return next(new AppError('That screen already has a show scheduled at this date and time.', 409));
  }

  const prices = {
    classic: Number(pricing?.classic ?? 180),
    premium: Number(pricing?.premium ?? 280),
    vip: Number(pricing?.vip ?? 450)
  };
  if (Object.values(prices).some((p) => !Number.isFinite(p) || p <= 0)) {
    return next(new AppError('Ticket prices must be positive numbers.', 400));
  }

  const show = await Show.create({
    movie: movieDoc._id,
    theatre: theatreDoc._id,
    screen: screenDoc._id,
    showDate,
    showTime: formatShowTime(showTime),
    startTime,
    format: format || movieDoc.formats?.[0] || '2D',
    language: language || movieDoc.language?.[0] || 'English',
    pricing: prices,
    occupiedSeats: []
  });

  res.status(201).json({ success: true, message: 'Show scheduled successfully', show });
});

// @desc    Cancel a Show. Customers who already booked it are automatically cancelled and
//          refunded in full (the cinema cancelled, so fees and tax are refunded too).
// @route   DELETE /api/admin/shows/:id
// @access  Private / Admin
const deleteShow = asyncHandler(async (req, res, next) => {
  const show = await Show.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!show) return next(new AppError('Show not found', 404));

  const affected = await Booking.find({ show: show._id, bookingStatus: 'CONFIRMED' });
  for (const booking of affected) {
    booking.bookingStatus = 'CANCELLED';
    booking.paymentStatus = 'REFUNDED';
    booking.refundAmount = booking.totalAmount;
    booking.cancelledAt = new Date();
    // eslint-disable-next-line no-await-in-loop
    await booking.save();
    if (booking.payment) {
      // eslint-disable-next-line no-await-in-loop
      await Payment.findByIdAndUpdate(booking.payment, { status: 'REFUNDED' });
    }
  }
  await Show.updateOne({ _id: show._id }, { $set: { occupiedSeats: [] } });

  res.status(200).json({
    success: true,
    message: 'Show cancelled successfully',
    cancelledBookings: affected.length
  });
});

// @desc    Get all bookings across the system for admin audit
// @route   GET /api/admin/bookings
// @access  Private / Admin
const getAllBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const limit = clampInt(req.query.limit, { min: 1, max: 200, fallback: 50 });

  const query = {};
  if (status && status !== 'All') {
    query.bookingStatus = String(status).toUpperCase();
  }

  const bookings = await Booking.find(query)
    .populate('user', 'name email phone')
    .sort('-createdAt')
    .limit(limit);

  res.status(200).json({ success: true, count: bookings.length, bookings });
});

module.exports = {
  getDashboardStats,
  createMovie,
  updateMovie,
  deleteMovie,
  createTheatre,
  updateTheatre,
  deleteTheatre,
  createScreen,
  createShow,
  deleteShow,
  getAllBookings
};
