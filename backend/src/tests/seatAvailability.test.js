const request = require('supertest');
const app = require('../server');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Show = require('../models/Show');
const { setupTestDB } = require('./setup');

setupTestDB();

const start = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
start.setHours(18, 0, 0, 0);
const showDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;

describe('Seat Availability & Layout Test Suite', () => {
  let showDoc;
  let screenDoc;

  beforeEach(async () => {
    const movie = await Movie.create({
      title: 'Interstellar',
      synopsis: 'Explorers travel through a wormhole.',
      posterUrl: 'https://example.com/poster.jpg',
      duration: 169
    });

    const theatre = await Theatre.create({
      name: 'PVR ICON',
      city: 'Mumbai',
      address: 'Infinity Mall'
    });

    screenDoc = await Screen.create({
      theatre: theatre._id,
      screenNumber: 1,
      name: 'Screen 1',
      totalSeats: 24,
      layout: {
        tiers: [
          { name: 'VIP', rows: ['A'], seatsPerRow: 6 },
          { name: 'Premium', rows: ['B'], seatsPerRow: 6 },
          { name: 'Classic', rows: ['C', 'D'], seatsPerRow: 6 }
        ]
      }
    });

    showDoc = await Show.create({
      movie: movie._id,
      theatre: theatre._id,
      screen: screenDoc._id,
      showDate,
      showTime: '06:00 PM',
      startTime: start,
      pricing: { classic: 150, premium: 250, vip: 400 },
      occupiedSeats: ['A1', 'C3']
    });
  });

  test('GET /api/shows/:id - Should return show with detailed seat layout and accurate occupancy status', async () => {
    const res = await request(app).get(`/api/shows/${showDoc._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.show.occupiedSeats).toEqual(expect.arrayContaining(['A1', 'C3']));

    const vipTier = res.body.show.layoutMatrix.find((t) => t.tierName === 'VIP');
    expect(vipTier).toBeDefined();

    const seatA1 = vipTier.rows[0].seats.find((s) => s.seatId === 'A1');
    expect(seatA1.status).toBe('BOOKED');

    const seatA2 = vipTier.rows[0].seats.find((s) => s.seatId === 'A2');
    expect(seatA2.status).toBe('AVAILABLE');
  });

  test('POST /api/bookings/calculate-price - Should calculate correct prices on server', async () => {
    // Select 1 VIP (row A) and 1 Classic (row C)
    const res = await request(app)
      .post('/api/bookings/calculate-price')
      .send({
        showId: showDoc._id,
        seats: ['A2', 'C1']
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { pricing } = res.body;
    expect(pricing.seatCount).toBe(2);
    // Base amount: 400 (VIP) + 150 (Classic) = 550
    expect(pricing.baseAmount).toBe(550);
    // Convenience fee: 30 * 2 = 60
    expect(pricing.convenienceFee).toBe(60);
    // Tax: 18% of 60 = 11
    expect(pricing.taxAmount).toBe(11);
    // Total: 550 + 60 + 11 = 621
    expect(pricing.totalAmount).toBe(621);
  });

  test('GET /api/shows/:id - flags a screening that has already started', async () => {
    await Show.updateOne({ _id: showDoc._id }, { startTime: new Date(Date.now() - 1000) });
    const res = await request(app).get(`/api/shows/${showDoc._id}`);
    expect(res.status).toBe(200);
    expect(res.body.show.hasStarted).toBe(true);
  });

  test('POST /api/bookings/calculate-price - rejects a seat that is not on the screen', async () => {
    const res = await request(app)
      .post('/api/bookings/calculate-price')
      .send({ showId: showDoc._id, seats: ['A9'] }); // row A only has 6 seats
    expect(res.status).toBe(400);
  });

  test('GET /api/movies?q=( - special characters in search must not crash the API', async () => {
    const res = await request(app).get('/api/movies').query({ q: '(' });
    expect(res.status).toBe(200);
    expect(res.body.movies).toEqual([]);
  });

  test('GET /api/movies?city= - only lists films that have upcoming shows in that city', async () => {
    const mumbai = await request(app).get('/api/movies').query({ city: 'Mumbai' });
    expect(mumbai.body.movies.map((m) => m.title)).toContain('Interstellar');
    const chennai = await request(app).get('/api/movies').query({ city: 'Chennai' });
    expect(chennai.body.movies).toHaveLength(0);
  });
});
