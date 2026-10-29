const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const City = require('../models/City');
const { moviesData, theatresData } = require('./seedData');
const config = require('../config/config');
const { cloneDefaultLayout } = require('../config/layout');
const { localDateString, buildShowStart } = require('../utils/helpers');

const SEED_DAYS = 6;
// Five slots ~3h15 apart, so films never overlap on a screen
const SHOW_SLOTS = ['09:30 AM', '12:45 PM', '04:00 PM', '07:15 PM', '10:30 PM'];

const clearDatabase = async () => {
  console.log('[CineBook Seeder] Clearing existing data...');
  await Promise.all([
    User.deleteMany(),
    Movie.deleteMany(),
    Theatre.deleteMany(),
    Screen.deleteMany(),
    Show.deleteMany(),
    Booking.deleteMany(),
    Payment.deleteMany(),
    City.deleteMany()
  ]);
};

const seedDB = async () => {
  try {
    await clearDatabase();

    console.log('[CineBook Seeder] Seeding default Admin and Demo User accounts...');
    await User.create({
      name: 'CineBook Admin',
      email: 'admin@cinebook.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91 9876543210'
    });
    await User.create({
      name: 'Rahul Sharma',
      email: 'user@cinebook.com',
      password: 'User@123',
      role: 'user',
      phone: '+91 9123456780'
    });

    console.log(`[CineBook Seeder] Seeding ${moviesData.length} movies...`);
    const insertedMovies = await Movie.insertMany(moviesData);

    console.log('[CineBook Seeder] Seeding cities...');
    const cityNames = [...new Set(theatresData.map((t) => t.city))];
    await City.insertMany(
      cityNames.map((name) => ({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        isActive: true
      }))
    );

    console.log('[CineBook Seeder] Seeding theatres, screens, and scheduling shows...');
    const insertedTheatres = await Theatre.insertMany(theatresData);

    // Today + the next days, in LOCAL time
    const dates = [];
    for (let i = 0; i < SEED_DAYS; i += 1) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(localDateString(d));
    }

    const scheduledShows = [];

    for (let tIdx = 0; tIdx < insertedTheatres.length; tIdx += 1) {
      const theatre = insertedTheatres[tIdx];

      const screens = await Screen.insertMany([
        {
          theatre: theatre._id,
          screenNumber: 1,
          name: 'Screen 1 - IMAX Laser',
          soundSystem: 'Dolby Atmos 7.1',
          screenType: 'IMAX',
          totalSeats: 120,
          layout: cloneDefaultLayout()
        },
        {
          theatre: theatre._id,
          screenNumber: 2,
          name: 'Screen 2 - Atmos Gold',
          soundSystem: 'Dolby Atmos 5.1',
          screenType: 'Standard',
          totalSeats: 120,
          layout: cloneDefaultLayout()
        }
      ]);

      // Each theatre plays 4 films; every screen alternates between its own 2 films across the day,
      // which guarantees no two shows ever share a screen + start time.
      const theatreMovies = Array.from(
        { length: 4 },
        (_, i) => insertedMovies[(tIdx + i) % insertedMovies.length]
      );

      for (const showDate of dates) {
        screens.forEach((screen, screenIdx) => {
          const pair = [theatreMovies[screenIdx * 2], theatreMovies[screenIdx * 2 + 1]];

          SHOW_SLOTS.forEach((showTime, slotIdx) => {
            const movie = pair[slotIdx % 2];
            const occupiedSeats = Math.random() > 0.4 ? ['C4', 'C5', 'D6', 'D7'] : [];

            scheduledShows.push({
              movie: movie._id,
              theatre: theatre._id,
              screen: screen._id,
              showDate,
              showTime,
              startTime: buildShowStart(showDate, showTime),
              format: movie.formats[0] || '2D',
              language: movie.language[0] || 'English',
              pricing: { classic: 180, premium: 280, vip: 450 },
              occupiedSeats
            });
          });
        });
      }
    }

    await Show.insertMany(scheduledShows);
    console.log(`[CineBook Seeder] Successfully scheduled ${scheduledShows.length} movie shows.`);

    console.log('\n======================================================');
    console.log('CineBook database seeded successfully!');
    console.log('Demo accounts:');
    console.log(' - Admin: admin@cinebook.com | Password: Admin@123');
    console.log(' - User:  user@cinebook.com  | Password: User@123');
    console.log('======================================================\n');
  } catch (error) {
    console.error('[CineBook Seeder] Error seeding database:', error);
    throw error;
  }
};

const autoSeedIfEmpty = async () => {
  const movieCount = await Movie.countDocuments();
  if (movieCount === 0) {
    console.log('[CineBook Seeder] Database is empty. Running initial seeding automatically...');
    await seedDB();
  } else {
    console.log(`[CineBook Seeder] Database already contains ${movieCount} movies. Skipping auto-seed.`);
  }
};

// If run directly from the CLI:  npm run seed   (add "-- --force" to wipe a production database)
if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/db');
  (async () => {
    try {
      if (config.nodeEnv === 'production' && !process.argv.includes('--force')) {
        console.error(
          '[CineBook Seeder] Refusing to wipe a production database. Re-run with --force if you really mean it.'
        );
        process.exit(1);
      }
      await connectDB();
      await seedDB();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}

module.exports = {
  seedDB,
  autoSeedIfEmpty
};
