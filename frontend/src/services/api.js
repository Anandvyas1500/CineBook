// Offline demo mode (no backend needed). Off by default - the real Express API is used.
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Single entry point for every API call.
 * - Real mode: fetch() against the Express backend, with auth header + friendly errors.
 * - Mock mode: routed to an in-browser simulation (loaded lazily, never shipped in normal builds' hot path).
 */
export async function apiRequest(endpoint, { method = 'GET', body, headers = {} } = {}) {
  if (USE_MOCK_API) {
    const { mockRequest } = await import('./mockRouter');
    return mockRequest(endpoint, { method, body });
  }

  const token = localStorage.getItem('cinebook_token');
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  };
  if (body) config.body = JSON.stringify(body);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  } catch {
    const error = new Error('Cannot reach the CineBook server. Please check your connection or make sure the backend is running.');
    error.status = 503;
    throw error;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Expired / invalid token on a call that was authenticated -> sign the user out everywhere
    if (response.status === 401 && token) {
      localStorage.removeItem('cinebook_token');
      localStorage.removeItem('cinebook_user');
      window.dispatchEvent(new CustomEvent('cinebook:unauthorized'));
    }

    let message = data.message;
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      message = data.errors.map((e) => e.msg || e.message).join('. ');
    } else if (!message) {
      message = `Request failed with status ${response.status}`;
    }

    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export default apiRequest;
