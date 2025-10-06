// Centralized API base URL resolution
// Priority: env → same-host default
// For CRA, env var must start with REACT_APP_

const DEFAULT_API_PORT = Number(process.env.REACT_APP_API_PORT) || 4000;

// If REACT_APP_API_BASE_URL is set, use it as-is (e.g., http://192.168.1.10:4000)
export const API_BASE = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '')
  || `${window.location.protocol}//${window.location.hostname}:${DEFAULT_API_PORT}`;

export const apiUrl = (path = '') => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

export default API_BASE;

