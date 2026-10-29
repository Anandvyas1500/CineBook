const mongoose = require('mongoose');
const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const { AppError, asyncHandler } = require('../middleware/errorMiddleware');
const { exactCI } = require('../utils/helpers');

const DEFAULT_CITIES = ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'];

// @desc    Get active cities (that really have theatres) with their theatre counts
// @route   GET /api/theatres/cities
// @access  Public
const getCities = asyncHandler(async (req, res) => {
  const rows = await Theatre.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$city', theatresCount: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const cityDetails =
    rows.length > 0
      ? rows.map((r) => ({ name: r._id, theatresCount: r.theatresCount }))
      : DEFAULT_CITIES.map((name) => ({ name, theatresCount: 0 }));

  res.status(200).json({
    success: true,
    cities: cityDetails.map((c) => c.name),
    cityDetails
  });
});

// @desc    Get theatres, optionally filtered by city
// @route   GET /api/theatres
// @access  Public
const getTheatres = asyncHandler(async (req, res) => {
  const { city } = req.query;
  const query = { isActive: true };

  if (typeof city === 'string' && city && city !== 'All') {
    query.city = exactCI(city);
  }

  const theatres = await Theatre.find(query).sort('name');

  res.status(200).json({
    success: true,
    count: theatres.length,
    theatres
  });
});

// @desc    Get single theatre by ID with its screens
// @route   GET /api/theatres/:id
// @access  Public
const getTheatreById = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError('Theatre not found', 404));
  }

  const theatre = await Theatre.findById(req.params.id);
  if (!theatre) {
    return next(new AppError('Theatre not found', 404));
  }

  const screens = await Screen.find({ theatre: theatre._id, isActive: true });

  res.status(200).json({
    success: true,
    theatre,
    screens
  });
});

module.exports = {
  getCities,
  getTheatres,
  getTheatreById
};
