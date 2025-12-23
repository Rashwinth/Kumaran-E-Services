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
  SALES: `${API_BASE}/api/sales`,
  BRANCH_ACCOUNTS: `${API_BASE}/api/sales/accounts/my-branch`,
  BRANCH_INVENTORY: `${API_BASE}/api/sales/inventory/my-branch`,
  CUSTOMERS: `${API_BASE}/api/sales/customers`,
  CUSTOMER_SEARCH: `${API_BASE}/api/sales/customers/search`,
};
