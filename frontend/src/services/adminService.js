import apiRequest from './api';

export const adminService = {
  getStats: () => apiRequest('/admin/stats'),

  createMovie: (data) => apiRequest('/admin/movies', { method: 'POST', body: data }),
  updateMovie: (id, data) => apiRequest(`/admin/movies/${id}`, { method: 'PUT', body: data }),
  deleteMovie: (id) => apiRequest(`/admin/movies/${id}`, { method: 'DELETE' }),

  createTheatre: (data) => apiRequest('/admin/theatres', { method: 'POST', body: data }),
  createScreen: (data) => apiRequest('/admin/screens', { method: 'POST', body: data }),

  createShow: (data) => apiRequest('/admin/shows', { method: 'POST', body: data }),
  deleteShow: (id) => apiRequest(`/admin/shows/${id}`, { method: 'DELETE' }),

  getAllBookings: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.limit) query.append('limit', params.limit);
    const str = query.toString();
    return apiRequest(`/admin/bookings${str ? `?${str}` : ''}`);
  },

  // City management
  getCities: () => apiRequest('/cities'),
  createCity: (data) => apiRequest('/admin/cities', { method: 'POST', body: data }),
  updateCity: (id, data) => apiRequest(`/admin/cities/${id}`, { method: 'PUT', body: data }),
  deleteCity: (id) => apiRequest(`/admin/cities/${id}`, { method: 'DELETE' })
};

