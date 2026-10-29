const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { createRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// 20 attempts per 15 minutes per IP for login / registration
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many sign-in attempts. Please wait a few minutes and try again.'
});

// Keep the e-mail exactly as typed (only lower-cased) - do not strip dots from Gmail addresses
const emailRule = body('email')
  .isEmail()
  .withMessage('Valid email is required')
  .bail()
  .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false });

const phoneRule = body('phone')
  .optional({ checkFalsy: true })
  .matches(/^\+?[\d\s-]{7,18}$/)
  .withMessage('Phone number looks invalid');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name is too long'),
  emailRule,
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  phoneRule
];

const loginValidation = [emailRule, body('password').notEmpty().withMessage('Password is required')];

const profileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 50 }).withMessage('Name is too long'),
  phoneRule,
  body('avatar')
    .optional({ checkFalsy: true })
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Avatar must be a valid http(s) URL')
];

const passwordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
];

router.post('/register', authLimiter, validate(registerValidation), register);
router.post('/login', authLimiter, validate(loginValidation), login);
router.get('/me', protect, getMe);
router.put('/profile', protect, validate(profileValidation), updateProfile);
router.put('/change-password', protect, validate(passwordValidation), changePassword);

module.exports = router;
