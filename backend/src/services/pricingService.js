const config = require('../config/config');
const { DEFAULT_LAYOUT } = require('../config/layout');
const { AppError } = require('../middleware/errorMiddleware');

const SEAT_ID_RE = /^([A-Z]+)(\d{1,3})$/;

const getTiers = (screen) =>
  screen && screen.layout && screen.layout.tiers && screen.layout.tiers.length > 0
    ? screen.layout.tiers
    : DEFAULT_LAYOUT.tiers;

/**
 * Resolves a seat ID (e.g. "A4") to { tier, row, number } if - and only if - the seat
 * really exists in the screen's layout. Returns null for unknown seats ("Z99", "A13", ...).
 */
const resolveSeat = (seatId, screen) => {
  const match = SEAT_ID_RE.exec(String(seatId).trim().toUpperCase());
  if (!match) return null;
  const [, row, numberStr] = match;
  const number = parseInt(numberStr, 10);

  for (const tier of getTiers(screen)) {
    if (tier.rows.includes(row)) {
      const perRow = tier.seatsPerRow || 12;
      if (number >= 1 && number <= perRow) {
        return { tier: tier.name, row, number };
      }
      return null;
    }
  }
  return null;
};

/** Maps a seatId to its tier name ('Classic' | 'Premium' | 'VIP'), or null if the seat does not exist. */
const getSeatTier = (seatId, screen) => {
  const seat = resolveSeat(seatId, screen);
  return seat ? seat.tier : null;
};

const priceForTier = (tier, pricing = {}) => {
  if (tier === 'VIP') return pricing.vip || 450;
  if (tier === 'Premium') return pricing.premium || 280;
  return pricing.classic || 180;
};

/**
 * Official server-side pricing for a list of seat IDs. Never trust client prices.
 * Throws a 400 AppError when a seat does not exist on the screen.
 */
const calculatePricing = (seatIds, show, screen) => {
  if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    throw new AppError('Seat IDs array is required for pricing calculation.', 400);
  }

  const seatBreakdown = [];
  let baseAmount = 0;
  const invalid = [];

  for (const rawId of seatIds) {
    const seatId = String(rawId).trim().toUpperCase();
    const tier = getSeatTier(seatId, screen);
    if (!tier) {
      invalid.push(seatId);
      continue;
    }
    const price = priceForTier(tier, show.pricing);
    seatBreakdown.push({ seatId, tier, price });
    baseAmount += price;
  }

  if (invalid.length > 0) {
    throw new AppError(`Invalid seat(s) for this screen: ${invalid.join(', ')}.`, 400);
  }

  const seatCount = seatBreakdown.length;
  const convenienceFee = config.pricing.convenienceFeePerTicket * seatCount;
  const taxAmount = Math.round(convenienceFee * config.pricing.taxRate);
  const totalAmount = baseAmount + convenienceFee + taxAmount;

  return {
    seatCount,
    seats: seatBreakdown,
    baseAmount,
    convenienceFee,
    taxAmount,
    totalAmount,
    currency: 'INR'
  };
};

module.exports = {
  resolveSeat,
  getSeatTier,
  priceForTier,
  calculatePricing
};
