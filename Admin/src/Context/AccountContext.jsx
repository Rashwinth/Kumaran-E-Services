import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

const AccountContext = createContext();

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
};

export const AccountProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const baseURL = `${import.meta.env.VITE_BACKEND_BASE_URI}/admin`;
  const { accessToken } = useAuth();

  // Get all accounts
  const getAccounts = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/accounts`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.data.success) {
        setAccounts(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error(error.response?.data?.message || "Failed to fetch accounts");
      throw error; // Re-throw for component handling if needed
    } finally {
      setLoading(false);
    }
  }, [accessToken, baseURL]);

  // Get accounts by branch
  const getAccountsByBranch = useCallback(
    async (branchId) => {
      if (!accessToken) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `${baseURL}/accounts/branch/${branchId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (response.data.success) {
          // We might want to setAccounts here? Or just return data?
          // BranchAccountDetail likely uses this. Let's setAccounts to local state or just return.
          // BranchContext sets global state. Assuming BranchAccountDetail uses local state or global?
          // Let's set global accounts state to this branch's accounts since we are "viewing" them.
          setAccounts(response.data.data);
          return response.data.data;
        }
      } catch (error) {
        console.error("Error fetching branch accounts:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch branch accounts"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [accessToken, baseURL]
  );

  // Add account
  const addAccount = async (accountData) => {
    try {
      // Validate in frontend too
      if (accountData.type === "Upi" && !accountData.upiAccountName) {
        toast.error("UPI account name is required");
        throw new Error("UPI account name is required");
      }

      const response = await axios.post(`${baseURL}/accounts`, accountData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.data.success) {
        toast.success("Account added successfully");
        // Optimistic update or refetch? Refetch is safer pattern in BranchContext
        // But if we are in Branch View, we should refetch by branch?
        // If accountData contains branch ID, we can refetch by branch or append to state.
        // Let's append to state for now, assuming current view matches.
        setAccounts((prev) => [...prev, response.data.data]);
        return response.data.data;
      }
    } catch (error) {
      console.error("Error adding account:", error);
      toast.error(error.response?.data?.message || "Failed to add account");
      throw error;
    }
  };

  // Update account
  const updateAccount = async (id, accountData) => {
    try {
      if (accountData.type === "Upi" && !accountData.upiAccountName) {
        toast.error("UPI account name is required");
        throw new Error("UPI account name is required");
      }

      const response = await axios.put(
        `${baseURL}/accounts/${id}`,
        accountData,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.data.success) {
        toast.success("Account updated successfully");
        setAccounts((prev) =>
          prev.map((acc) => (acc._id === id ? response.data.data : acc))
        );
        return response.data.data;
      }
    } catch (error) {
      console.error("Error updating account:", error);
      toast.error(error.response?.data?.message || "Failed to update account");
      throw error;
    }
  };

  // Delete account
  const deleteAccount = async (id) => {
    try {
      const response = await axios.delete(`${baseURL}/accounts/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.data.success) {
        toast.success("Account deleted successfully");
        setAccounts((prev) => prev.filter((acc) => acc._id !== id));
        return true;
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(error.response?.data?.message || "Failed to delete account");
      throw error;
    }
  };

  // Add balance history
  const addBalanceHistory = async (id, balanceData) => {
    try {
      const response = await axios.post(
        `${baseURL}/accounts/${id}/balance`,
        balanceData,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.data.success) {
        toast.success("Balance history updated");
        setAccounts((prev) =>
          prev.map((acc) => (acc._id === id ? response.data.data : acc))
        );
        return response.data.data;
      }
    } catch (error) {
      console.error("Error adding balance:", error);
      toast.error(error.response?.data?.message || "Failed to update balance");
      throw error;
    }
  };

  return (
    <AccountContext.Provider
      value={{
        accounts, // This exposes the currently loaded accounts (either all or by branch)
        loading,
        getAccounts,
        getAccountsByBranch,
        addAccount,
        updateAccount,
        deleteAccount,
        addBalanceHistory,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
