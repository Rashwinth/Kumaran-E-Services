import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

const BranchContext = createContext();

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) throw new Error("useBranch must be used inside BranchProvider");
  return context;
};

export const BranchProvider = ({ children }) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseURL = `${import.meta.env.VITE_BACKEND_BASE_URI}/admin`;
  const { accessToken } = useAuth();

  // Fetch all branches
  const getBranches = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/branches`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.data.success) {
        setBranches(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error(error.response?.data?.message || "Failed to fetch branches");
    } finally {
      setLoading(false);
    }
  }, [accessToken, baseURL]);

  // Add branch
  const addBranch = async (branch) => {
    try {
      const response = await axios.post(`${baseURL}/branches`, branch, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.data.success) {
        toast.success("Branch added successfully");
        getBranches();
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
        getBranches();
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
        getBranches();
        return response.data;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete branch");
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
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};
