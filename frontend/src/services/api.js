import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
let API_BASE_URL = null;
let API_CONFIG_ERROR = null;

if (!configuredApiUrl) {
  API_CONFIG_ERROR =
    'API is not configured. Set VITE_API_URL to the backend API URL and rebuild the frontend.';
} else {
  try {
    const parsedUrl = new URL(configuredApiUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('The API URL must use HTTP or HTTPS.');
    }
    API_BASE_URL = configuredApiUrl.replace(/\/+$/, '');
  } catch (error) {
    API_CONFIG_ERROR =
      error.message === 'The API URL must use HTTP or HTTPS.'
        ? error.message
        : 'VITE_API_URL must be a valid absolute HTTP or HTTPS URL.';
  }
}

const api = axios.create({
  baseURL: API_BASE_URL ?? undefined,
});

api.interceptors.request.use((config) => {
  if (API_CONFIG_ERROR) {
    return Promise.reject(new Error(API_CONFIG_ERROR));
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { API_CONFIG_ERROR };
export default api;