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

const ProductContext = createContext();

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context)
    throw new Error("useProduct must be used inside ProductProvider");
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const baseURL = `${import.meta.env.VITE_BACKEND_BASE_URI}/api/staff`
  const { accessToken } = useAuth();
  const branch= JSON.parse(localStorage.getItem("branch"))
  const BranchId=branch._id
    console.log(BranchId);


  // Fetch all products
  const getProducts = useCallback(
    async (forceRefresh = false) => {
      if (!accessToken) return;

      try {
        setProductsLoading(true);

        // Check cache first
        if (!forceRefresh) {
          const cachedProducts = await getCache(CACHE_KEYS.PRODUCTS);
          if (cachedProducts) {
            setProducts(cachedProducts);
            setProductsLoading(false);
            return;
          }
        }

        const response = await axios.get(`${baseURL}/products/${BranchId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.data.success) {
          setProducts(response.data.data);
          // Cache the result
          await setCache(CACHE_KEYS.PRODUCTS, response.data.data, TTL.SHORT); // Products might change more often, short TTL
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch products"
        );
      } finally {
        setProductsLoading(false);
      }
    },
    [accessToken, baseURL]
  );

  // Fetch all categories
  const getCategories = useCallback(
    async (forceRefresh = false) => {
      if (!accessToken) return;

      try {
        // Check cache
        if (!forceRefresh) {
          const cachedCategories = await getCache(CACHE_KEYS.CATEGORIES);
          if (cachedCategories) {
            setCategories(cachedCategories);
            return;
          }
        }

        const response = await axios.get(`${baseURL}/categories`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.data.success) {
          setCategories(response.data.data);
          await setCache(CACHE_KEYS.CATEGORIES, response.data.data, TTL.LONG); // Categories rarely change
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    },
    [accessToken, baseURL]
  );

  // Fetch all subcategories
  const getSubCategories = useCallback(
    async (forceRefresh = false) => {
      if (!accessToken) return;
      try {
        if (!forceRefresh) {
          const cached = await getCache(CACHE_KEYS.SUBCATEGORIES);
          if (cached) {
            setSubCategories(cached);
            return;
          }
        }

        const response = await axios.get(`${baseURL}/subcategories`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.data.success) {
          setSubCategories(response.data.data);
          await setCache(
            CACHE_KEYS.SUBCATEGORIES,
            response.data.data,
            TTL.LONG
          );
        }
      } catch (error) {
        console.error("Error fetching subcategories", error);
      }
    },
    [accessToken, baseURL]
  );
  const getSubCategoriesByCategory = async (categoryId) => {
    if (!accessToken) return [];

    try {
      const response = await axios.get(
        `${baseURL}/subcategories/category/${categoryId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching subcategories by category:", error);
      return [];
    }
  };



  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        subCategories,
        productsLoading,
        getProducts,
        getCategories,
        getSubCategories,
        getSubCategoriesByCategory,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
