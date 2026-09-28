/**
 * GeneGuard API Configuration
 * Supports local development, custom backend environments, and Vercel cloud deployment.
 */

export const getApiBase = () => {
  // Support both VITE_API_BASE_URL and VITE_API_URL (e.g. from Vercel / Render project settings)
  const customUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').trim();
  if (customUrl) {
    const clean = customUrl.replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }

  // Local development default
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }

  // Production relative fallback (routed via vercel.json rewrites)
  return '/api';
};

export const API_BASE = getApiBase();

export const CHATBOT_URL = (import.meta.env.VITE_CHATBOT_URL || '').replace(/\/+$/, '');
