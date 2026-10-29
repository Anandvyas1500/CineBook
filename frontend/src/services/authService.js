import apiRequest from './api';

const persist = (data) => {
  if (data.token) {
    localStorage.setItem('cinebook_token', data.token);
    localStorage.setItem('cinebook_user', JSON.stringify(data.user));
  }
  return data;
};

export const authService = {
  login: async (email, password) =>
    persist(await apiRequest('/auth/login', { method: 'POST', body: { email, password } })),

  register: async ({ name, email, password, phone }) =>
    persist(await apiRequest('/auth/register', { method: 'POST', body: { name, email, password, phone } })),

  getMe: () => apiRequest('/auth/me'),

  updateProfile: (profileData) => apiRequest('/auth/profile', { method: 'PUT', body: profileData }),

  changePassword: ({ currentPassword, newPassword }) =>
    apiRequest('/auth/change-password', { method: 'PUT', body: { currentPassword, newPassword } }),

  logout: () => {
    localStorage.removeItem('cinebook_token');
    localStorage.removeItem('cinebook_user');
  }
};
