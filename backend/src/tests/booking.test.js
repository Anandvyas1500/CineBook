const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const { setupTestDB } = require('./setup');

setupTestDB();

// Dates are relative to "now" so the suite never rots
const DAY = 24 * 60 * 60 * 1000;
const futureStart = (days = 3) => {
  const d = new Date(Date.now() + days * DAY);
  d.setHours(20, 0, 0, 0);
  return d;
};
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

describe('Booking Service & Double-Booking Prevention Suite', () => {
  let token;
  let userId;
  let showDoc;

  beforeEach(async () => {
    // Create user
    const userRes = await request(app).post('/api/auth/register').send({
      name: 'Booking Tester',
      email: 'booker@test.com',
      password: 'Password123'
    });
    token = userRes.body.token;
    userId = userRes.body.user.id;

    // Create Movie, Theatre, Screen, Show
    const movie = await Movie.create({
      title: 'Dune: Part Two',
      synopsis: 'Desert epic.',
      posterUrl: 'https://example.com/dune.jpg',
      duration: 166
    });

    const theatre = await Theatre.create({
      name: 'INOX Megaplex',
      city: 'Mumbai',
      address: 'Inorbit Mall'
    });

    const screen = await Screen.create({
      theatre: theatre._id,
      screenNumber: 1,
      name: 'IMAX Screen',
      totalSeats: 30,
      layout: {
        tiers: [
          { name: 'VIP', rows: ['A'], seatsPerRow: 10 },
          { name: 'Premium', rows: ['B', 'C'], seatsPerRow: 10 }
        ]
      }
    });

    const start = futureStart(3);
    showDoc = await Show.create({
      movie: movie._id,
      theatre: theatre._id,
      screen: screen._id,
      showDate: ymd(start),
      showTime: '08:00 PM',
      startTime: start,
      pricing: { classic: 180, premium: 280, vip: 450 },
      occupiedSeats: ['A1'] // A1 is already booked
    });
  });

  test('POST /api/bookings - Should successfully book available seats and create ticket reference', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        showId: showDoc._id,
        seats: ['A2', 'A3'],
        paymentMethod: 'DEMO_UPI'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.bookingReference).toMatch(/^CNB-/);
    expect(res.body.booking.bookingStatus).toBe('CONFIRMED');
    expect(res.body.booking.paymentStatus).toBe('PAID');

    // Verify Show has seats marked occupied
    const updatedShow = await Show.findById(showDoc._id);
    expect(updatedShow.occupiedSeats).toContain('A2');
    expect(updatedShow.occupiedSeats).toContain('A3');
  });

  test('POST /api/bookings - Should reject booking if seat is already occupied (Double Booking Prevention)', async () => {
    // Attempt to book A1 which is already occupied
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        showId: showDoc._id,
        seats: ['A1', 'A4'],
        paymentMethod: 'DEMO_CARD'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already booked');

    // Ensure A4 was not left booked in partial state
    const showAfter = await Show.findById(showDoc._id);
    expect(showAfter.occupiedSeats).not.toContain('A4');
  });

  test('Concurrent Booking Simulation - Only one simultaneous booking can claim the same seat', async () => {
    // Second user
    const user2Res = await request(app).post('/api/auth/register').send({
      name: 'Rival Booker',
      email: 'rival@test.com',
      password: 'Password123'
    });
    const token2 = user2Res.body.token;

    // Both users concurrently attempt to book seat 'B5'
    const [res1, res2] = await Promise.all([
      request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({ showId: showDoc._id, seats: ['B5'], paymentMethod: 'DEMO_UPI' }),
      request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token2}`)
        .send({ showId: showDoc._id, seats: ['B5'], paymentMethod: 'DEMO_UPI' })
    ]);

    const statuses = [res1.status, res2.status].sort();
    // One must succeed (201) and the other must be rejected with conflict (409)
    expect(statuses).toEqual([201, 409]);

    // Check database has only one entry for B5
    const showFinal = await Show.findById(showDoc._id);
    const countB5 = showFinal.occupiedSeats.filter((s) => s === 'B5').length;
    expect(countB5).toBe(1);
  });

  test('PUT /api/bookings/:id/cancel - Should cancel booking and atomically release occupied seats', async () => {
    // First make a booking
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        showId: showDoc._id,
        seats: ['B1', 'B2'],
        paymentMethod: 'DEMO_UPI'
      });

    const bookingId = bookRes.body.booking._id;

    // Now cancel the booking
    const cancelRes = await request(app)
      .put(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${token}`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.booking.bookingStatus).toBe('CANCELLED');

    // Verify seats were released from Show
    const updatedShow = await Show.findById(showDoc._id);
    expect(updatedShow.occupiedSeats).not.toContain('B1');
    expect(updatedShow.occupiedSeats).not.toContain('B2');
  });

  test('GET /api/bookings/cancellation-rules - Should return official cinema cancellation policies', async () => {
    const res = await request(app).get('/api/bookings/cancellation-rules');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.rules).toBeDefined();
    expect(res.body.rules.refundPolicy).toBeDefined();
  });

  test('PUT /api/bookings/:id/cancel - Should reject cancellation once the screening has started', async () => {
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ showId: showDoc._id, seats: ['B8'], paymentMethod: 'DEMO_UPI' });
    const bookingId = bookRes.body.booking._id;

    // The show starts an hour ago
    await Show.updateOne({ _id: showDoc._id }, { startTime: new Date(Date.now() - 60 * 60 * 1000) });

    const cancelRes = await request(app)
      .put(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${token}`);

    expect(cancelRes.status).toBe(400);
    expect(cancelRes.body.success).toBe(false);
    expect(cancelRes.body.message).toContain('already started or passed');
  });

  test('POST /api/bookings - Should refuse to book a screening that already started', async () => {
    const pastShow = await Show.create({
      movie: showDoc.movie,
      theatre: showDoc.theatre,
      screen: showDoc.screen,
      showDate: '2020-01-01',
      showTime: '10:00 AM',
      startTime: new Date('2020-01-01T10:00:00Z'),
      pricing: { classic: 100, premium: 200, vip: 300 },
      occupiedSeats: []
    });

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ showId: pastShow._id, seats: ['B8'], paymentMethod: 'DEMO_UPI' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('already started or passed');
    const after = await Show.findById(pastShow._id);
    expect(after.occupiedSeats).toHaveLength(0);
  });

  test('POST /api/bookings - Should reject seats that do not exist on the screen', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ showId: showDoc._id, seats: ['Z99'], paymentMethod: 'DEMO_UPI' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid seat');
    const after = await Show.findById(showDoc._id);
    expect(after.occupiedSeats).not.toContain('Z99');
  });

  test('POST /api/bookings - A declined payment must release the locked seats', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        showId: showDoc._id,
        seats: ['B3'],
        paymentMethod: 'DEMO_CARD',
        paymentDetails: { simulateFailure: true }
      });

    expect(res.status).toBe(402);
    const after = await Show.findById(showDoc._id);
    expect(after.occupiedSeats).not.toContain('B3');
  });

  test('POST /api/bookings - Must reject card numbers / CVV in payment details', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        showId: showDoc._id,
        seats: ['B4'],
        paymentMethod: 'DEMO_CARD',
        paymentDetails: { cardNumber: '4111111111111111', cvv: '123' }
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('sensitive');
  });

  test('PUT /api/bookings/:id/cancel - Refunds the base amount only (fees are non-refundable)', async () => {
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ showId: showDoc._id, seats: ['B6'], paymentMethod: 'DEMO_UPI' });
    const booking = bookRes.body.booking;

    const cancelRes = await request(app)
      .put(`/api/bookings/${booking._id}/cancel`)
      .set('Authorization', `Bearer ${token}`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.booking.refundAmount).toBe(booking.baseAmount);

    // a second cancel must fail
    const again = await request(app)
      .put(`/api/bookings/${booking._id}/cancel`)
      .set('Authorization', `Bearer ${token}`);
    expect(again.status).toBe(400);
  });
});
