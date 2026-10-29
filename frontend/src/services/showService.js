import apiRequest from './api';

export const showService = {
  getShows: ({ movieId, theatreId, city, date } = {}) => {
    const query = new URLSearchParams();
    if (movieId) query.append('movieId', movieId);
    if (theatreId) query.append('theatreId', theatreId);
    if (city && city !== 'All') query.append('city', city);
    if (date) query.append('date', date);
    const str = query.toString();
    return apiRequest(`/shows${str ? `?${str}` : ''}`);
  },
  getShowById: (id) => apiRequest(`/shows/${id}`),
  getSeatAvailability: (id) => apiRequest(`/shows/${id}/availability`)
};
