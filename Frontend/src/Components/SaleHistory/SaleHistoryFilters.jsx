import React, { useState } from "react";

const SaleHistoryFilters = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className="bg-white p-3 rounded-4 shadow-sm border border-secondary border-opacity-10 mb-4">
      <div className="row g-3">
        {/* Search */}
        <div className="col-md-4">
          <label className="form-label small text-muted fw-bold">Search</label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0 ps-0"
              placeholder="Detailed Search..."
              value={filters.search}
              onChange={(e) => onFilterChange("search", e.target.value)}
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="col-md-3">
          <label className="form-label small text-muted fw-bold">
            Start Date
          </label>
          <input
            type="date"
            className="form-control bg-light"
            value={filters.startDate}
            onChange={(e) => onFilterChange("startDate", e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label small text-muted fw-bold">
            End Date
          </label>
          <input
            type="date"
            className="form-control bg-light"
            value={filters.endDate}
            onChange={(e) => onFilterChange("endDate", e.target.value)}
          />
        </div>

        <div className="col-md-2 d-flex align-items-end">
          <button
            className="btn btn-light w-100 fw-bold text-danger border"
            onClick={onReset}
          >
            <i className="bi bi-arrow-counterclockwise me-2"></i>
            Reset
          </button>
        </div>

        {/* Payment Mode */}
        <div className="col-md-3">
          <label className="form-label small text-muted fw-bold">
            Payment Mode
          </label>
          <select
            className="form-select bg-light"
            value={filters.paymentMode}
            onChange={(e) => onFilterChange("paymentMode", e.target.value)}
          >
            <option value="All">All Modes</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Credit">Credit</option>
          </select>
        </div>

        {/* Status */}
        <div className="col-md-3">
          <label className="form-label small text-muted fw-bold">Status</label>
          <select
            className="form-select bg-light"
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="col-md-3">
          <label className="form-label small text-muted fw-bold">Sort By</label>
          <select
            className="form-select bg-light"
            value={filters.sortBy}
            onChange={(e) => onFilterChange("sortBy", e.target.value)}
          >
            <option value="Newest">Newest First</option>
            <option value="Oldest">Oldest First</option>
            <option value="Highest">Highest Amount</option>
            <option value="Lowest">Lowest Amount</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SaleHistoryFilters;
