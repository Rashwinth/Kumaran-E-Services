import { useState } from "react";
import { Link } from "react-router-dom";
import "../Styles/Products.css";

// Sample products data
const productsData = [
  {
    _id: "1",
    name: "Basmati Rice",
    category: "Groceries",
    price: 120,
    unit: "kg",
    stock: 250,
    status: "In Stock",
  },
  {
    _id: "2",
    name: "Toor Dal",
    category: "Groceries",
    price: 95,
    unit: "kg",
    stock: 180,
    status: "In Stock",
  },
  {
    _id: "3",
    name: "Sunflower Oil",
    category: "Groceries",
    price: 145,
    unit: "ltr",
    stock: 120,
    status: "In Stock",
  },
  {
    _id: "4",
    name: "Sugar",
    category: "Groceries",
    price: 42,
    unit: "kg",
    stock: 15,
    status: "Low Stock",
  },
  {
    _id: "5",
    name: "Wheat Flour",
    category: "Groceries",
    price: 38,
    unit: "kg",
    stock: 300,
    status: "In Stock",
  },
  {
    _id: "6",
    name: "Tea Powder",
    category: "Beverages",
    price: 280,
    unit: "kg",
    stock: 85,
    status: "In Stock",
  },
  {
    _id: "7",
    name: "Coffee Powder",
    category: "Beverages",
    price: 420,
    unit: "kg",
    stock: 60,
    status: "In Stock",
  },
  {
    _id: "8",
    name: "Milk Powder",
    category: "Dairy",
    price: 350,
    unit: "kg",
    stock: 0,
    status: "Out of Stock",
  },
  {
    _id: "9",
    name: "Ghee",
    category: "Dairy",
    price: 480,
    unit: "kg",
    stock: 45,
    status: "In Stock",
  },
  {
    _id: "10",
    name: "Paneer",
    category: "Dairy",
    price: 320,
    unit: "kg",
    stock: 25,
    status: "In Stock",
  },
  {
    _id: "11",
    name: "Butter",
    category: "Dairy",
    price: 450,
    unit: "kg",
    stock: 30,
    status: "In Stock",
  },
  {
    _id: "12",
    name: "Curd",
    category: "Dairy",
    price: 60,
    unit: "ltr",
    stock: 50,
    status: "In Stock",
  },
  {
    _id: "13",
    name: "Coconut Oil",
    category: "Groceries",
    price: 180,
    unit: "ltr",
    stock: 90,
    status: "In Stock",
  },
  {
    _id: "14",
    name: "Groundnut Oil",
    category: "Groceries",
    price: 165,
    unit: "ltr",
    stock: 75,
    status: "In Stock",
  },
  {
    _id: "15",
    name: "Mustard Oil",
    category: "Groceries",
    price: 155,
    unit: "ltr",
    stock: 8,
    status: "Low Stock",
  },
  {
    _id: "16",
    name: "Chana Dal",
    category: "Groceries",
    price: 88,
    unit: "kg",
    stock: 140,
    status: "In Stock",
  },
  {
    _id: "17",
    name: "Moong Dal",
    category: "Groceries",
    price: 105,
    unit: "kg",
    stock: 110,
    status: "In Stock",
  },
  {
    _id: "18",
    name: "Urad Dal",
    category: "Groceries",
    price: 98,
    unit: "kg",
    stock: 95,
    status: "In Stock",
  },
  {
    _id: "19",
    name: "Masoor Dal",
    category: "Groceries",
    price: 92,
    unit: "kg",
    stock: 125,
    status: "In Stock",
  },
  {
    _id: "20",
    name: "Salt",
    category: "Groceries",
    price: 18,
    unit: "kg",
    stock: 400,
    status: "In Stock",
  },
];

const Products = () => {
  const [products] = useState(productsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || product.category === filterCategory;
    const matchesStatus =
      filterStatus === "All" || product.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStockClass = (status) => {
    if (status === "In Stock") return "in-stock";
    if (status === "Low Stock") return "low-stock";
    return "out-of-stock";
  };

  return (
    <div className="products-container">
      <div className="products-header">
        <div className="header-left">
          <h1>Products Management</h1>
          <p className="products-count">
            {filteredProducts.length} products found
          </p>
        </div>
        <button className="add-product-btn">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Add New Product
        </button>
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
            {categories.map((cat) => (
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
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product._id} className="product-card">
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-category">{product.category}</p>
              <p className="product-price">
                ₹{product.price}/{product.unit}
              </p>
            </div>
            <div className="product-stock">
              <span className={`stock-badge ${getStockClass(product.status)}`}>
                {product.status}
              </span>
              <p className="stock-quantity">{product.stock} units</p>
            </div>
            <div className="product-actions">
              <button className="btn-edit">Edit</button>
              <button className="btn-delete">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
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

export default Products;
