import apiRequest from './api';

const toQuery = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'All') query.append(key, value);
  });
  const str = query.toString();
  return str ? `?${str}` : '';
};

export const movieService = {
  getMovies: (params = {}) => apiRequest(`/movies${toQuery(params)}`),
  getFeaturedMovies: () => apiRequest('/movies/featured'),
  getMovieById: (idOrSlug) => apiRequest(`/movies/${encodeURIComponent(idOrSlug)}`)
};
