/**
 * Offline demo mode: maps REST-style requests onto the in-browser mock backend.
 * Only loaded (dynamically) when VITE_USE_MOCK_API=true.
 */
import { mockApi } from './mockApiAdapter';

const notFound = (endpoint) => {
  const err = new Error(`Mock API: no route for ${endpoint}`);
  err.status = 404;
  return err;
};

export async function mockRequest(endpoint, { method = 'GET', body = {} } = {}) {
  const url = new URL(endpoint, 'http://mock.local');
  const parts = url.pathname.replace(/^\/+|\/+$/g, '').split('/').map(decodeURIComponent);
  const q = Object.fromEntries(url.searchParams.entries());
  const [area, a, b] = parts;
  const key = `${method} ${area}${a ? '/:1' : ''}${b ? '/:2' : ''}`;

  switch (area) {
    case 'auth':
      if (method === 'POST' && a === 'login') return mockApi.login(body.email, body.password);
      if (method === 'POST' && a === 'register') return mockApi.register(body);
      if (method === 'GET' && a === 'me') return mockApi.getMe();
      if (method === 'PUT' && a === 'profile') return mockApi.updateProfile(body);
      if (method === 'PUT' && a === 'change-password') return mockApi.changePassword(body);
      break;
    case 'movies':
      if (!a) return mockApi.getMovies(q);
      if (a === 'featured') return mockApi.getFeaturedMovies();
      return mockApi.getMovieById(a);
    case 'theatres':
      if (a === 'cities') return mockApi.getCities();
      if (!a) return mockApi.getTheatres(q.city);
      return mockApi.getTheatreById(a);
    case 'cities':
      if (!a && method === 'GET') return mockApi.getCities();
      break;
    case 'shows':
      if (!a) return mockApi.getShows(q);
      if (b === 'availability') return mockApi.getShowAvailability(a);
      return mockApi.getShowById(a);
    case 'bookings':
      if (method === 'POST' && a === 'calculate-price') return mockApi.calculatePrice(body.showId, body.seats);
      if (method === 'POST' && !a) return mockApi.createBooking(body);
      if (a === 'my') return mockApi.getMyBookings();
      if (a === 'cancellation-rules') return mockApi.getCancellationRules();
      if (method === 'PUT' && b === 'cancel') return mockApi.cancelBooking(a);
      if (method === 'GET' && a) return mockApi.getBookingByRef(a);
      break;
    case 'admin':
      if (a === 'stats') return mockApi.getStats();
      if (a === 'bookings') return mockApi.getAllBookings();
      if (a === 'movies') {
        if (method === 'POST') return mockApi.createMovie(body);
        if (method === 'PUT') return mockApi.updateMovie(b, body);
        if (method === 'DELETE') return mockApi.deleteMovie(b);
      }
      if (a === 'theatres' && method === 'POST') return mockApi.createTheatre(body);
      if (a === 'screens' && method === 'POST') return mockApi.createScreen(body);
      if (a === 'shows') {
        if (method === 'POST') return mockApi.createShow(body);
        if (method === 'DELETE') return mockApi.deleteShow(b);
      }
      if (a === 'cities') {
        if (method === 'POST') return mockApi.createCity(body);
        if (method === 'PUT') return mockApi.updateCity(b, body);
        if (method === 'DELETE') return mockApi.deleteCity(b);
      }
      break;
    default:
  }
  throw notFound(`${key} (${endpoint})`);
}
