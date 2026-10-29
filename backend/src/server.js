const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/config');
const { connectDB } = require('./config/db');
const { AppError, notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const theatreRoutes = require('./routes/theatreRoutes');
const showRoutes = require('./routes/showRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cityRoutes = require('./routes/cityRoutes');

const app = express();

app.disable('x-powered-by');
if (config.trustProxy) app.set('trust proxy', 1); // needed for correct client IPs behind nginx / a PaaS

// Basic security headers (dependency-free)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

// CORS: configured origins always; any localhost port only outside production
const isLocalhost = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.clientUrls.includes(origin) || (config.nodeEnv !== 'production' && isLocalhost(origin))) {
        return callback(null, true);
      }
      return callback(new AppError('Origin not allowed by CORS policy.', 403));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// There are no file uploads, so a small body limit is plenty
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// System Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'CineBook API',
    environment: config.nodeEnv,
    paymentMode: config.paymentMode,
    timezone: process.env.TZ,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cities', cityRoutes);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    return app.listen(config.port, () => {
      console.log('\n======================================================');
      console.log(`CineBook API running on port ${config.port}`);
      console.log(`Health check:  http://localhost:${config.port}/api/health`);
      console.log(`Environment:   ${config.nodeEnv}   |   Time zone: ${process.env.TZ}`);
      console.log(`Payment mode:  ${config.paymentMode}`);
      console.log('======================================================\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
