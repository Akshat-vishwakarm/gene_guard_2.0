/**
 * GeneGuard API Configuration
 * Supports Render backend, Vercel frontend, and local development.
 */

export const getApiBase = () => {
  // Support VITE_API_URL (priority) and backward-compatible VITE_API_BASE_URL
  const customUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').trim();
  if (customUrl) {
    const clean = customUrl.replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }

  // Local development default (localhost, 127.0.0.1, or Vite dev server)
  if (
    import.meta.env.DEV ||
    (typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ) {
    return 'http://localhost:5000/api';
  }

  // Fallback for relative requests
  return '/api';
};

export const API_BASE = getApiBase();

// Root URL of backend service (without trailing /api)
export const BACKEND_ROOT_URL = API_BASE.endsWith('/api')
  ? API_BASE.slice(0, -4)
  : API_BASE;

export const CHATBOT_URL = (
  import.meta.env.VITE_CHATBOT_URL ||
  BACKEND_ROOT_URL ||
  ''
).replace(/\/+$/, '');
