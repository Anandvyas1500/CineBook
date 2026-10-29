import { toLocalDateStr } from '../utils/format';
import {
  MOCK_CITIES,
  MOCK_MOVIES,
  MOCK_THEATRES,
  MOCK_SHOWS,
  generateMockLayout
} from './mockData';

// Local storage keys for mock persistence
const STORAGE_USERS_KEY = 'cinebook_mock_users';
const STORAGE_BOOKINGS_KEY = 'cinebook_mock_bookings';
const STORAGE_MOVIES_KEY = 'cinebook_mock_movies';
const STORAGE_THEATRES_KEY = 'cinebook_mock_theatres';
const STORAGE_SHOWS_KEY = 'cinebook_mock_shows';
const STORAGE_CITIES_KEY = 'cinebook_mock_cities';

// Initialize default mock users in localStorage
function getStoredUsers() {
  const data = localStorage.getItem(STORAGE_USERS_KEY);
  if (data) return JSON.parse(data);
  const defaultUsers = [
    {
      id: 'usr-admin',
      name: 'CineBook Admin',
      email: 'admin@cinebook.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91 9876543210'
    },
    {
      id: 'usr-1',
      name: 'Rahul Sharma',
      email: 'user@cinebook.com',
      password: 'User@123',
      role: 'user',
      phone: '+91 9123456780'
    }
  ];
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
}

function getStoredMovies() {
  const data = localStorage.getItem(STORAGE_MOVIES_KEY);
  if (data) return JSON.parse(data);
  localStorage.setItem(STORAGE_MOVIES_KEY, JSON.stringify(MOCK_MOVIES));
  return MOCK_MOVIES;
}

function getStoredTheatres() {
  const data = localStorage.getItem(STORAGE_THEATRES_KEY);
  if (data) return JSON.parse(data);
  localStorage.setItem(STORAGE_THEATRES_KEY, JSON.stringify(MOCK_THEATRES));
  return MOCK_THEATRES;
}

function getStoredShows() {
  const data = localStorage.getItem(STORAGE_SHOWS_KEY);
  if (data) return JSON.parse(data);
  localStorage.setItem(STORAGE_SHOWS_KEY, JSON.stringify(MOCK_SHOWS));
  return MOCK_SHOWS;
}

function getStoredBookings() {
  const data = localStorage.getItem(STORAGE_BOOKINGS_KEY);
  if (data) return JSON.parse(data);
  const initialBookings = [
    {
      _id: 'bk-demo-1',
      bookingReference: 'CNB-IMAX-9281',
      user: 'usr-1',
      movieSnapshot: {
        title: 'Dune: Part Two',
        posterUrl: 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
        certificate: 'UA',
        format: 'IMAX 3D',
        language: 'English'
      },
      theatreSnapshot: {
        name: 'PVR ICON Infinity Mall',
        city: 'Mumbai',
        screenName: 'Screen 1 - IMAX Laser'
      },
      showSnapshot: {
        showDate: toLocalDateStr(),
        showTime: '01:30 PM'
      },
      seats: [
        { seatId: 'A3', tier: 'VIP', price: 450 },
        { seatId: 'A4', tier: 'VIP', price: 450 }
      ],
      seatCount: 2,
      baseAmount: 900,
      convenienceFee: 60,
      taxAmount: 11,
      totalAmount: 971,
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PAID',
      qrCodeData: JSON.stringify({ ref: 'CNB-IMAX-9281', seats: ['A3', 'A4'] }),
      createdAt: new Date().toISOString()
    }
  ];
  localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(initialBookings));
  return initialBookings;
}

