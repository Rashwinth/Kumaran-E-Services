import React from "react";

const SaleHistoryTable = ({ data, onViewSale, currencySymbol = "₹" }) => {
  return (
    <div className="bg-white rounded-4 shadow-sm border border-secondary border-opacity-10 overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light">
            <tr>
              <th className="py-3 ps-4 text-muted small fw-bold text-uppercase border-0">
                Bill No
              </th>
              <th className="py-3 text-muted small fw-bold text-uppercase border-0">
                Date & Time
              </th>
              <th className="py-3 text-muted small fw-bold text-uppercase border-0">
                Customer
              </th>
              <th
                className="py-3 text-muted small fw-bold text-uppercase border-0"
                style={{ minWidth: "200px" }}
              >
                Products
              </th>
              <th className="py-3 text-center text-muted small fw-bold text-uppercase border-0">
                Items
              </th>
              <th className="py-3 text-end text-muted small fw-bold text-uppercase border-0">
                Total Amount
              </th>
              <th className="py-3 text-center text-muted small fw-bold text-uppercase border-0">
                Mode
              </th>
              <th className="py-3 text-center text-muted small fw-bold text-uppercase border-0">
                Status
              </th>
              <th className="py-3 text-end pe-4 text-muted small fw-bold text-uppercase border-0">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((sale) => (
                <tr key={sale.id}>
                  <td className="ps-4 fw-bold text-primary">#{sale.billNo}</td>
                  <td>
                    <div className="d-flex flex-column">
                      <span className="fw-bold text-dark small">
                        {sale.formattedDate}
                      </span>
                      <small
                        className="text-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {sale.time}
                      </small>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex flex-column">
                      <span className="fw-bold text-dark small">
                        {sale.customerName}
                      </span>
                      <small
                        className="text-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {sale.customerPhone}
                      </small>
                    </div>
                  </td>
                  <td>
                    <div
                      className="d-flex flex-wrap gap-1"
                      style={{ maxWidth: "300px" }}
                    >
                      {sale.products?.map((p, idx) => (
                        <div
                          key={idx}
                          className="small text-muted bg-light px-2 py-0 rounded border w-100 text-truncate"
                          title={`${p.sku} - ${p.name}`}
                        >
                          <span className="fw-bold text-dark">{p.sku}</span> -{" "}
                          {p.name}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-light text-dark border">
                      {sale.itemsCount}
                    </span>
                  </td>
                  <td className="text-end fw-bold text-dark">
                    {currencySymbol}
                    {sale.amount.toFixed(2)}
                  </td>
                  <td className="text-center">
                    <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-10">
                      {sale.paymentMode}
                    </span>
                  </td>
                  <td className="text-center">
                    <span
                      className={`badge ${
                        sale.status === "Paid"
                          ? "bg-success bg-opacity-10 text-success border border-success border-opacity-10"
                          : sale.status === "Cancelled"
                          ? "bg-danger bg-opacity-10 text-danger border border-danger border-opacity-10"
                          : "bg-warning bg-opacity-10 text-warning border border-warning border-opacity-10"
                      }`}
                    >
                      {sale.status}
                    </span>
                  </td>
                  <td className="text-end pe-4">
                    <button
                      className="btn btn-sm btn-light border me-2"
                      onClick={() => onViewSale(sale)}
                      title="View Details"
                    >
                      <i className="bi bi-eye text-primary"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-light border"
                      title="Print Invoice"
                    >
                      <i className="bi bi-printer text-secondary"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-5">
                  <div className="d-flex flex-column align-items-center opacity-50">
                    <i className="bi bi-folder2-open display-4 mb-2"></i>
                    <p className="mb-0">No sales found matching your filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SaleHistoryTable;
