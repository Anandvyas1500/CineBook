import apiRequest from './api';

export const bookingService = {
  calculatePrice: (showId, seats) =>
    apiRequest('/bookings/calculate-price', { method: 'POST', body: { showId, seats } }),

  createBooking: ({ showId, seats, paymentMethod, paymentDetails }) =>
    apiRequest('/bookings', { method: 'POST', body: { showId, seats, paymentMethod, paymentDetails } }),

  getMyBookings: () => apiRequest('/bookings/my'),
  getBookingByRef: (refOrId) => apiRequest(`/bookings/${encodeURIComponent(refOrId)}`),
  cancelBooking: (bookingId) => apiRequest(`/bookings/${bookingId}/cancel`, { method: 'PUT' }),
  getCancellationRules: () => apiRequest('/bookings/cancellation-rules')
};
