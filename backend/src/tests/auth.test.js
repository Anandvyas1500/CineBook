const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const { setupTestDB } = require('./setup');

setupTestDB();

describe('Authentication & Authorization Suite', () => {
  const testUser = {
    name: 'John Doe',
    email: 'johndoe@test.com',
    password: 'Password123'
  };

  test('POST /api/auth/register - Should register a new user with hashed password and return token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.password).toBeUndefined(); // Never expose password

    // Check DB record
    const userInDb = await User.findOne({ email: testUser.email }).select('+password');
    expect(userInDb).toBeDefined();
    expect(userInDb.password).not.toBe(testUser.password); // Verify hashed
  });

  test('POST /api/auth/register - Should reject duplicate email', async () => {
    await request(app).post('/api/auth/register').send(testUser);
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/login - Should login user and return JWT', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  test('POST /api/auth/login - Should reject invalid password', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me - Should protect route and return profile when token is provided', async () => {
    const regRes = await request(app).post('/api/auth/register').send(testUser);
    const token = regRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
  });

  test('GET /api/admin/stats - Should block regular user from admin route with 403', async () => {
    const regRes = await request(app).post('/api/auth/register').send(testUser);
    const token = regRes.body.token;

    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Access denied');
  });

  test('POST /api/auth/register - Accepts long TLDs and keeps dots in Gmail addresses', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Dotty', email: 'first.last@studio.media', password: 'Password123' });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('first.last@studio.media');

    const gmail = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Gee', email: 'jane.roe@gmail.com', password: 'Password123' });
    expect(gmail.body.user.email).toBe('jane.roe@gmail.com');
  });

  test('POST /api/auth/register - Rejects short passwords', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Short', email: 'short@test.com', password: 'abc12' });
    expect(res.status).toBe(400);
  });

  test('Users cannot escalate to admin through registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Sneaky', email: 'sneaky@test.com', password: 'Password123', role: 'admin' });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('user');
  });
});
