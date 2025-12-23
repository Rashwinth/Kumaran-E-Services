import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";

const CustomerModal = ({ isOpen, onClose, onCustomerAdded, accessToken }) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      return toast.warning("Name and Phone are required!");
    }

    if (customerPhone.length !== 10) {
      return toast.warning("Phone number must be 10 digits!");
    }

    setIsSaving(true);
    try {
      const res = await axios.post(
        API_ENDPOINTS.CUSTOMERS,
        {
          name: customerName.trim(),
          phone: customerPhone.trim(),
          city: customerCity.trim() || "N/A",
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (res.data.success) {
        toast.success("Customer added successfully!");
        onCustomerAdded(res.data.data);
        handleClose();
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      toast.error(error.response?.data?.message || "Failed to save customer");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setCustomerName("");
    setCustomerPhone("");
    setCustomerCity("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-dark bg-opacity-50"
      style={{ zIndex: 2000 }}
      onClick={handleClose}
    >
      <div
        className="card shadow-lg p-4"
        style={{ width: "400px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="mb-3 fw-bold">Add New Customer</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold">
              Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              required
              autoFocus
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">
              Phone <span className="text-danger">*</span>
            </label>
            <input
              type="tel"
              className="form-control"
              value={customerPhone}
              onChange={(e) =>
                setCustomerPhone(e.target.value.replace(/\D/g, ""))
              }
              placeholder="10-digit phone number"
              maxLength="10"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">City</label>
            <input
              type="text"
              className="form-control"
              value={customerCity}
              onChange={(e) => setCustomerCity(e.target.value)}
              placeholder="Enter city (optional)"
            />
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary flex-fill"
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-fill"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Saving...
                </>
              ) : (
                "Save Customer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
