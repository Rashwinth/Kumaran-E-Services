import React, { useState, useRef, useEffect } from "react";

const ProductSearch = ({ products, onAddToCart, searchInputRef }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedIndex(-1);

    if (query.trim()) {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      const productToAdd =
        selectedIndex >= 0 ? suggestions[selectedIndex] : suggestions[0];
      onAddToCart(productToAdd);
      clearSearch();
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          onAddToCart(suggestions[selectedIndex]);
          clearSearch();
        } else if (suggestions.length > 0) {
          onAddToCart(suggestions[0]);
          clearSearch();
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    searchInputRef.current?.focus();
  };

  const handleSuggestionClick = (product) => {
    onAddToCart(product);
    clearSearch();
  };

  return (
    <div className="position-relative w-100">
      <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
        <div className="input-group flex-grow-1">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-primary"></i>
          </span>
          <input
            ref={searchInputRef}
            type="text"
            className="form-control  border-start-0 ps-0"
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={() => searchQuery && setShowSuggestions(true)}
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary px-4"
          disabled={suggestions.length === 0}
        >
          <i className="bi bi-search me-2"></i>
          Search
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className="position-absolute start-0 w-100 shadow-lg rounded bg-white mt-2 border"
          style={{ zIndex: 9999, maxHeight: "350px", overflowY: "auto" }}
        >
          <ul className="list-group list-group-flush m-0">
            {suggestions.map((product, index) => (
              <li
                key={product._id}
                className={`list-group-item list-group-item-action p-2 ${
                  index === selectedIndex ? "active text-white" : ""
                }`}
                onClick={() => handleSuggestionClick(product)}
                onMouseEnter={() => setSelectedIndex(index)}
                style={{ cursor: "pointer" }}
              >
                <div className="d-flex justify-content-between align-items-center gap-3">
                  <div className="flex-grow-1 min-w-0">
                    <div
                      className={`fw-bold ${
                        index === selectedIndex ? "text-white" : ""
                      }`}
                    >
                      {product.name}
                    </div>
                    <small
                      className={
                        index === selectedIndex
                          ? "text-white opacity-75"
                          : "text-muted"
                      }
                    >
                      SKU: {product.sku}
                    </small>
                  </div>
                  <div className="text-end flex-shrink-0">
                    <div
                      className={`fw-bold ${
                        index === selectedIndex ? "text-white" : "text-primary"
                      }`}
                    >
                      ₹{product.price}
                    </div>
                    <small
                      className={
                        index === selectedIndex
                          ? "text-white opacity-75"
                          : product.availableQty <= 0
                          ? "text-danger fw-bold"
                          : "text-muted"
                      }
                    >
                      {product.availableQty <= 0
                        ? "OUT OF STOCK"
                        : `Stock: ${product.availableQty}`}
                    </small>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No Results Message */}
      {showSuggestions && searchQuery && suggestions.length === 0 && (
        <div
          className="position-absolute start-0 w-100 shadow-lg rounded-3 bg-white mt-2 border p-3 text-center text-muted"
          style={{ zIndex: 1050 }}
        >
          <i className="bi bi-inbox fs-3 d-block mb-2"></i>
          No products found for "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
