const express = require('express');
const { body } = require('express-validator');
const {
  calculateCheckoutPrice,
  createBooking,
  getMyBookings,
  getBookingByReference,
  cancelUserBooking,
  getCancellationRules
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { createRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const bookingLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: 'Too many booking attempts. Please wait a few minutes.'
});

const seatsRule = body('seats').isArray({ min: 1, max: 10 }).withMessage('1 to 10 seats must be selected');
const showRule = body('showId').isMongoId().withMessage('A valid show ID is required');

router.get('/cancellation-rules', getCancellationRules);
router.post('/calculate-price', validate([showRule, seatsRule]), calculateCheckoutPrice);
router.post('/', protect, bookingLimiter, validate([showRule, seatsRule]), createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:refOrId', protect, getBookingByReference);
router.put('/:id/cancel', protect, cancelUserBooking);

module.exports = router;
