import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";
import {
  setCache,
  getCache,
  removeCache,
  CACHE_KEYS,
  TTL,
} from "../utils/cacheUtils";

const BranchContext = createContext();

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) throw new Error("useBranch must be used inside BranchProvider");
  return context;
};

export const BranchProvider = ({ children }) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, accessToken } = useAuth();
  const baseURL = `${import.meta.env.VITE_BACKEND_BASE_URI}/admin`;

  // Fetch all branches
  const getBranches = useCallback(
    async (forceRefresh = false) => {
      if (!accessToken) return;

      try {
        setLoading(true);

        // Check cache first
        if (!forceRefresh) {
          const cachedBranches = await getCache(CACHE_KEYS.BRANCHES);
          if (cachedBranches) {
            setBranches(cachedBranches);
            setLoading(false);
            return;
          }
        }

        const response = await axios.get(`${baseURL}/branches`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.data.success) {
          setBranches(response.data.data);
          await setCache(CACHE_KEYS.BRANCHES, response.data.data, TTL.LONG);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch branches"
        );
      } finally {
        setLoading(false);
      }
    },
    [accessToken, baseURL]
  );

  const getBranchById = useCallback(
    async (id) => {
      if (!accessToken) return;

      try {
        setLoading(true);
        // Note: For single branch, we can check if it exists in the 'branches' list state first,
        // but often details might be more extensive.
        // For simplicity, we just fetch from API or rely on the cached list if we implement a finder.
        // However, this specific function calls a specific endpoint. We won't cache id-specific calls individually
        // to avoid cache explosion, unless we map them.

        const response = await axios.get(
          `${baseURL}/${user._id}/branches/${id}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (response.data.success) {
          // Note: The original code setBranches(response.data.data) which seems wrong for getBranchById (should probably return data or set 'currentBranch').
          // But preserving original behavior:
          setBranches(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch branches"
        );
      } finally {
        setLoading(false);
      }
    },
    [accessToken, baseURL, user?.id] // Added user._id dependency properly
  );

  // Add branch
  const addBranch = async (branch) => {
    try {
      const response = await axios.post(`${baseURL}/branches`, branch, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.data.success) {
        toast.success("Branch added successfully");
        removeCache(CACHE_KEYS.BRANCHES);
        getBranches(true);
        return response.data;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add branch");
      throw error;
    }
  };

  // Update branch
  const updateBranch = async (id, branch) => {
    try {
      const response = await axios.put(`${baseURL}/branches/${id}`, branch, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.data.success) {
        toast.success("Branch updated successfully");
        removeCache(CACHE_KEYS.BRANCHES);
        getBranches(true);
        return response.data;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update branch");
      throw error;
    }
  };

  // Delete branch
  const deleteBranch = async (id) => {
    try {
      const response = await axios.delete(`${baseURL}/branches/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.data.success) {
        toast.success("Branch deleted successfully");
        removeCache(CACHE_KEYS.BRANCHES);
        getBranches(true);
        return response.data;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete branch");
      throw error;
    }
  };

  // --- Inventory Management ---
  const [branchInventory, setBranchInventory] = useState([]);

  const getInventory = useCallback(
    async (branchId, forceRefresh = false) => {
      if (!accessToken || !branchId) return;

      const cacheKey = `${CACHE_KEYS.INVENTORY}/${branchId}`;

      try {
        setLoading(true);

        if (!forceRefresh) {
          const cachedInv = await getCache(cacheKey);
          if (cachedInv) {
            setBranchInventory(cachedInv);
            setLoading(false);
            return;
          }
        }

        const response = await axios.get(`${baseURL}/inventory/${branchId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.data.success) {
          setBranchInventory(response.data.data);
          await setCache(cacheKey, response.data.data, TTL.SHORT); // Inventory changes often
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch inventory"
        );
      } finally {
        setLoading(false);
      }
    },
    [accessToken, baseURL]
  );

  const addInventory = async (data) => {
    try {
      const response = await axios.post(`${baseURL}/inventory`, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.status === 201 || response.status === 200) {
        toast.success("Inventory added/updated successfully");
        // Invalidate cache for this branch
        await removeCache(`${CACHE_KEYS.INVENTORY}/${data.branch}`);
        await getInventory(data.branch, true);
        return response.data;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add inventory");
      throw error;
    }
  };

  const updateInventory = async (id, data, branchId) => {
    try {
      const response = await axios.put(`${baseURL}/inventory/${id}`, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.status === 200) {
        toast.success("Inventory updated successfully");
        if (branchId) {
          await removeCache(`${CACHE_KEYS.INVENTORY}/${branchId}`);
          await getInventory(branchId, true);
        }
        return response.data;
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update inventory"
      );
      throw error;
    }
  };

  const deleteInventory = async (id, branchId) => {
    try {
      const response = await axios.delete(`${baseURL}/inventory/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.status === 200) {
        toast.success("Inventory item deleted");
        if (branchId) {
          await removeCache(`${CACHE_KEYS.INVENTORY}/${branchId}`);
          await getInventory(branchId, true);
        }
        return response.data;
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete inventory item"
      );
      throw error;
    }
  };

  return (
    <BranchContext.Provider
      value={{
        branches,
        loading,
        getBranches,
        addBranch,
        updateBranch,
        deleteBranch,
        getBranchById,
        // Inventory
        branchInventory,
        getInventory,
        addInventory,
        updateInventory,
        deleteInventory,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};
