// Single source of truth for environment-dependent settings.
// Values come from .env.development / .env.production (selected by Vite's --mode).

const DEFAULT_API_BASE_URLS = {
  development: 'http://localhost:5134/api',
  production: 'https://api.edusaz.com/api',
};

const mode = import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development';
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URLS[mode] || DEFAULT_API_BASE_URLS.production)
  .replace(/\/+$/, '');

export const env = {
  mode,
  isProduction: mode === 'production',
  isDevelopment: mode === 'development',
  apiBaseUrl,
  // Origin of the API server (without /api) — used to resolve relative upload paths.
  apiOrigin: apiBaseUrl.replace(/\/api$/, ''),
};

export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `${env.apiOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
};
