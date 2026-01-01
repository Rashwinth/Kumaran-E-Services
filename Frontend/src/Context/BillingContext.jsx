import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import { useAuth } from "./AuthContext";

const BillingContext = createContext();

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error("useBilling must be used within a BillingProvider");
  }
  return context;
};

export const BillingProvider = ({ children }) => {
  const { accessToken, user } = useAuth();

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState({ products: 0, customers: 0 });

  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000;

  const fetchProducts = useCallback(
    async (force = false) => {
      if (!accessToken) return;

      // Check cache
      const now = Date.now();
      if (
        !force &&
        now - lastFetch.products < CACHE_DURATION &&
        products.length > 0
      ) {
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(API_ENDPOINTS.BRANCH_INVENTORY, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.data.success) {
          // Map inventory items to a flatter product structure for easier billing use
          const mappedProducts = res.data.data
            .filter((item) => item.product) // Safety: ensure product exists
            .map((item) => ({
              _id: item.product._id,
              name: item.product.name,
              sku: item.product.sku,
              price: item.FinalPrice, // Selling price
              mrp: item.product.mrp,
              costPrice: item.costPrice,
              sellingPrice: item.sellingPrice,
              gstType: item.product.gstType || "NotIncluded",
              gst: item.product.gst
                ? (item.product.gst.cgst || 0) + (item.product.gst.sgst || 0)
                : 0,
              availableQty: item.quantity,
              category: item.product.category?.name,
              lowStockThreshold: item.lowStockThreshold || 5,
              unit: item.product.unit || "pcs",
            }));
          setProducts(mappedProducts);
          setLastFetch((prev) => ({ ...prev, products: now }));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    },
    [
      accessToken,
      lastFetch.products,
      products.length,
      user?.branchCode,
      CACHE_DURATION,
    ]
  );

  const fetchCustomers = useCallback(
    async (force = false) => {
      if (!accessToken) return;

      const now = Date.now();
      if (
        !force &&
        now - lastFetch.customers < CACHE_DURATION &&
        customers.length > 0
      ) {
        return;
      }

      try {
        const res = await axios.get(API_ENDPOINTS.CUSTOMERS + "/my-branch", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.data.success) {
          setCustomers(res.data.data);
          setLastFetch((prev) => ({ ...prev, customers: now }));
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    },
    [
      accessToken,
      lastFetch.customers,
      customers.length,
      user?.branchCode,
      CACHE_DURATION,
    ]
  );

  // Periodic refresh
  useEffect(() => {
    if (accessToken) {
      fetchProducts();
      fetchCustomers();
    }
  }, [accessToken, fetchProducts, fetchCustomers]);

  const value = {
    products,
    customers,
    loading,
    refreshProducts: () => fetchProducts(true),
    refreshCustomers: () => fetchCustomers(true),
  };

  return (
    <BillingContext.Provider value={value}>{children}</BillingContext.Provider>
  );
};
