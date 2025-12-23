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
  const [selectedCustomerName, setSelectedCustomerName] =
    useState("Walk-in Customer");
  const [selectedCustomerPhone, setSelectedCustomerPhone] =
    useState("0000000000");

  // Payment State
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Cart State
  const [cart, setCart] = useState([]);

  // Calculations
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

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const updateDiscount = (id, val) => {
    const discount = Math.max(0, parseFloat(val) || 0);
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

  useEffect(() => {
    if (accessToken) {
      fetchAccounts();
    }
  }, [accessToken]);

  // Payment Handler
  const handlePayment = async () => {
    if (cart.length === 0) return toast.warning("Cart is empty!");
    if (!selectedAccountId)
      return toast.warning("Please select a payment account!");

    const selectedAccount = accounts.find((a) => a._id === selectedAccountId);
    if (selectedAccount?.type === "Credits" && !selectedCustomerId) {
      return toast.warning(
        "Please select/register a customer for Credit payments!"
      );
    }

    setIsProcessing(true);
    try {
      const saleData = {
        customer: selectedCustomerId,
        items: cart.map((item) => {
          const effectivePrice = Math.max(0, item.price - item.discount);
          const lineTotal = effectivePrice * item.qty;
          const taxAmount = (lineTotal * item.gst) / 100;

          return {
            product: item._id,
            qty: item.qty, // Changed from 'quantity' to 'qty'
            price: item.price,
            discount: item.discount,
            taxAmount: taxAmount, // Changed from 'gst' to 'taxAmount'
            lineTotal: lineTotal, // Added lineTotal
          };
        }),
        subtotal: subtotal, // Changed from 'totalAmount'
        totalTax: totalTax, // Changed from 'taxAmount'
        grandTotal: grandTotal,
        paymentMethod: selectedAccountId,
      };

      const res = await axios.post(API_ENDPOINTS.SALES, saleData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.data.success) {
        toast.success("Payment successful!");
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
    setSelectedCustomerName("Walk-in Customer");
    setSelectedCustomerPhone("0000000000");
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
      if (e.key === "F10") {
        e.preventDefault();
        handlePayment();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, grandTotal, selectedAccountId, selectedCustomerId]);

  if (billingLoading && allProducts.length === 0) {
    return <LoadingPage />;
  }

  return (
    <div className="d-flex flex-column vh-100 bg-light">
      {/* Customer Modal */}
      <CustomerModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onCustomerAdded={handleCustomerAdded}
        accessToken={accessToken}
      />

      {/* Top Navigation */}
      <div className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <div
            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "40px", height: "40px" }}
          >
            <i className="bi bi-shop fs-5"></i>
          </div>
          <div>
            <h6 className="mb-0 fw-bold">BRANCH</h6>
            <small className="text-muted">{user?.branchName || "SMALAI"}</small>
          </div>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div
            className="bg-light text-primary rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "40px", height: "40px" }}
          >
            <i className="bi bi-person fs-5"></i>
          </div>
          <div>
            <h6 className="mb-0 fw-bold">STAFF</h6>
            <small className="text-muted">{user?.name || "THARUN"}</small>
          </div>
        </div>
        <div className="text-end">
          <h5 className="mb-0 fw-bold text-primary">
            {dateTime.toLocaleTimeString()}
          </h5>
          <small className="text-muted">{dateTime.toLocaleDateString()}</small>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 overflow-hidden">
        <div className="container-fluid h-100 p-4">
          <div className="row g-3 h-100">
            {/* Left Column - Cart */}
            <div className="col-8 d-flex flex-column">
              <div className="card shadow-sm h-100 d-flex flex-column">
                <div className="card-body p-0 d-flex flex-column">
                  {/* Search Bar */}
                  <div className="p-3 border-bottom">
                    <ProductSearch
                      products={allProducts}
                      onAddToCart={addToCart}
                      searchInputRef={searchInputRef}
                    />
                  </div>

                  {/* Cart Table */}
                  <div className="flex-grow-1 overflow-auto">
                    <table className="table table-hover mb-0">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th style={{ width: "5%" }}>#</th>
                          <th style={{ width: "30%" }}>Item Description</th>
                          <th style={{ width: "10%" }} className="text-center">
                            GST%
                          </th>
                          <th style={{ width: "10%" }} className="text-end">
                            MRP
                          </th>
                          <th style={{ width: "10%" }} className="text-end">
                            Price
                          </th>
                          <th style={{ width: "10%" }} className="text-center">
                            Qty
                          </th>
                          <th style={{ width: "10%" }} className="text-end">
                            Discount
                          </th>
                          <th style={{ width: "10%" }} className="text-end">
                            Total
                          </th>
                          <th style={{ width: "5%" }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.length === 0 ? (
                          <tr>
                            <td
                              colSpan="9"
                              className="text-center text-muted py-5"
                            >
                              <i className="bi bi-cart-x fs-1 d-block mb-2"></i>
                              Cart is empty. Start scanning or searching
                              products.
                            </td>
                          </tr>
                        ) : (
                          cartWithTotals.map((item, idx) => (
                            <tr key={item._id}>
                              <td className="align-middle">{idx + 1}</td>
                              <td className="align-middle">
                                <div className="fw-bold">{item.name}</div>
                                <small className="text-secondary">
                                  #{item.sku}
                                </small>
                              </td>
                              <td className="align-middle text-center">
                                <span className="badge bg-info">
                                  {item.gst}%
                                </span>
                              </td>
                              <td className="align-middle text-end">
                                ₹{item.mrp}
                              </td>
                              <td className="align-middle text-end">
                                ₹{item.price}
                              </td>
                              <td className="align-middle">
                                <div className="d-flex align-items-center justify-content-center gap-1">
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => updateQty(item._id, -1)}
                                    disabled={item.qty <= 1}
                                  >
                                    <i className="bi bi-dash"></i>
                                  </button>
                                  <span className="fw-bold px-2">
                                    {item.qty}
                                  </span>
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => updateQty(item._id, 1)}
                                  >
                                    <i className="bi bi-plus"></i>
                                  </button>
                                </div>
                              </td>
                              <td className="align-middle">
                                <input
                                  type="number"
                                  className="form-control form-control-sm text-end"
                                  value={item.discount}
                                  onChange={(e) =>
                                    updateDiscount(item._id, e.target.value)
                                  }
                                  min="0"
                                  max={item.price}
                                  style={{ width: "80px" }}
                                />
                              </td>
                              <td className="align-middle text-end fw-bold">
                                ₹{item.lineTotal.toFixed(2)}
                              </td>
                              <td className="align-middle">
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeItem(item._id)}
                                >
                                  <i className="bi bi-trash"></i>
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

            {/* Right Column - Customer & Payment */}
            <div
              className="col-4 d-flex flex-column"
              style={{ maxHeight: "calc(100vh - 180px)", overflowY: "auto" }}
            >
              <div className="card shadow-sm mb-3">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">CUSTOMER</h6>
                  <CustomerSearch
                    customers={allCustomers}
                    onSelectCustomer={handleSelectCustomer}
                    onAddNewCustomer={() => setShowCustomerModal(true)}
                  />

                  {/* Selected Customer Card */}
                  <div className="card bg-light border-0">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="fw-bold text-primary mb-1">
                            {selectedCustomerId ? "Registered" : "Walk-in"}
                          </div>
                          <div className="fw-bold">{selectedCustomerName}</div>
                          <small className="text-muted">
                            {selectedCustomerPhone === "0000000000"
                              ? "No Phone Number"
                              : selectedCustomerPhone}
                          </small>
                        </div>
                        {selectedCustomerId && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              setSelectedCustomerId(null);
                              setSelectedCustomerName("Walk-in Customer");
                              setSelectedCustomerPhone("0000000000");
                            }}
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Payment Summary</h6>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Subtotal</span>
                      <span className="fw-bold">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Tax (GST)</span>
                      <span className="fw-bold">₹{totalTax.toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between">
                      <span className="fs-5 fw-bold">Grand Total</span>
                      <span className="fs-4 fw-bold text-primary">
                        ₹{grandTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-end">
                      <small className="text-muted">{totalItems} items</small>
                    </div>
                  </div>

                  <h6 className="fw-bold mb-3">CHOOSE ACCOUNT</h6>
                  <div className="d-flex gap-2 mb-3">
                    {accounts.map((acc) => (
                      <button
                        key={acc._id}
                        className={`btn flex-fill ${
                          selectedAccountId === acc._id
                            ? "btn-primary"
                            : "btn-outline-primary"
                        }`}
                        onClick={() => setSelectedAccountId(acc._id)}
                        disabled={isProcessing}
                      >
                        <i
                          className={`bi ${
                            acc.type === "Cash"
                              ? "bi-cash-stack"
                              : acc.type === "Upi"
                              ? "bi-phone"
                              : "bi-credit-card"
                          } me-2`}
                        ></i>
                        {acc.type === "Upi" ? acc.upiAccountName : acc.type}
                      </button>
                    ))}
                  </div>

                  {selectedAccountId && (
                    <div className="alert alert-info py-2 mb-3">
                      <small>
                        <strong>Trial Balance: ₹</strong>
                        {accounts
                          .find((a) => a._id === selectedAccountId)
                          ?.currentBalance?.toFixed(2) || "0.00"}
                      </small>
                      <br />
                      <small>
                        <strong>Bal After: ₹</strong>
                        {(
                          (accounts.find((a) => a._id === selectedAccountId)
                            ?.currentBalance || 0) + grandTotal
                        ).toFixed(2)}
                      </small>
                    </div>
                  )}

                  <div className="d-flex gap-2 mb-3">
                    <button
                      className="btn btn-outline-secondary flex-fill"
                      onClick={clearTransaction}
                      disabled={isProcessing || cart.length === 0}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Clear
                    </button>
                    <button
                      className="btn btn-success flex-fill"
                      onClick={handlePayment}
                      disabled={
                        isProcessing || cart.length === 0 || !selectedAccountId
                      }
                    >
                      {isProcessing ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Pay ₹{grandTotal.toFixed(2)}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Keyboard Shortcuts */}
                  <div className="p-2 bg-light rounded">
                    <small className="text-muted d-block mb-1">
                      <strong>Shortcuts:</strong>
                    </small>
                    <div className="row g-1">
                      <div className="col-6">
                        <small className="text-muted">
                          <kbd>F1</kbd> Customer
                        </small>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">
                          <kbd>F2</kbd> Search
                        </small>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">
                          <kbd>F4</kbd> Clear
                        </small>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">
                          <kbd>F10</kbd> Pay
                        </small>
                      </div>
                    </div>
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
