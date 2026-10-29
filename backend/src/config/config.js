require('dotenv').config();

// Keep every date calculation (today's shows, show start times) in one time zone,
// regardless of where the server is hosted. Override with APP_TIMEZONE in .env.
process.env.TZ = process.env.APP_TIMEZONE || process.env.TZ || 'Asia/Kolkata';

const nodeEnv = process.env.NODE_ENV || 'development';
const DEV_FALLBACK_SECRET = 'cinebook_default_dev_secret_key_2026';

const jwtSecret = process.env.JWT_SECRET || DEV_FALLBACK_SECRET;

if (nodeEnv === 'production') {
  const weak =
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32 ||
    /change_in_production|default_dev/i.test(process.env.JWT_SECRET);
  if (weak) {
    throw new Error(
      'Refusing to start in production with a missing/weak JWT_SECRET. ' +
        'Set JWT_SECRET to a random string of at least 32 characters.'
    );
  }
}

const config = {
  port: process.env.PORT || 5000,
  nodeEnv,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cinebook',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  paymentMode: process.env.PAYMENT_MODE || 'DEMO',
  // Comma separated list of allowed browser origins (CORS)
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  trustProxy: process.env.TRUST_PROXY === 'true',
  pricing: {
    convenienceFeePerTicket: 30, // INR per ticket
    taxRate: 0.18 // 18% GST on convenience fee
  },
  booking: {
    maxSeatsPerBooking: 10
  }
};

module.exports = config;
