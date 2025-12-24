import React, { useState, useEffect, useRef } from "react";
import "../../Styles/dashboard.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useAuth } from "../../Context/AuthContext";
import { useBilling } from "../../Context/BillingContext";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { toast } from "react-toastify";
import LoadingPage from "../../Components/Loading/LoadingPage";
import ProductSearch from "../../Components/Billing/ProductSearch";
import CustomerSearch from "../../Components/Billing/CustomerSearch";
import CustomerModal from "../../Components/Billing/CustomerModal";

const ProductBilling = () => {
  const {
    products: allProducts,
    customers: allCustomers,
    loading: billingLoading,
    refreshCustomers,
  } = useBilling();
  const { user, accessToken } = useAuth();

  const [dateTime, setDateTime] = useState(new Date());
  const searchInputRef = useRef(null);

  // Customer State
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState("");

  // Payment State
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Cart State
  const [cart, setCart] = useState([]);

  // Calculations
  const cartWithTotals = cart.map((item) => {
    const discountAmount = (item.price * item.discount) / 100;
    const effectivePrice = Math.max(0, item.price - discountAmount);
    const lineTotal = effectivePrice * item.qty;
    const taxAmount = (lineTotal * item.gst) / 100;
    return { ...item, effectivePrice, lineTotal, taxAmount, discountAmount };
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

  const totalDiscount = cartWithTotals.reduce(
    (acc, item) => acc + item.discountAmount * item.qty,
    0
  );

  // Cart Functions
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1, discount: 0 }];
    });
  };

  const setQty = (id, val) => {
    const qty = Math.max(1, parseInt(val) || 0);
    setCart((prev) =>
      prev.map((item) => (item._id === id ? { ...item, qty } : item))
    );
  };

  const updateDiscount = (id, val) => {
    const discount = Math.min(100, Math.max(0, parseFloat(val) || 0));
    setCart((prev) =>
      prev.map((item) => (item._id === id ? { ...item, discount } : item))
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  // Customer Functions
  const handleSelectCustomer = (customer) => {
    setSelectedCustomerId(customer._id);
    setSelectedCustomerName(customer.name);
    setSelectedCustomerPhone(customer.phone);
  };

  const handleCustomerAdded = (newCustomer) => {
    setSelectedCustomerId(newCustomer._id);
    setSelectedCustomerName(newCustomer.name);
    setSelectedCustomerPhone(newCustomer.phone);
    refreshCustomers();
  };

  // Fetch Accounts
  const fetchAccounts = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.BRANCH_ACCOUNTS, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.data.success) {
        setAccounts(res.data.data);
        const cashAccount = res.data.data.find((acc) => acc.type === "Cash");
        if (cashAccount) {
          setSelectedAccountId(cashAccount._id);
        }
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to load accounts");
    }
  };

  const fetchBranch = async () => {
    const branchcode = localStorage.getItem("branchCode");
    
    try {
      const res = await axios.get(`${API_ENDPOINTS.BRANCH}/${branchcode}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (res.data.success) {
        const branch = res.data.branch;
        if (branch) {
          localStorage.setItem("branch", JSON.stringify(branch));
        }
      }
    } catch (error) {
      toast.error("Failed to load branch");
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchAccounts();
      fetchBranch();
    }
  }, [accessToken]);

  // Payment Handler
  const handlePayment = async (shouldPrint = false) => {
    if (cart.length === 0) return toast.warning("Cart is empty!");
    if (!selectedCustomerId) {
      return toast.warning("Please select or register a customer!");
    }
    if (!selectedAccountId)
      return toast.warning("Please select a payment account!");

    const selectedAccount = accounts.find((a) => a._id === selectedAccountId);
    if (selectedAccount?.type === "Credits" && !selectedCustomerId) {
      return toast.warning(
        "Please select/register a customer for Credit payments!"
      );
    }

    setIsProcessing(shouldPrint ? "printing" : "saving");
    try {
      const saleData = {
        customer: selectedCustomerId,
        items: cart.map((item) => {
          const discountAmount = (item.price * item.discount) / 100;
          const effectivePrice = Math.max(0, item.price - discountAmount);
          const lineTotal = effectivePrice * item.qty;
          const taxAmount = (lineTotal * item.gst) / 100;

          return {
            product: item._id,
            qty: item.qty,
            price: item.price,
            discount: discountAmount,
            taxAmount: taxAmount,
            lineTotal: lineTotal,
          };
        }),
        subtotal: subtotal,
        totalTax: totalTax,
        grandTotal: grandTotal,
        paymentMethod: selectedAccountId,
      };

      const res = await axios.post(API_ENDPOINTS.SALES, saleData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.data.success) {
        toast.success(
          shouldPrint ? "Sale saved & printing..." : "Sale saved successfully!"
        );

        if (shouldPrint) {
          // Placeholder for actual print logic
          // window.print() or redirect to a print view
          console.log("Printing invoice...");
        }

        clearTransaction();
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearTransaction = () => {
    setCart([]);
    setSelectedCustomerId(null);
    setSelectedCustomerName("");
    setSelectedCustomerPhone("");
    searchInputRef.current?.focus();
  };

  // Time Update
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F1") {
        e.preventDefault();
        setShowCustomerModal(true);
      }
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "F4") {
        e.preventDefault();
        clearTransaction();
      }
      if (e.key === "F9") {
        e.preventDefault();
        handlePayment(false);
      }
      if (e.key === "F10") {
        e.preventDefault();
        handlePayment(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, grandTotal, selectedAccountId, selectedCustomerId]);

  if (billingLoading && allProducts.length === 0) {
    return <LoadingPage />;
  }

  return (
    <div className="d-flex flex-column vh-100 bg-light overflow-hidden">
      {/* Customer Modal */}
      <CustomerModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onCustomerAdded={handleCustomerAdded}
        accessToken={accessToken}
      />

      {/* Top Navigation */}
      <div
        className="bg-white border-bottom px-4 py-2 d-flex justify-content-between align-items-center"
        style={{ minHeight: "65px" }}
      >
        <div className="d-flex align-items-center gap-4">
          {/* Branch Info */}
          <div className="d-flex align-items-center gap-2">
            <div
              className="bg-primary bg-opacity-10 text-primary rounded d-flex align-items-center justify-content-center"
              style={{ width: "32px", height: "32px" }}
            >
              <i className="bi bi-shop fs-6"></i>
            </div>
            <div>
              <h6
                className="mb-0 fw-bold"
                style={{ fontSize: "0.7rem", color: "#6c757d" }}
              >
                BRANCH
              </h6>
              <div className="fw-bold text-dark small">{user?.branchCode}</div>
            </div>
          </div>

          <div className="vr opacity-10" style={{ height: "30px" }}></div>

          {/* Staff Info */}
          <div className="d-flex align-items-center gap-2">
            <div
              className="bg-success bg-opacity-10 text-success rounded d-flex align-items-center justify-content-center"
              style={{ width: "32px", height: "32px" }}
            >
              <i className="bi bi-person fs-6"></i>
            </div>
            <div>
              <h6
                className="mb-0 fw-bold"
                style={{ fontSize: "0.7rem", color: "#6c757d" }}
              >
                STAFF
              </h6>
              <div className="fw-bold text-dark small">
                {user?.name?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Status Group: Shortcuts & Time */}
        <div className="d-flex align-items-center gap-4">
          {/* Shortcuts Section */}
          <div className="d-flex align-items-center gap-3">
            <span
              className="text-uppercase fw-bold text-muted"
              style={{ fontSize: "0.6rem", letterSpacing: "0.05em" }}
            >
              Shortcuts:
            </span>
            <div className="d-flex gap-3">
              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                <kbd
                  className="bg-secondary text-white fw-normal me-1"
                  style={{ fontSize: "0.7rem" }}
                >
                  F1
                </kbd>
                New Customer
              </small>
              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                <kbd
                  className="bg-secondary text-white fw-normal me-1"
                  style={{ fontSize: "0.7rem" }}
                >
                  F2
                </kbd>
                Search
              </small>
              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                <kbd
                  className="bg-secondary text-white fw-normal me-1"
                  style={{ fontSize: "0.7rem" }}
                >
                  F4
                </kbd>
                Clear
              </small>
              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                <kbd
                  className="bg-secondary text-white fw-normal me-1"
                  style={{ fontSize: "0.7rem" }}
                >
                  F9
                </kbd>
                Save
              </small>
              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                <kbd
                  className="bg-secondary text-white fw-normal me-1"
                  style={{ fontSize: "0.7rem" }}
                >
                  F10
                </kbd>
                Print
              </small>
            </div>
          </div>

          <div className="vr opacity-10" style={{ height: "30px" }}></div>

          {/* Time and Date */}
          <div className="text-end">
            <div className="d-flex align-items-center gap-2 justify-content-end">
              <i className="bi bi-clock text-primary small"></i>
              <h6 className="mb-0 fw-bold text-primary small">
                {dateTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </h6>
            </div>
            <small
              className="text-muted d-block mt-1"
              style={{ fontSize: "0.75rem" }}
            >
              {dateTime.toLocaleDateString(undefined, {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </small>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1 p-3 overflow-hidden d-flex flex-column">
        {/* Customer Section - Horizontal at Top */}
        <div className="card shadow-sm mb-3">
          <div className="card-body p-2">
            <div className="row g-2 align-items-center">
              <div className="col-md-5">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <i className="bi bi-person-badge text-primary"></i>
                  <h6 className="fw-bold mb-0 small">CUSTOMER SEARCH</h6>
                </div>
                <CustomerSearch
                  customers={allCustomers}
                  onSelectCustomer={handleSelectCustomer}
                  onAddNewCustomer={() => setShowCustomerModal(true)}
                />
              </div>
              <div className="col-md-7">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <i className="bi bi-check-circle text-primary"></i>
                  <h6 className="fw-bold mb-0 small">SELECTED CUSTOMER</h6>
                </div>
                {selectedCustomerId ? (
                  <div className="card bg-light border-0">
                    <div className="card-body p-2">
                      <div className="d-flex flex-row justify-content-between align-items-center">
                        <div className="d-flex gap-4 align-items-center">
                          <div className="fw-bold text-dark">
                            <i className="bi bi-person me-2"></i>
                            {selectedCustomerName.toUpperCase()}
                          </div>
                          <div className="text-muted small">
                            <i className="bi bi-telephone-outbound me-2"></i>
                            {selectedCustomerPhone}
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-link text-danger p-0"
                          onClick={() => {
                            setSelectedCustomerId(null);
                            setSelectedCustomerName("");
                            setSelectedCustomerPhone("");
                          }}
                          title="Clear Customer"
                        >
                          <i className="bi bi-x-circle-fill fs-5"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card bg-warning bg-opacity-10 border-warning">
                    <div className="card-body p-2">
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-exclamation-triangle text-warning"></i>
                        <div>
                          <small className="fw-bold text-warning d-block">
                            No Customer Selected
                          </small>
                          <small
                            className="text-muted"
                            style={{ fontSize: "0.7rem" }}
                          >
                            Please select or add a customer to continue
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lower Section - Row with 2 columns */}
        <div className="row g-3 flex-grow-1 overflow-hidden">
          {/* Left Column - Cart */}
          <div className="col-8 h-100 d-flex flex-column">
            <div className="card shadow-sm flex-grow-1 overflow-hidden d-flex flex-column">
              <div className="card-body p-0 d-flex flex-column h-100">
                {/* Search Bar */}
                <div className="p-3 border-bottom bg-white">
                  <ProductSearch
                    products={allProducts}
                    onAddToCart={addToCart}
                    searchInputRef={searchInputRef}
                  />
                </div>

                {/* Cart Table Container */}
                <div className="flex-grow-1 overflow-auto">
                  <table className="table table-hover mb-0">
                    <thead
                      className="table-light sticky-top"
                      style={{ zIndex: 10 }}
                    >
                      <tr className="small text-uppercase">
                        <th
                          style={{ width: "5%" }}
                          className="ps-3 text-center"
                        >
                          #
                        </th>
                        <th style={{ width: "30%" }}>Description</th>
                        <th style={{ width: "8%" }} className="text-center">
                          GST%
                        </th>
                        <th style={{ width: "10%" }} className="text-end">
                          Price
                        </th>
                        <th style={{ width: "12%" }} className="text-center">
                          Qty
                        </th>
                        <th style={{ width: "15%" }} className="text-end">
                          Discount %
                        </th>
                        <th style={{ width: "15%" }} className="text-end">
                          Total
                        </th>
                        <th
                          style={{ width: "5%" }}
                          className="text-center"
                        ></th>
                      </tr>
                    </thead>
                    <tbody className="border-top-0">
                      {cart.length === 0 ? (
                        <tr>
                          <td
                            colSpan="8"
                            className="text-center text-muted py-5"
                          >
                            <div className="py-4">
                              <i className="bi bi-cart-x fs-1 d-block mb-3 opacity-25"></i>
                              <h6 className="fw-light">Cart is empty</h6>
                              <p className="small mb-0 text-secondary">
                                Start scanning or searching products to add them
                                here
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        cartWithTotals.map((item, idx) => (
                          <tr
                            key={item._id}
                            className="align-middle border-bottom"
                          >
                            <td className="text-center small ps-3 text-muted">
                              {idx + 1}
                            </td>
                            <td>
                              <div className="fw-bold small text-dark">
                                {item.name}
                              </div>
                              <div
                                className="text-muted"
                                style={{ fontSize: "0.7rem" }}
                              >
                                #{item.sku}
                              </div>
                            </td>
                            <td className="text-center">
                              <span className="badge bg-light text-dark border small fw-normal">
                                {item.gst}%
                              </span>
                            </td>
                            <td className="text-end small">₹{item.price}</td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm text-center small border-0 bg-light mx-auto"
                                value={item.qty}
                                onChange={(e) =>
                                  setQty(item._id, e.target.value)
                                }
                                min="1"
                                style={{ width: "60px", fontSize: "0.8rem" }}
                              />
                            </td>
                            <td>
                              <div
                                className="input-group input-group-sm mx-auto"
                                style={{ width: "70px" }}
                              >
                                <input
                                  type="number"
                                  className="form-control text-end small border-0 bg-light pe-1"
                                  value={item.discount}
                                  onChange={(e) =>
                                    updateDiscount(item._id, e.target.value)
                                  }
                                  min="0"
                                  max="100"
                                  style={{ fontSize: "0.8rem" }}
                                />
                                <span
                                  className="input-group-text bg-light border-0 ps-0 pe-2 small text-muted"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  %
                                </span>
                              </div>
                            </td>
                            <td className="text-end fw-bold small">
                              ₹{item.lineTotal.toFixed(2)}
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-link text-danger p-0"
                                onClick={() => removeItem(item._id)}
                              >
                                <i className="bi bi-trash fs-6"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="col-4 h-100 d-flex flex-column">
            <div className="card shadow-sm h-100 overflow-hidden d-flex flex-column">
              <div className="card-body p-3 d-flex flex-column overflow-auto">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-wallet2 text-primary"></i>
                  <h6 className="fw-bold mb-0">BILLING SUMMARY</h6>
                </div>

                <div className="bg-light p-3 rounded-3 mb-4 flex-shrink-0">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Subtotal</span>
                    <span className="fw-bold small">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Tax (GST)</span>
                    <span className="fw-bold small">
                      ₹{totalTax.toFixed(2)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Total Discount</span>
                    <span className="fw-bold small text-danger">
                      - ₹{totalDiscount.toFixed(2)}
                    </span>
                  </div>
                  <hr className="my-2 opacity-10" />
                  <div className="d-flex justify-content-between align-items-end">
                    <div>
                      <span
                        className="text-muted d-block"
                        style={{ fontSize: "0.7rem" }}
                      >
                        TOTAL PAYABLE
                      </span>
                      <span className="fs-3 fw-bold text-primary">
                        ₹{grandTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-end pb-1">
                      <span className="badge bg-primary bg-opacity-10 text-primary fw-normal">
                        {totalItems} items
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex-shrink-0">
                  <label
                    className="fw-bold small mb-2 text-uppercase text-muted"
                    style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}
                  >
                    Payment Account
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    {accounts.map((acc) => (
                      <button
                        key={acc._id}
                        className={`btn btn-sm flex-fill d-flex align-items-center justify-content-center gap-2 py-2 px-3 transition-all ${
                          selectedAccountId === acc._id
                            ? "btn-primary shadow-sm"
                            : "btn-outline-primary"
                        }`}
                        onClick={() => setSelectedAccountId(acc._id)}
                        disabled={isProcessing}
                        style={{ minWidth: "100px", borderRadius: "8px" }}
                      >
                        <i
                          className={`bi ${
                            acc.type === "Cash"
                              ? "bi-cash-stack"
                              : acc.type === "Upi"
                              ? "bi-phone"
                              : "bi-credit-card"
                          }`}
                        ></i>
                        <span className="small fw-500">
                          {acc.type === "Upi" ? acc.upiAccountName : acc.type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedAccountId && (
                  <div className="alert alert-secondary border-0 bg-light p-2 mb-2 rounded-3 flex-shrink-0">
                    <div className="d-flex justify-content-between mb-1">
                      <small className="text-muted">Account Balance:</small>
                      <small className="fw-bold">
                        ₹
                        {accounts
                          .find((a) => a._id === selectedAccountId)
                          ?.currentBalance?.toFixed(2) || "0.00"}
                      </small>
                    </div>
                    {/* <div className="d-flex justify-content-between">
                      <small className="text-muted">Post-Transaction:</small>
                      <small className="fw-bold text-success">
                        ₹
                        {(
                          (accounts.find((a) => a._id === selectedAccountId)
                            ?.currentBalance || 0) + grandTotal
                        ).toFixed(2)}
                      </small>
                    </div> */}
                  </div>
                )}

                <div className="mt-auto flex-shrink-0 pt-3 border-top">
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-primary flex-fill py-2"
                        onClick={() => handlePayment(false)}
                        disabled={
                          isProcessing ||
                          cart.length === 0 ||
                          !selectedAccountId ||
                          !selectedCustomerId
                        }
                      >
                        {isProcessing === "saving" ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-cloud-arrow-up me-2"></i>Save
                            Bill
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-success flex-fill py-2"
                        onClick={() => handlePayment(true)}
                        disabled={
                          isProcessing ||
                          cart.length === 0 ||
                          !selectedAccountId ||
                          !selectedCustomerId
                        }
                      >
                        {isProcessing === "printing" ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Printing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-printer me-2"></i>Save & Print
                          </>
                        )}
                      </button>
                    </div>
                    <button
                      className="btn btn-outline-danger w-100 py-2 border-0 bg-light bg-opacity-50 text-danger hover-bg-danger hover-text-white transition-all"
                      onClick={clearTransaction}
                      disabled={isProcessing || cart.length === 0}
                    >
                      <i className="bi bi-trash3 me-2"></i>Discard Transaction
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductBilling;
