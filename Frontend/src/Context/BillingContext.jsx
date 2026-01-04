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
import { getCache, setCache, CACHE_KEYS, TTL } from "../utils/cacheUtils";

const BillingContext = createContext();

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error("useBilling must be used within a BillingProvider");
  }
  return context;
};

export const BillingProvider = ({ children }) => {
  const { accessToken } = useAuth();

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(
    async (force = false) => {
      if (!accessToken) return;

      try {
        setLoading(true);

        if (!force) {
          const cached = getCache(CACHE_KEYS.PRODUCTS_FLAT);
          if (cached) {
            setProducts(cached);
          }
        }

        const res = await axios.get(API_ENDPOINTS.BRANCH_INVENTORY, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.data.success) {
          const mappedProducts = res.data.data
            .filter((item) => item.product)
            .map((item) => ({
              _id: item.product._id,
              name: item.product.name,
              sku: item.product.sku,
              price: item.FinalPrice,
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
          setCache(CACHE_KEYS.PRODUCTS_FLAT, mappedProducts, TTL.SHORT);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  const fetchCustomers = useCallback(
    async (force = false) => {
      if (!accessToken) return;

      try {
        setLoading(true);

        if (!force) {
          const cached = getCache(CACHE_KEYS.CUSTOMERS);
          if (cached) {
            setCustomers(cached);
          }
        }

        const res = await axios.get(API_ENDPOINTS.CUSTOMERS + "/my-branch", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.data.success) {
          setCustomers(res.data.data);
          setCache(CACHE_KEYS.CUSTOMERS, res.data.data, TTL.SHORT);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
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
