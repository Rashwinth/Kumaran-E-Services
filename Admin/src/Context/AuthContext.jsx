import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const API_URL = `${import.meta.env.VITE_BACKEND_BASE_URI}/api`;

  // Get refresh token from localStorage
  const getRefreshToken = () => {
    return localStorage.getItem("refreshToken");
  };

  // Save refresh token to localStorage
  const saveRefreshToken = (token) => {
    localStorage.setItem("refreshToken", token);
  };

  // Remove refresh token from localStorage
  const removeRefreshToken = () => {
    localStorage.removeItem("refreshToken");
  };

  // Clear auth state
  const clearAuthState = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
    removeRefreshToken();
  }, []);

  // Refresh access token using refresh token
  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken,
      });

      if (response.data.success) {
        setAccessToken(response.data.accessToken);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response.data.accessToken;
      } else {
        throw new Error("Token refresh failed");
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      clearAuthState();
      throw error;
    }
  }, [API_URL, clearAuthState]);

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        try {
          console.log("🔄 Attempting to restore session...");
          await refreshAccessToken();
          console.log("✅ Session restored successfully");
          setLoading(false); // Set loading false AFTER successful restoration
        } catch (error) {
          console.error("❌ Auto-login failed:", error);
          clearAuthState();
          setLoading(false); // Set loading false AFTER clearing state
        }
      } else {
        console.log("ℹ️ No refresh token found");
        setLoading(false); // Set loading false when no token exists
      }
    };

    initAuth();
  }, [refreshAccessToken, clearAuthState]);

  // Axios interceptor to add token to requests
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (accessToken && config.url?.startsWith(API_URL)) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retried, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, API_URL, refreshAccessToken]);

  // Login function
  const login = async (identifier, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        identifier,
        password,
        portal: "admin", // Specify this is the admin portal
      });

      if (response.data.success) {
        setAccessToken(response.data.accessToken);
        setUser(response.data.user);
        setIsAuthenticated(true);
        saveRefreshToken(response.data.refreshToken);

        return { success: true };
      } else {
        return {
          success: false,
          message: response.data.message || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);

      if (response.data.success) {
        setAccessToken(response.data.accessToken);
        setUser(response.data.user);
        setIsAuthenticated(true);
        saveRefreshToken(response.data.refreshToken);

        return { success: true };
      } else {
        return {
          success: false,
          message: response.data.message || "Registration failed",
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (accessToken) {
        await axios.post(
          `${API_URL}/auth/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthState();
    }
  };

  // Update password function
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.put(
        `${API_URL}/auth/updatepassword`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.data.success) {
        setAccessToken(response.data.accessToken);
        saveRefreshToken(response.data.refreshToken);

        return { success: true, message: "Password updated successfully" };
      }
    } catch (error) {
      console.error("Update password error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update password",
      };
    }
  };

  const value = {
    user,
    accessToken,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updatePassword,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
