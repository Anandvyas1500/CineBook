// Pure unit tests - no database required
const { escapeRegex, parseShowTime, buildShowStart, isValidDateString, localDateString } = require('../utils/helpers');
const { calculatePricing, resolveSeat } = require('../services/pricingService');
const { containsSensitiveKeys } = require('../services/paymentAdapter');

describe('helpers', () => {
  test('escapeRegex neutralises regex metacharacters', () => {
    expect(new RegExp(escapeRegex('C++ (x)')).test('C++ (x)')).toBe(true);
  });

  test('parseShowTime handles 12 AM / 12 PM correctly', () => {
    expect(parseShowTime('12:15 AM')).toEqual({ hours: 0, minutes: 15 });
    expect(parseShowTime('12:30 PM')).toEqual({ hours: 12, minutes: 30 });
    expect(parseShowTime('06:45 PM')).toEqual({ hours: 18, minutes: 45 });
    expect(parseShowTime('13:00 PM')).toBeNull();
  });

  test('date helpers use local time and reject impossible dates', () => {
    expect(localDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(isValidDateString('2026-02-30')).toBe(false);
    expect(buildShowStart('2026-10-20', '08:00 PM').getHours()).toBe(20);
  });
});

describe('pricing & seats', () => {
  const screen = { layout: { tiers: [{ name: 'VIP', rows: ['A'], seatsPerRow: 6 }, { name: 'Classic', rows: ['C'], seatsPerRow: 6 }] } };
  const show = { pricing: { classic: 150, premium: 250, vip: 400 } };

  test('resolves only seats that exist', () => {
    expect(resolveSeat('A6', screen).tier).toBe('VIP');
    expect(resolveSeat('A7', screen)).toBeNull();
    expect(resolveSeat('Z1', screen)).toBeNull();
  });

  test('prices server-side with fee and GST', () => {
    const p = calculatePricing(['A2', 'C1'], show, screen);
    expect([p.baseAmount, p.convenienceFee, p.taxAmount, p.totalAmount]).toEqual([550, 60, 11, 621]);
  });

  test('payment adapter flags credential-like keys, including nested ones', () => {
    expect(containsSensitiveKeys({ a: { CVV: '1' } })).toBe(true);
    expect(containsSensitiveKeys({ testNote: 'ok' })).toBe(false);
  });
});
