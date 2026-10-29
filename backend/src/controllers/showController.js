const mongoose = require('mongoose');
const Show = require('../models/Show');
const Theatre = require('../models/Theatre');
const { DEFAULT_LAYOUT } = require('../config/layout');
const { AppError, asyncHandler } = require('../middleware/errorMiddleware');
const { exactCI, localDateString, isValidDateString } = require('../utils/helpers');

const hasStarted = (show) => Boolean(show.startTime) && show.startTime.getTime() <= Date.now();

const tierPrice = (tierName, pricing) =>
  tierName === 'VIP' ? pricing.vip : tierName === 'Premium' ? pricing.premium : pricing.classic;

// @desc    Get shows with filtering by movie, city, theatre, and date
// @route   GET /api/shows?movieId=&theatreId=&city=&date=YYYY-MM-DD
// @access  Public
const getShows = asyncHandler(async (req, res, next) => {
  const { movieId, theatreId, city, date } = req.query;

  const query = { isActive: true };

  if (movieId) {
    if (!mongoose.isValidObjectId(movieId)) return next(new AppError('Invalid movie ID.', 400));
    query.movie = movieId;
  }

  if (theatreId) {
    if (!mongoose.isValidObjectId(theatreId)) return next(new AppError('Invalid theatre ID.', 400));
    query.theatre = theatreId;
  }

  if (date) {
    if (!isValidDateString(date)) return next(new AppError('Date must be in YYYY-MM-DD format.', 400));
    query.showDate = date;
  } else {
    query.showDate = localDateString(); // default: today (local time, not UTC)
  }

  // If a city is specified, only include theatres in that city
  if (city && city !== 'All') {
    const cityTheatreIds = await Theatre.find({ city: exactCI(city), isActive: true }).distinct('_id');
    if (query.theatre) {
      const allowed = cityTheatreIds.some((id) => id.toString() === String(query.theatre));
      query.theatre = allowed ? query.theatre : { $in: [] };
    } else {
      query.theatre = { $in: cityTheatreIds };
    }
  }

  const allShows = await Show.find(query)
    .populate('movie', 'title posterUrl certificate duration language formats isActive')
    .populate('theatre', 'name city address location amenities')
    .populate('screen', 'name soundSystem screenType totalSeats layout')
    .sort('startTime');

  // Hide screenings of movies that were deactivated by an admin
  const shows = allShows.filter((s) => !s.movie || s.movie.isActive !== false);

  // Group shows by Theatre for convenient frontend display
  const groupedTheatresMap = new Map();

  for (const show of shows) {
    if (!show.theatre) continue;

    const theatreIdStr = show.theatre._id.toString();
    if (!groupedTheatresMap.has(theatreIdStr)) {
      groupedTheatresMap.set(theatreIdStr, { theatre: show.theatre, shows: [] });
    }

    const totalSeats = show.screen ? show.screen.totalSeats : 120;
    const bookedCount = show.occupiedSeats ? show.occupiedSeats.length : 0;
    const occupancyPercentage = totalSeats > 0 ? (bookedCount / totalSeats) * 100 : 100;

    let availabilityStatus = 'AVAILABLE';
    if (bookedCount >= totalSeats) {
      availabilityStatus = 'SOLD_OUT';
    } else if (occupancyPercentage > 85) {
      availabilityStatus = 'ALMOST_FULL';
    } else if (occupancyPercentage > 50) {
      availabilityStatus = 'FAST_FILLING';
    }

    groupedTheatresMap.get(theatreIdStr).shows.push({
      _id: show._id,
      movie: show.movie ? { _id: show.movie._id, title: show.movie.title } : undefined,
      showTime: show.showTime,
      showDate: show.showDate,
      startTime: show.startTime,
      isPast: hasStarted(show),
      format: show.format,
      language: show.language,
      pricing: show.pricing,
      screenName: show.screen?.name || 'Screen 1',
      screenType: show.screen?.screenType || 'Standard',
      soundSystem: show.screen?.soundSystem || 'Dolby Atmos',
      availabilityStatus,
      totalSeats,
      availableSeatsCount: Math.max(0, totalSeats - bookedCount)
    });
  }

  res.status(200).json({
    success: true,
    count: shows.length,
    groupedShows: Array.from(groupedTheatresMap.values()),
    shows: shows.map((s) => ({ ...s.toObject(), isPast: hasStarted(s) }))
  });
});

// @desc    Get single show by ID with seat layout and occupied seats
// @route   GET /api/shows/:id
// @access  Public
const getShowById = asyncHandler(async (req, res, next) => {
  const show = await Show.findById(req.params.id)
    .populate('movie')
    .populate('theatre')
    .populate('screen');

  if (!show || !show.isActive) {
    return next(new AppError('Show not found or inactive', 404));
  }

  // Build the seat grid matrix for the interactive seat selection view
  const screen = show.screen;
  const tiers = screen?.layout?.tiers?.length ? screen.layout.tiers : DEFAULT_LAYOUT.tiers;
  const aisles = screen?.layout?.aisles?.length ? screen.layout.aisles : DEFAULT_LAYOUT.aisles;

  const occupiedSet = new Set((show.occupiedSeats || []).map((s) => s.toUpperCase()));

  const layoutMatrix = tiers.map((tierConfig) => ({
    tierName: tierConfig.name,
    price: tierPrice(tierConfig.name, show.pricing),
    rows: tierConfig.rows.map((rowChar) => {
      const count = tierConfig.seatsPerRow || 12;
      const seats = [];
      for (let i = 1; i <= count; i += 1) {
        const seatId = `${rowChar}${i}`;
        seats.push({
          seatId,
          row: rowChar,
          number: i,
          tier: tierConfig.name,
          price: tierPrice(tierConfig.name, show.pricing),
          status: occupiedSet.has(seatId) ? 'BOOKED' : 'AVAILABLE',
          isAisleAfter: aisles.includes(i)
        });
      }
      return { row: rowChar, tier: tierConfig.name, seats };
    })
  }));

  res.status(200).json({
    success: true,
    show: {
      _id: show._id,
      movie: show.movie,
      theatre: show.theatre,
      screen: {
        _id: screen?._id,
        name: screen?.name,
        soundSystem: screen?.soundSystem,
        screenType: screen?.screenType,
        totalSeats: screen?.totalSeats
      },
      showDate: show.showDate,
      showTime: show.showTime,
      startTime: show.startTime,
      hasStarted: hasStarted(show),
      format: show.format,
      language: show.language,
      pricing: show.pricing,
      occupiedSeats: show.occupiedSeats,
      totalOccupied: show.occupiedSeats.length,
      layoutMatrix
    }
  });
});

// @desc    Get real-time seat availability for a show
// @route   GET /api/shows/:id/availability
// @access  Public
const getShowAvailability = asyncHandler(async (req, res, next) => {
  const show = await Show.findById(req.params.id).populate('screen');
  if (!show || !show.isActive) {
    return next(new AppError('Show not found or inactive', 404));
  }

  const totalSeats = show.screen?.totalSeats || 120;
  const occupiedSeats = show.occupiedSeats || [];
  const availableCount = Math.max(0, totalSeats - occupiedSeats.length);

  res.status(200).json({
    success: true,
    showId: show._id,
    totalSeats,
    occupiedSeats,
    occupiedCount: occupiedSeats.length,
    availableCount,
    isSoldOut: availableCount === 0,
    hasStarted: hasStarted(show)
  });
});

module.exports = {
  getShows,
  getShowById,
  getShowAvailability
};
