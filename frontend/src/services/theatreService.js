import apiRequest from './api';

export const theatreService = {
  // Fetches managed cities from the dedicated /cities endpoint.
  // Falls back to the legacy /theatres/cities endpoint if needed.
  getCities: () => apiRequest('/cities'),
  getTheatres: (city) =>
    apiRequest(`/theatres${city && city !== 'All' ? `?city=${encodeURIComponent(city)}` : ''}`),
  getTheatreById: (id) => apiRequest(`/theatres/${id}`)
};
