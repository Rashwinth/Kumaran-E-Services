import React, { useState, useEffect, useRef } from "react";
import "../../Styles/dashboard.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useAuth } from "../../Context/AuthContext";

const ProductBilling = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const searchInputRef = useRef(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const{user}=useAuth()

  // --- Sample Data ---
  const sampleProducts = [
    {
      id: 1,
      barcode: "1001",
      name: "Premium Whole Milk 1L",
      mrp: 70,
      price: 65,
      gst: 5,
    },
    {
      id: 2,
      barcode: "1002",
      name: "Farm Fresh Eggs (12)",
      mrp: 90,
      price: 85,
      gst: 5,
    },
    {
      id: 3,
      barcode: "1003",
      name: "Whole Wheat Bread 400g",
      mrp: 50,
      price: 45,
      gst: 0,
    },
    {
      id: 4,
      barcode: "1004",
      name: "Organic Brown Sugar 1kg",
      mrp: 100,
      price: 90,
      gst: 12,
    },
    {
      id: 5,
      barcode: "1005",
      name: "Sunflower Oil 1L",
      mrp: 160,
      price: 145,
      gst: 12,
    },
    {
      id: 6,
      barcode: "1006",
      name: "Basmati Rice 2kg",
      mrp: 250,
      price: 220,
      gst: 5,
    },
  ];

  // --- State ---
  const [cart, setCart] = useState([
    { ...sampleProducts[0], qty: 2, discount: 0 },
    { ...sampleProducts[1], qty: 1, discount: 0 },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- Calculations ---
  // Subtotal is sum of (Price - Discount) * Qty
  // We'll calculate Tax based on the discounted price
  const cartWithTotals = cart.map((item) => {
    const effectivePrice = Math.max(0, item.price - item.discount);
    const lineTotal = effectivePrice * item.qty;
    const taxAmount = (lineTotal * item.gst) / 100;
    return { ...item, effectivePrice, lineTotal, taxAmount };
  });

  const subtotal = cartWithTotals.reduce(
    (acc, item) => acc + item.lineTotal,
    0
  );
  const totalTax = cartWithTotals.reduce(
    (acc, item) => acc + item.taxAmount,
    0
  );
  const grandTotal = subtotal + totalTax;
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

  // --- Functions ---
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1, discount: 0 }];
    });
    setSearchQuery("");
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      const filtered = sampleProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.barcode.includes(query)
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
    // Use first suggestion if available, otherwise exact match logic (fallback)
    const targetProduct =
      suggestions.length > 0
        ? suggestions[0]
        : sampleProducts.find(
            (p) =>
              p.barcode === searchQuery ||
              p.name.toLowerCase().includes(searchQuery.toLowerCase())
          );

    if (targetProduct) {
      addToCart(targetProduct);
    } else {
      alert("Product not found! Try searching for 'Milk' or '1001'");
    }
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  const updateDiscount = (id, val) => {
    const numVal = parseFloat(val) || 0;
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, discount: numVal } : item
      )
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePayment = () => {
    if (cart.length === 0) return alert("Cart is empty!");
    alert(`Payment Successful!\nTotal: ₹${grandTotal.toFixed(2)}`);
    setCart([]);
  };

  const clearTransaction = () => {
    if (
      window.confirm("Are you sure you want to cancel the entire transaction?")
    ) {
      setCart([]);
      setCustomerName("Walk-in Customer");
      setCustomerPhone("");
      setCustomerCity("");
    }
  };

  const saveCustomer = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setCustomerName(fd.get("name") || "Walk-in Customer");
    setCustomerPhone(fd.get("phone") || "");
    setCustomerCity(fd.get("city") || "");
    setShowCustomerModal(false);
  };

  // Time Update
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F1 - Add Customer
      if (e.key === "F1") {
        e.preventDefault();
        setShowCustomerModal(true);
      }

      // F2 - Focus Search
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // F4 - Cancel
      if (e.key === "F4") {
        e.preventDefault();
        clearTransaction();
      }

      // F5 - Hold
      if (e.key === "F5") {
        e.preventDefault();
        alert("Transaction Held on System");
      }

      // F10 - Pay Now
      if (e.key === "F10") {
        e.preventDefault();
        handlePayment();
      }

      // Escape - Hide suggestions
      if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [cart, grandTotal]);

  return (
    <div className="billing-container h-100 d-flex flex-column position-relative">
      {/* New Customer Modal Overlay */}
      {showCustomerModal && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50"
          style={{ zIndex: 2000 }}
        >
          <div className="card shadow-lg p-4" style={{ width: "400px" }}>
            <h4 className="mb-3 fw-bold">Add New Customer</h4>
            <form onSubmit={saveCustomer}>
              <div className="mb-3">
                <label className="form-label text-secondary">
                  Customer Name <span className="text-danger">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  className="form-control"
                  required
                  autoFocus
                  defaultValue={
                    customerName === "Walk-in Customer" ? "" : customerName
                  }
                  placeholder="Enter Name"
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-secondary">
                  Phone Number <span className="text-danger">*</span>
                </label>
                <input
                  name="phone"
                  type="text"
                  className="form-control"
                  required
                  defaultValue={customerPhone}
                  placeholder="Enter Phone"
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-secondary">City</label>
                <input
                  name="city"
                  type="text"
                  className="form-control"
                  defaultValue={customerCity}
                  placeholder="Enter City"
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowCustomerModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Info Bar */}
      <div className="bg-white px-4 py-2 border-bottom d-flex justify-content-between align-items-center">
        <div className="d-flex gap-4">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-light p-2 rounded">
              <i className="bi bi-shop text-primary"></i>
            </div>
            <div>
              <small
                className="text-secondary d-block"
                style={{ fontSize: "0.75rem" }}
              >
                BRANCH
              </small>
              <span className="fw-bold">{localStorage.getItem("branchCode")}</span>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="bg-light p-2 rounded">
              <i className="bi bi-person-badge text-primary"></i>
            </div>
            <div>
              <small
                className="text-secondary d-block"
                style={{ fontSize: "0.75rem" }}
              >
                STAFF
              </small>
              <span className="fw-bold">{user?.name.toUpperCase()}</span>
            </div>
          </div>
        </div>
        <div className="text-end">
          <div className="fw-bold fs-5">{dateTime.toLocaleTimeString()}</div>
          <small className="text-secondary">
            {dateTime.toLocaleDateString()}
          </small>
        </div>
      </div>

      <div className="flex-grow-1 p-3 overflow-hidden">
        <div className="row h-100 g-3">
          {/* Left Panel - Product Entry & Cart */}
          <div className="col-lg-9 h-100 d-flex flex-column">
            {/* Search/Scan Bar */}
            <div
              className="card border-0 shadow-sm mb-3 overflow-visible position-relative"
              style={{ zIndex: 1000 }}
            >
              <div className="card-body p-2">
                <form onSubmit={handleSearchSubmit}>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-transparent border-0">
                      <i className="bi bi-upc-scan text-primary"></i>
                    </span>
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="form-control border-0 fw-bold"
                      placeholder="Scan Barcode or Search Item (F2)..."
                      autoFocus
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onBlur={() =>
                        setTimeout(() => setShowSuggestions(false), 200)
                      }
                      onFocus={() => searchQuery && setShowSuggestions(true)}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary px-4 rounded-3"
                    >
                      <i className="bi bi-search me-2"></i> Search
                    </button>
                  </div>
                </form>
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    className="position-absolute start-0 w-100 shadow-lg rounded-3 bg-white mt-1"
                    style={{
                      top: "100%",
                      zIndex: 1050,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <ul className="list-group list-group-flush">
                      {suggestions.map((product) => (
                        <li
                          key={product.id}
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3 cursor-pointer"
                          onClick={() => addToCart(product)}
                          style={{ cursor: "pointer" }}
                        >
                          <div>
                            <div className="fw-bold text-dark">
                              {product.name}
                            </div>
                            <small className="text-secondary">
                              #{product.barcode}
                            </small>
                          </div>
                          <div className="fw-bold text-primary">
                            ₹{product.price}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {showSuggestions && searchQuery && suggestions.length === 0 && (
                  <div
                    className="position-absolute start-0 w-100 shadow-sm rounded-3 bg-white mt-1 p-3 text-center text-secondary"
                    style={{ top: "100%", zIndex: 1050 }}
                  >
                    No products found.
                  </div>
                )}
              </div>
            </div>

            {/* Cart Table */}
            <div
              className="card border-0 shadow-sm flex-grow-1 overflow-hidden"
              style={{ minHeight: "0" }}
            >
              <div className="table-responsive h-100">
                <table
                  className="table table-hover align-middle mb-0 sticky-header"
                  style={{ minWidth: "900px" }}
                >
                  <thead className="bg-light text-secondary sticky-top">
                    <tr>
                      <th className="ps-4" style={{ width: "5%" }}>
                        #
                      </th>
                      <th style={{ width: "30%" }}>Item Desc</th>
                      <th className="text-center" style={{ width: "8%" }}>
                        GST%
                      </th>
                      <th className="text-center" style={{ width: "10%" }}>
                        MRP
                      </th>
                      <th className="text-center" style={{ width: "10%" }}>
                        Price
                      </th>
                      <th className="text-center" style={{ width: "12%" }}>
                        Qty
                      </th>
                      <th className="text-center" style={{ width: "12%" }}>
                        Discount
                      </th>
                      <th className="text-end pe-4" style={{ width: "13%" }}>
                        Total
                      </th>
                      <th style={{ width: "5%" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, index) => {
                      const effectivePrice = Math.max(
                        0,
                        item.price - item.discount
                      );
                      const rowTotal = effectivePrice * item.qty;

                      return (
                        <tr key={item.id} style={{ height: "60px" }}>
                          <td className="ps-4 text-secondary">{index + 1}</td>
                          <td>
                            <div
                              className="fw-bold text-truncate"
                              style={{ maxWidth: "250px" }}
                            >
                              {item.name}
                            </div>
                            <small className="text-secondary">
                              #{item.barcode}
                            </small>
                          </td>
                          <td className="text-center text-secondary">
                            {item.gst}%
                          </td>
                          <td className="text-center text-decoration-line-through text-muted small">
                            ₹{item.mrp}
                          </td>
                          <td className="text-center fw-bold">₹{item.price}</td>
                          <td className="text-center">
                            <div className="input-group input-group-sm d-inline-flex w-auto">
                              <button
                                className="btn btn-outline-secondary px-2"
                                onClick={() => updateQty(item.id, -1)}
                              >
                                -
                              </button>
                              <input
                                type="text"
                                className="form-control text-center"
                                value={item.qty}
                                style={{ width: "40px" }}
                                readOnly
                              />
                              <button
                                className="btn btn-outline-secondary px-2"
                                onClick={() => updateQty(item.id, 1)}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="text-center">
                            <input
                              type="number"
                              className="form-control form-control-sm text-center mx-auto"
                              style={{ width: "70px" }}
                              value={item.discount}
                              min="0"
                              onChange={(e) =>
                                updateDiscount(item.id, e.target.value)
                              }
                            />
                          </td>
                          <td className="text-end pe-4 fw-bold fs-5">
                            ₹{rowTotal.toFixed(2)}
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-link text-danger p-0"
                              title="Delete Item"
                              onClick={() => removeItem(item.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Empty Rows Filler */}
                    {[...Array(Math.max(0, 8 - cart.length))].map((_, i) => (
                      <tr key={`empty-${i}`} style={{ height: "60px" }}>
                        <td colSpan="9"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-3 d-flex gap-2">
              <button
                className="btn btn-white border shadow-sm px-4 py-2 fw-semibold"
                onClick={() => alert("Transaction Held (F5)")}
              >
                <i className="bi bi-arrow-repeat me-2"></i>Hold (F5)
              </button>
              <button
                className="btn btn-white border shadow-sm px-4 py-2 fw-semibold"
                onClick={clearTransaction}
              >
                <i className="bi bi-x-circle me-2"></i>Cancel (F4)
              </button>
              <div className="ms-auto">
                <button
                  className="btn btn-white border shadow-sm px-4 py-2 fw-semibold text-primary"
                  onClick={() => setShowCustomerModal(true)}
                >
                  <i className="bi bi-person-plus me-2"></i>Add Customer (F1)
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Totals & Payment */}
          <div className="col-lg-3 h-100 d-flex flex-column">
            {/* Customer Card */}
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span
                    className="text-secondary fw-bold"
                    style={{ fontSize: "0.75rem" }}
                  >
                    CUSTOMER
                  </span>
                  <span className="badge bg-success bg-opacity-10 text-success">
                    Active
                  </span>
                </div>
                <h6 className="fw-bold mb-0 text-truncate">{customerName}</h6>
                <div className="d-flex flex-column">
                  <small className="text-secondary">
                    {customerPhone || "No Phone Number"}
                  </small>
                  {customerCity && (
                    <small
                      className="text-muted"
                      style={{ fontSize: "0.75rem" }}
                    >
                      <i className="bi bi-geo-alt-fill me-1"></i>
                      {customerCity}
                    </small>
                  )}
                </div>
              </div>
            </div>

            {/* Bill Details */}
            <div className="card border-0 shadow-sm flex-grow-1 mb-3">
              <div className="card-body d-flex flex-column">
                <h6 className="card-title fw-bold mb-4">Payment Summary</h6>

                <div className="d-flex justify-content-between mb-3">
                  <span className="text-secondary">Subtotal</span>
                  <span className="fw-bold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-secondary">Tax (GST)</span>
                  <span className="fw-bold">₹{totalTax.toFixed(2)}</span>
                </div>

                <div className="mt-auto border-top pt-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fs-5 fw-bold text-secondary">
                      Grand Total
                    </span>
                    <span className="fs-1 fw-bold text-primary">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>
                  <small className="text-end d-block text-secondary mb-4">
                    {totalItems} Items
                  </small>

                  <button
                    className="btn btn-primary w-100 py-3 fs-5 fw-bold rounded-3 shadow-sm mb-2"
                    onClick={handlePayment}
                  >
                    <i className="bi bi-cash-coin me-2"></i> Pay Now (F10)
                  </button>
                  <div className="row g-2">
                    <div className="col-6">
                      <button className="btn btn-outline-primary w-100 py-2 fw-bold">
                        <i className="bi bi-credit-card me-2"></i>Card
                      </button>
                    </div>
                    <div className="col-6">
                      <button className="btn btn-outline-success w-100 py-2 fw-bold">
                        <i className="bi bi-qr-code me-2"></i>UPI
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="text-center text-secondary">
              <small
                className="fw-bold"
                style={{ fontSize: "0.7rem", letterSpacing: "1px" }}
              >
                POWERED BY KES POS V1.2
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductBilling;
