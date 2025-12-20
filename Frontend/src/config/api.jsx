export const API_BASE = import.meta.env.VITE_BACKEND_BASE_URI;

export const API_ENDPOINTS = {
  HEALTH: `${API_BASE}/api/health`,
  AUTH: {
    LOGIN: `${API_BASE}/api/auth/login`,
    REFRESH: `${API_BASE}/api/auth/refresh`,
    LOGOUT: `${API_BASE}/api/auth/logout`,
    VERIFY_BRANCH: `${API_BASE}/api/auth/branches/verify`,
    REGISTER: `${API_BASE}/api/auth/register`,
  },
};
