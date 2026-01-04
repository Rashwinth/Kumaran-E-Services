export const CACHE_KEYS = {
  INVENTORY_RAW: "inventory_raw",
  CATEGORIES: "categories",
  SUBCATEGORIES: "subcategories",
  CUSTOMERS: "customers",
  PRODUCTS_FLAT: "products_flat",
};

export const TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  LONG: 60 * 60 * 1000, // 1 hour
};

export const setCache = (key, data, ttl) => {
  try {
    const entry = {
      data,
      expiry: Date.now() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (e) {
    console.error("Cache set error:", e);
  }
};

export const getCache = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const entry = JSON.parse(raw);
    if (Date.now() > entry.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch (e) {
    console.error("Cache get error:", e);
    return null;
  }
};

export const removeCache = (key) => {
  localStorage.removeItem(key);
};

export const clearAllCache = () => {
  Object.values(CACHE_KEYS).forEach((key) => localStorage.removeItem(key));
};
