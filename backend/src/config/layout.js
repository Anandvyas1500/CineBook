/**
 * Default auditorium layout, shared by the seeder, the pricing service,
 * the show/seat-map controller and the admin "create theatre" flow.
 */
const DEFAULT_LAYOUT = Object.freeze({
  tiers: [
    { name: 'VIP', rows: ['A', 'B'], seatsPerRow: 12 },
    { name: 'Premium', rows: ['C', 'D', 'E', 'F'], seatsPerRow: 12 },
    { name: 'Classic', rows: ['G', 'H', 'I', 'J'], seatsPerRow: 12 }
  ],
  aisles: [3, 9]
});

/** Returns a fresh, mutable copy (Mongoose does not like frozen arrays). */
const cloneDefaultLayout = () => JSON.parse(JSON.stringify(DEFAULT_LAYOUT));

module.exports = { DEFAULT_LAYOUT, cloneDefaultLayout };
