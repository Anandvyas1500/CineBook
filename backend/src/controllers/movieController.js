const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Show = require('../models/Show');
const Theatre = require('../models/Theatre');
const { AppError, asyncHandler } = require('../middleware/errorMiddleware');
const { escapeRegex, exactCI } = require('../utils/helpers');

const SORTS = {
  rating: '-rating',
  newest: '-releaseDate',
  title: 'title'
};

// @desc    Get all active movies with filters and search
// @route   GET /api/movies?q=&genre=&language=&format=&minRating=&city=&sort=
// @access  Public
const getMovies = asyncHandler(async (req, res) => {
  const { q, genre, language, format, minRating, city, sort, includeInactive } = req.query;

  const query = {};
  if (includeInactive !== 'true') {
    query.isActive = true;
  }

  // Search by title, synopsis or director (user input is escaped - "(" or "[" must not crash the search)
  if (typeof q === 'string' && q.trim()) {
    const pattern = escapeRegex(q.trim().slice(0, 100));
    query.$or = [
      { title: { $regex: pattern, $options: 'i' } },
      { synopsis: { $regex: pattern, $options: 'i' } },
      { director: { $regex: pattern, $options: 'i' } }
    ];
  }

  if (typeof genre === 'string' && genre && genre !== 'All') {
    query.genre = { $in: [exactCI(genre)] };
  }

  if (typeof language === 'string' && language && language !== 'All') {
    query.language = { $in: [exactCI(language)] };
  }

  if (typeof format === 'string' && format && format !== 'All') {
    query.formats = { $in: [exactCI(format)] };
  }

  const ratingFloor = Number(minRating);
  if (minRating !== undefined && minRating !== '' && !Number.isNaN(ratingFloor)) {
    query.rating = { $gte: ratingFloor };
  }

  // "Now showing in <city>": only movies that still have an upcoming show in that city
  if (typeof city === 'string' && city && city !== 'All') {
    const theatreIds = await Theatre.find({ city: exactCI(city), isActive: true }).distinct('_id');
    const movieIds = await Show.distinct('movie', {
      theatre: { $in: theatreIds },
      isActive: true,
      startTime: { $gt: new Date() }
    });
    query._id = { $in: movieIds };
  }

  const movies = await Movie.find(query).sort(SORTS[sort] || SORTS.newest);

  res.status(200).json({
    success: true,
    count: movies.length,
    movies
  });
});

// @desc    Get featured movies for banner carousel
// @route   GET /api/movies/featured
// @access  Public
const getFeaturedMovies = asyncHandler(async (req, res) => {
  const featured = await Movie.find({ isActive: true, isFeatured: true }).limit(5);

  // If no explicitly featured movies, fall back to the top-rated ones
  if (featured.length === 0) {
    const topRated = await Movie.find({ isActive: true }).sort('-rating').limit(5);
    return res.status(200).json({ success: true, count: topRated.length, movies: topRated });
  }

  res.status(200).json({
    success: true,
    count: featured.length,
    movies: featured
  });
});

// @desc    Get single movie by ID or slug
// @route   GET /api/movies/:idOrSlug
// @access  Public
const getMovieById = asyncHandler(async (req, res, next) => {
  const { idOrSlug } = req.params;

  const movie = mongoose.isValidObjectId(idOrSlug)
    ? await Movie.findById(idOrSlug)
    : await Movie.findOne({ slug: idOrSlug.toLowerCase() });

  // Deactivated movies are not reachable through direct links unless includeInactive is specified
  if (!movie || (!movie.isActive && req.query.includeInactive !== 'true')) {
    return next(new AppError('Movie not found', 404));
  }

  res.status(200).json({
    success: true,
    movie
  });
});

module.exports = {
  getMovies,
  getFeaturedMovies,
  getMovieById
};
