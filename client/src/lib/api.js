import axios from 'axios';

export const TOKEN_KEY = 'studybuddy.token';
export const UNAUTHORIZED_EVENT = 'studybuddy:unauthorized';

const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

export const api = axios.create({
  baseURL: `${baseUrl}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// A failed login must not log the visitor out of anything else, so only
// authenticated requests clear the session on 401.
const CREDENTIAL_PATHS = ['/auth/login', '/auth/register'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const path = error.config?.url || '';
    const isCredentialAttempt = CREDENTIAL_PATHS.some((item) => path.endsWith(item));

    if (status === 401 && !isCredentialAttempt) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.error?.message;

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  return fallback;
}
