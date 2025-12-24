import { useState, useEffect } from "react";
import "../../Styles/Products.css";
import { useProduct } from "../../Context/ProductContext";

const ProductsCatalog = () => {
  const {
    products,
    loading,
    getProducts,
    getCategories,
    categories,
  } = useProduct();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  
  useEffect(() => {
    getProducts();
    getCategories();
  }, [getProducts, getCategories]);

  const uniqueCategories = ["All", ...categories.map((c) => c.name)];

  const filteredProducts = products.filter((product) => {
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

    const categoryName = product.category?.name || "Uncategorized";
    const matchesCategory =
      filterCategory === "All" || categoryName === filterCategory;

    // Status logic: Assuming "isActive" is the status
    const status = product.isActive ? "Active" : "Inactive";
    const matchesStatus = filterStatus === "All" || status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });




  return (
    <div className="products-container">
      <div className="products-header">
        <div className="header-left">
          <h1>Products Catalog</h1>
          <p className="products-count">
            {filteredProducts.length} products found
          </p>
        </div>
      </div>

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
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="product-card"
              style={{ cursor: "pointer" }}
            >
              <div className="product-info">
                <div
                  className="product-name-row"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <h3 style={{ margin: 0 }}>{product.name}</h3>
                  <span
                    className={`status-badge ${
                      product.isActive ? "active" : "inactive"
                    }`}
                    style={{
                      marginTop: 0,
                      fontSize: "0.65rem",
                      padding: "0.15rem 0.5rem",
                    }}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#4a5568",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span style={{ fontWeight: "bold" }}>{product.sku}</span>
                  {(product.brand || product.model) && (
                    <span style={{ marginLeft: "8px" }}>
                      {product.brand && `${product.brand}`}
                      {product.brand && product.model && " | "}
                      {product.model && `${product.model}`}
                    </span>
                  )}
                </div>

                <p className="product-category">
                  {product.category?.name || "Uncategorized"}
                </p>
                <p className="product-price">
                  ₹{product.mrp}/{product.unit}
                </p>
              </div>
            </div>
          ))}
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