// Simulated network latency
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  getCancellationRules: async () => {
    await delay(50);
    return {
      success: true,
      rules: {
        cutoffDescription: 'Tickets may be cancelled before the scheduled screening start time.',
        refundPolicy: '100% of the base ticket amount is refunded to original payment method.',
        convenienceFeePolicy: 'Convenience fees and taxes are non-refundable per ticketing policy.',
        seatRelease: 'Occupied seats are instantly returned to public auditorium inventory.',
        mode: 'Self-service cancellation supported directly through My Bookings.'
      }
    };
  },

  getShowAvailability: async (id) => {
    const { show } = await mockApi.getShowById(id);
    const occupied = show.occupiedSeats || [];
    return { success: true, showId: id, occupiedSeats: occupied, totalSeats: 120, availableCount: 120 - occupied.length };
  },

  updateMovie: async (id, data) => {
    await delay();
    const movies = getStoredMovies();
    const idx = movies.findIndex((m) => m._id === id);
    if (idx === -1) throw new Error('Movie not found');
    movies[idx] = { ...movies[idx], ...data };
    localStorage.setItem(STORAGE_MOVIES_KEY, JSON.stringify(movies));
    return { success: true, movie: movies[idx] };
  },

  // Auth
  login: async (email, password) => {
    await delay();
    const users = getStoredUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      throw new Error('Invalid email or password.');
    }
    const token = `mock_jwt_token_${found.id}_${Date.now()}`;
    return {
      success: true,
      token,
      user: {
        id: found.id,
        name: found.name,
        email: found.email,
        role: found.role,
        phone: found.phone
      }
    };
  },

  register: async ({ name, email, password, phone }) => {
    await delay();
    const users = getStoredUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email address already exists.');
    }
    const newUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      password,
      role: 'user',
      phone: phone || ''
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    const token = `mock_jwt_token_${newUser.id}_${Date.now()}`;
    return {
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone
      }
    };
  },

  getMe: async () => {
    await delay();
    const storedUser = localStorage.getItem('cinebook_user');
    if (!storedUser) throw new Error('Not authenticated');
    return { success: true, user: JSON.parse(storedUser) };
  },

  updateProfile: async ({ name, phone }) => {
    await delay();
    const storedUser = JSON.parse(localStorage.getItem('cinebook_user') || '{}');
    storedUser.name = name || storedUser.name;
    storedUser.phone = phone !== undefined ? phone : storedUser.phone;
    localStorage.setItem('cinebook_user', JSON.stringify(storedUser));
    return { success: true, user: storedUser };
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    await delay();
    return { success: true, message: 'Password changed successfully' };
  },

  // Movies
  getMovies: async (params = {}) => {
    await delay();
    let list = [...getStoredMovies()];
    if (params.q) {
      const q = params.q.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.synopsis.toLowerCase().includes(q) ||
          m.director?.toLowerCase().includes(q)
      );
    }
    if (params.genre && params.genre !== 'All') {
      list = list.filter((m) =>
        m.genre.some((g) => g.toLowerCase() === params.genre.toLowerCase())
      );
    }
    if (params.language && params.language !== 'All') {
      list = list.filter((m) =>
        m.language.some((l) => l.toLowerCase() === params.language.toLowerCase())
      );
    }
    if (params.format && params.format !== 'All') {
      list = list.filter((m) =>
        m.formats.some((f) => f.toLowerCase().includes(params.format.toLowerCase()))
      );
    }
    if (params.sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    if (params.sort === 'title') list.sort((a, b) => a.title.localeCompare(b.title));
    return { success: true, count: list.length, movies: list };
  },

  getFeaturedMovies: async () => {
    await delay();
    const movies = getStoredMovies();
    return { success: true, movies: movies.filter((m) => m.isFeatured).slice(0, 5) };
  },

  getMovieById: async (idOrSlug) => {
    await delay();
    const movies = getStoredMovies();
    const movie = movies.find(
      (m) => m._id === idOrSlug || m.slug === idOrSlug.toLowerCase()
    );
    if (!movie) throw new Error('Movie not found');
    return { success: true, movie };
  },

  // Theatres & Cities
  getCities: async () => {
    await delay();
    const data = localStorage.getItem(STORAGE_CITIES_KEY);
    let stored = data ? JSON.parse(data) : [];
    if (!stored || stored.length === 0) {
      stored = MOCK_CITIES.map((c) => ({
        ...c,
        _id: `city-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        state: '',
        isActive: true
      }));
      localStorage.setItem(STORAGE_CITIES_KEY, JSON.stringify(stored));
    }

    // Dynamic theatre count calculation
    const theatres = getStoredTheatres();
    const counts = {};
    theatres.forEach((t) => {
      if (t.city && t.isActive !== false) {
        const k = t.city.trim().toLowerCase();
        counts[k] = (counts[k] || 0) + 1;
      }
    });

    // Auto-register any cities that have theatres
    const nameMap = new Map();
    stored.forEach((c) => nameMap.set(c.name.toLowerCase(), c));
    theatres.forEach((t) => {
      if (t.city && !nameMap.has(t.city.toLowerCase())) {
        const item = {
          _id: `city-${t.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          name: t.city,
          slug: t.city.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          state: '',
          theatresCount: 0,
          isActive: true
        };
        stored.push(item);
        nameMap.set(t.city.toLowerCase(), item);
      }
    });

    const active = stored
      .filter((c) => c.isActive !== false)
      .map((c) => ({
        ...c,
        theatresCount: counts[c.name.trim().toLowerCase()] || 0
      }));

    return { success: true, cities: active.map((c) => c.name), cityDetails: active };
  },

  createCity: async ({ name, state = '' }) => {
    await delay();
    const data = localStorage.getItem(STORAGE_CITIES_KEY);
    let stored = data ? JSON.parse(data) : [];
    if (!stored || stored.length === 0) {
      stored = MOCK_CITIES.map((c) => ({
        ...c,
        _id: `city-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        state: '',
        isActive: true
      }));
    }
    const trimmed = name.trim();
    const existing = stored.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      if (existing.isActive === false) {
        existing.isActive = true;
        if (state) existing.state = state.trim();
        localStorage.setItem(STORAGE_CITIES_KEY, JSON.stringify(stored));
        return { success: true, message: 'City reactivated successfully', city: existing };
      }
      throw new Error(`City "${trimmed}" already exists`);
    }
    const city = {
      _id: `city-${Date.now()}`,
      name: trimmed,
      slug: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      state: state.trim(),
      theatresCount: 0,
      isActive: true
    };
    stored.push(city);
    localStorage.setItem(STORAGE_CITIES_KEY, JSON.stringify(stored));
    return { success: true, message: 'City added successfully', city };
  },

  updateCity: async (id, updates) => {
    await delay();
    const data = localStorage.getItem(STORAGE_CITIES_KEY);
    const stored = data ? JSON.parse(data) : [];
    const idx = stored.findIndex((c) => c._id === id);
    if (idx === -1) throw new Error('City not found');
    stored[idx] = { ...stored[idx], ...updates };
    localStorage.setItem(STORAGE_CITIES_KEY, JSON.stringify(stored));
    return { success: true, message: 'City updated', city: stored[idx] };
  },

  deleteCity: async (id) => {
    await delay();
    const data = localStorage.getItem(STORAGE_CITIES_KEY);
    const stored = data ? JSON.parse(data) : [];
    const idx = stored.findIndex((c) => c._id === id);
    if (idx === -1) throw new Error('City not found');
    stored[idx].isActive = false;
    localStorage.setItem(STORAGE_CITIES_KEY, JSON.stringify(stored));
    return { success: true, message: 'City deactivated' };
  },

  getTheatres: async (city) => {
    await delay();
    let theatres = getStoredTheatres();
    if (city && city !== 'All') {
      theatres = theatres.filter((t) => t.city.toLowerCase() === city.toLowerCase());
    }
    return { success: true, theatres };
  },

  getTheatreById: async (id) => {
    await delay();
    const theatres = getStoredTheatres();
    const theatre = theatres.find((t) => t._id === id);
    if (!theatre) throw new Error('Theatre not found');
    return {
      success: true,
      theatre,
      screens: [
        { _id: 'scr-1', name: 'Screen 1 - IMAX Laser', screenType: 'IMAX', totalSeats: 120 },
        { _id: 'scr-2', name: 'Screen 2 - Atmos Gold', screenType: 'Standard', totalSeats: 120 }
      ]
    };
  },

  // Shows
  getShows: async ({ movieId, theatreId, city, date } = {}) => {
    await delay();
    const allShows = getStoredShows();
    const allTheatres = getStoredTheatres();
    const allMovies = getStoredMovies();

    // Map relationships
    let filtered = allShows.map((s) => {
      const movie = allMovies.find((m) => m._id === s.movieId) || s.movie;
      const theatre = allTheatres.find((t) => t._id === s.theatreId) || s.theatre;
      return { ...s, movie, theatre };
    });

    if (movieId) {
      filtered = filtered.filter((s) => s.movieId === movieId || s.movie?._id === movieId);
    }
    if (city && city !== 'All') {
      filtered = filtered.filter(
        (s) => s.theatre?.city?.toLowerCase() === city.toLowerCase()
      );
    }

    // Group by theatre
    const groupedMap = new Map();
    for (const show of filtered) {
      if (!show.theatre) continue;
      const tId = show.theatre._id;
      if (!groupedMap.has(tId)) {
        groupedMap.set(tId, { theatre: show.theatre, shows: [] });
      }
      groupedMap.get(tId).shows.push({
        _id: show._id,
        showTime: show.showTime,
        showDate: show.showDate || date,
        format: show.format,
        language: show.language,
        pricing: show.pricing,
        screenName: show.screen?.name || 'Screen 1',
        availabilityStatus: 'AVAILABLE'
      });
    }

    return {
      success: true,
      shows: filtered,
      groupedShows: Array.from(groupedMap.values())
    };
  },

  getShowById: async (id) => {
    await delay();
    const allShows = getStoredShows();
    const allTheatres = getStoredTheatres();
    const allMovies = getStoredMovies();

    const show = allShows.find((s) => s._id === id);
    if (!show) throw new Error('Show not found or inactive');
    const movie = allMovies.find((m) => m._id === show.movieId) || show.movie;
    const theatre = allTheatres.find((t) => t._id === show.theatreId) || show.theatre;

    return {
      success: true,
      show: {
        ...show,
        movie,
        theatre,
        layoutMatrix: show.layoutMatrix || generateMockLayout(show.occupiedSeats || [])
      }
    };
  },

  // Bookings & Price Calculation
  calculatePrice: async (showId, seats) => {
    await delay(50);
    const seatBreakdown = seats.map((seatId) => {
      const rowChar = seatId.replace(/[0-9]/g, '').toUpperCase();
      let tier = 'Classic';
      let price = 180;
      if (['A', 'B'].includes(rowChar)) {
        tier = 'VIP';
        price = 450;
      } else if (['C', 'D', 'E', 'F'].includes(rowChar)) {
        tier = 'Premium';
        price = 280;
      }
      return { seatId, tier, price };
    });

    const baseAmount = seatBreakdown.reduce((acc, s) => acc + s.price, 0);
    const convenienceFee = seats.length * 30;
    const taxAmount = Math.round(convenienceFee * 0.18);
    const totalAmount = baseAmount + convenienceFee + taxAmount;

    return {
      success: true,
      pricing: {
        seatCount: seats.length,
        seats: seatBreakdown,
        baseAmount,
        convenienceFee,
        taxAmount,
        totalAmount,
        currency: 'INR'
      }
    };
  },

  createBooking: async ({ showId, seats, paymentMethod }) => {
    await delay(300);
    const shows = getStoredShows();
    const show = shows.find((s) => s._id === showId) || shows[0];

    // Check if any seat is already booked
    const occupied = show.occupiedSeats || [];
    const conflict = seats.find((s) => occupied.includes(s));
    if (conflict) {
      throw new Error(`Seat ${conflict} was just booked by another user. Please choose another seat.`);
    }

    // Add seats to show occupied list
    show.occupiedSeats = [...occupied, ...seats];
    localStorage.setItem(STORAGE_SHOWS_KEY, JSON.stringify(shows));

    // Calculate price
    const { pricing } = await mockApi.calculatePrice(showId, seats);

    const bookingRef = `CNB-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const userStr = localStorage.getItem('cinebook_user');
    const user = userStr ? JSON.parse(userStr) : { id: 'usr-guest', name: 'Guest User' };

    const newBooking = {
      _id: `bk-${Date.now()}`,
      bookingReference: bookingRef,
      user: user.id || 'usr-1',
      movieSnapshot: {
        title: show.movie?.title || 'Dune: Part Two',
        posterUrl: show.movie?.posterUrl || 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
        certificate: show.movie?.certificate || 'UA',
        format: show.format || 'IMAX 3D',
        language: show.language || 'English'
      },
      theatreSnapshot: {
        name: show.theatre?.name || 'PVR ICON Infinity Mall',
        city: show.theatre?.city || 'Mumbai',
        screenName: show.screen?.name || 'Screen 1 - IMAX Laser'
      },
      showSnapshot: {
        showDate: show.showDate || toLocalDateStr(),
        showTime: show.showTime || '10:00 AM'
      },
      seats: pricing.seats,
      seatCount: pricing.seatCount,
      baseAmount: pricing.baseAmount,
      convenienceFee: pricing.convenienceFee,
      taxAmount: pricing.taxAmount,
      totalAmount: pricing.totalAmount,
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PAID',
      qrCodeData: JSON.stringify({ ref: bookingRef, seats }),
      createdAt: new Date().toISOString()
    };

    const bookings = getStoredBookings();
    bookings.unshift(newBooking);
    localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(bookings));

    return {
      success: true,
      message: 'Booking confirmed successfully!',
      booking: newBooking
    };
  },

  getMyBookings: async () => {
    await delay();
    const bookings = getStoredBookings();
    return { success: true, count: bookings.length, bookings };
  },

  getBookingByRef: async (refOrId) => {
    await delay();
    const bookings = getStoredBookings();
    const booking = bookings.find(
      (b) => b._id === refOrId || b.bookingReference === refOrId.toUpperCase()
    );
    if (!booking) throw new Error('Booking not found');
    return { success: true, booking };
  },

  cancelBooking: async (bookingId) => {
    await delay();
    const bookings = getStoredBookings();
    const booking = bookings.find((b) => b._id === bookingId);
    if (!booking) throw new Error('Booking not found');

    if (booking.bookingStatus === 'CANCELLED') throw new Error('This booking is already cancelled.');
    booking.bookingStatus = 'CANCELLED';
    booking.paymentStatus = 'REFUNDED';
    booking.refundAmount = booking.baseAmount;
    localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(bookings));

    return { success: true, booking };
  },

  // Admin
  getStats: async () => {
    await delay();
    const bookings = getStoredBookings();
    const movies = getStoredMovies();
    const theatres = getStoredTheatres();
    const confirmed = bookings.filter((b) => b.bookingStatus === 'CONFIRMED');
    const totalRevenue = confirmed.reduce((acc, b) => acc + (b.totalAmount || 0), 0);

    return {
      success: true,
      stats: {
        totalBookings: bookings.length,
        confirmedBookings: confirmed.length,
        totalMovies: movies.length,
        totalTheatres: theatres.length,
        totalScreens: theatres.length * 2,
        totalRevenue,
        recentBookings: bookings.slice(0, 10)
      }
    };
  },

  createMovie: async (movieData) => {
    await delay();
    const movies = getStoredMovies();
    const newMovie = {
      _id: `mov-${Date.now()}`,
      slug: movieData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      isActive: true,
      ...movieData
    };
    movies.unshift(newMovie);
    localStorage.setItem(STORAGE_MOVIES_KEY, JSON.stringify(movies));
    return { success: true, movie: newMovie };
  },

  deleteMovie: async (id) => {
    await delay();
    const movies = getStoredMovies();
    const updated = movies.filter((m) => m._id !== id);
    localStorage.setItem(STORAGE_MOVIES_KEY, JSON.stringify(updated));
    return { success: true, message: 'Movie deleted' };
  },

  createTheatre: async (theatreData) => {
    await delay();
    const theatres = getStoredTheatres();
    const newTheatre = {
      _id: `th-${Date.now()}`,
      isActive: true,
      ...theatreData
    };
    theatres.push(newTheatre);
    localStorage.setItem(STORAGE_THEATRES_KEY, JSON.stringify(theatres));

    // Also auto-ensure the city exists in stored cities
    if (theatreData.city) {
      const data = localStorage.getItem(STORAGE_CITIES_KEY);
      const stored = data ? JSON.parse(data) : [];
      if (!stored.some((c) => c.name.toLowerCase() === theatreData.city.trim().toLowerCase())) {
        stored.push({
          _id: `city-${theatreData.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          name: theatreData.city.trim(),
          slug: theatreData.city.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          state: '',
          theatresCount: 1,
          isActive: true
        });
        localStorage.setItem(STORAGE_CITIES_KEY, JSON.stringify(stored));
      }
    }

    return { success: true, theatre: newTheatre };
  },

  createScreen: async (screenData) => {
    await delay();
    return { success: true, screen: { _id: `scr-${Date.now()}`, ...screenData } };
  },

  createShow: async (showData) => {
    await delay();
    const shows = getStoredShows();
    const newShow = {
      _id: `sh-${Date.now()}`,
      ...showData,
      occupiedSeats: [],
      layoutMatrix: generateMockLayout([])
    };
    shows.unshift(newShow);
    localStorage.setItem(STORAGE_SHOWS_KEY, JSON.stringify(shows));
    return { success: true, show: newShow };
  },

  deleteShow: async (id) => {
    await delay();
    return { success: true, message: 'Show cancelled' };
  },

  getAllBookings: async () => {
    await delay();
    const bookings = getStoredBookings();
    return { success: true, count: bookings.length, bookings };
  }
};
