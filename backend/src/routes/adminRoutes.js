const express = require('express');
const { body, param } = require('express-validator');
const {
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
} = require('../controllers/adminController');
const { createCity, updateCity, deleteCity } = require('../controllers/cityController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

// Apply auth and admin check to all admin routes
router.use(protect, authorize('admin'));

// Validation schemas
const movieValidation = [
  body('title').trim().notEmpty().withMessage('Movie title is required'),
  body('synopsis').trim().notEmpty().withMessage('Movie synopsis is required'),
  body('posterUrl').isURL().withMessage('Valid poster URL is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be positive minutes')
];

const theatreValidation = [
  body('name').trim().notEmpty().withMessage('Theatre name is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('address').trim().notEmpty().withMessage('Address is required')
];

const showValidation = [
  body('movie').isMongoId().withMessage('Valid movie ID is required'),
  body('theatre').isMongoId().withMessage('Valid theatre ID is required'),
  body('screen').isMongoId().withMessage('Valid screen ID is required'),
  body('showDate').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Show date must be in YYYY-MM-DD format'),
  body('showTime')
    .trim()
    .matches(/^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM)$/i)
    .withMessage('Show time must look like 06:30 PM')
];

// Stats & metrics
router.get('/stats', getDashboardStats);

// Movie management
router.post('/movies', validate(movieValidation), createMovie);
router.put('/movies/:id', validate([param('id').isMongoId().withMessage('Invalid movie ID')]), updateMovie);
router.delete('/movies/:id', deleteMovie);

// Theatre & Screen management
router.post('/theatres', validate(theatreValidation), createTheatre);
router.put('/theatres/:id', validate([param('id').isMongoId().withMessage('Invalid theatre ID')]), updateTheatre);
router.delete('/theatres/:id', deleteTheatre);
router.post('/screens', createScreen);

// Show scheduling
router.post('/shows', validate(showValidation), createShow);
router.delete('/shows/:id', deleteShow);

// City management
router.post('/cities', validate([body('name').trim().notEmpty().withMessage('City name is required')]), createCity);
router.put('/cities/:id', validate([param('id').isMongoId().withMessage('Invalid city ID')]), updateCity);
router.delete('/cities/:id', deleteCity);

// Bookings audit
router.get('/bookings', getAllBookings);

module.exports = router;

