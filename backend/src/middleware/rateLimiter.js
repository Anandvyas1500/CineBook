const config = require('../config/config');
const { AppError } = require('./errorMiddleware');

/**
 * Tiny dependency-free fixed-window rate limiter (per client IP).
 * Good enough to blunt password guessing and booking spam on a single server instance;
 * use a shared store (e.g. Redis) if you run several instances.
 */
const createRateLimiter = ({ windowMs, max, message = 'Too many requests. Please try again later.' }) => {
  const hits = new Map();

  const sweeper = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, windowMs);
  sweeper.unref();

  return (req, res, next) => {
    if (config.nodeEnv === 'test') return next();

    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));

    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      return next(new AppError(message, 429));
    }
    return next();
  };
};

module.exports = { createRateLimiter };
