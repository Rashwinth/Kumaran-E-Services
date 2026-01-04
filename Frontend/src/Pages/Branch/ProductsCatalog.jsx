import { useState, useEffect } from "react";
import "../../Styles/Products.css";
import { useProduct } from "../../Context/ProductContext";

const ProductsCatalog = () => {
  const { products, loading, getProducts, getCategories, categories } =
    useProduct();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    getProducts();
    getCategories();
  }, [getProducts, getCategories]);

  const uniqueCategories = ["All", ...categories.map((c) => c.name)];

  const filteredProducts = products.filter((item) => {
    const product = item.product;
    if (!product) return false;

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term) ||
      (product.brand && product.brand.toLowerCase().includes(term)) ||
      (product.model && product.model.toLowerCase().includes(term)) ||
      (product.tags &&
        product.tags.some((tag) => tag.toLowerCase().includes(term))) ||
      (product.compatibleModels &&
        product.compatibleModels.some((model) =>
          model.toLowerCase().includes(term)
        ));

    // Handle nested category name (if populated) or find in categories array
    const categoryName =
      product.category?.name ||
      categories.find((c) => c._id === product.category)?.name ||
      "Uncategorized";

    const matchesCategory =
      filterCategory === "All" || categoryName === filterCategory;

    // Status logic from inventory item
    const status = item.isActive ? "Active" : "Inactive";
    const matchesStatus = filterStatus === "All" || status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStockStatus = (quantity, threshold) => {
    if (quantity <= 0) return { label: "Out of Stock", class: "out-of-stock" };
    if (quantity <= threshold)
      return { label: "Low Stock", class: "low-stock" };
    return { label: "In Stock", class: "in-stock" };
  };

  return (
    <div className="products-container">
      {/* <div className="products-header">
        <div className="header-left">
          <h1>Products Catalog</h1>
          <p className="products-count">
            {filteredProducts.length} products found
          </p>
        </div>
      </div> */}

      <div className="products-filters">
        <div className="search-box">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading products...</div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((item) => {
            const product = item.product;
            const stockStatus = getStockStatus(
              item.quantity,
              item.lowStockThreshold
            );

            return (
              <div key={item._id} className="product-card">
                <div className="product-info">
                  <div className="product-header">
                    <h3>{product.name}</h3>
                    <span
                      className={`status-badge ${
                        item.isActive ? "active" : "inactive"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="product-meta">
                    {/* Placeholder for future SKU/Brand info if needed */}
                  </div>

                  <div className="compatible-section">
                    <p className="compatible-label">Compatible With:</p>
                    <div className="compatible-tags">
                      {product.compatibleModels &&
                      product.compatibleModels.length > 0 ? (
                        product.compatibleModels.map((model, idx) => (
                          <span key={idx} className="model-tag">
                            {model}
                          </span>
                        ))
                      ) : (
                        <span className="model-tag" style={{ opacity: 0.5 }}>
                          No compatible models listed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="product-stock">
                    <div className="stock-info-row">
                      <span className="stock-quantity">
                        Stock: <strong>{item.quantity}</strong> {product.unit}
                      </span>
                      <span className={`stock-badge ${stockStatus.class}`}>
                        {stockStatus.label}
                      </span>
                    </div>
                  </div>

                  <div className="pricing-section">
                    <div className="price-row">
                      <p className="current-price">₹{item.FinalPrice}</p>
                      {product.mrp > item.FinalPrice && (
                        <p className="mrp-strike">₹{product.mrp}</p>
                      )}
                    </div>
                    <div className="mrp-row">
                      <span>MRP: ₹{product.mrp}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="no-products">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3>No products found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default ProductsCatalog;
