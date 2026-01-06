import React from "react";

const SaleHistoryDetailModal = ({
  isOpen,
  onClose,
  sale,
  currencySymbol = "₹",
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !sale) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
      }}
    >
      <div
        className="bg-white rounded-4 shadow-lg overflow-hidden"
        style={{
          width: "90%",
          maxWidth: "700px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center bg-light">
          <div>
            <h5 className="mb-0 fw-bold text-dark">Transaction Details</h5>
            <small className="text-muted">
              {sale.billNo} • {sale.formattedDate} {sale.time}
            </small>
          </div>
          <button onClick={onClose} className="btn btn-close"></button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-auto">
          {/* Summary Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="p-3 bg-light rounded-3 border">
                <small
                  className="text-muted fw-bold text-uppercase d-block mb-1"
                  style={{ fontSize: "0.7rem" }}
                >
                  Customer Info
                </small>
                <div className="fw-bold text-dark">{sale.customerName}</div>
                <div className="small text-muted">{sale.customerPhone}</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-3 bg-light rounded-3 border">
                <small
                  className="text-muted fw-bold text-uppercase d-block mb-1"
                  style={{ fontSize: "0.7rem" }}
                >
                  Payment Info
                </small>
                <div className="d-flex justify-content-between">
                  <span className="text-secondary small">Mode:</span>
                  <span className="fw-bold text-dark">{sale.paymentMode}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-secondary small">Status:</span>
                  <span
                    className={`badge ${
                      sale.status === "Paid"
                        ? "bg-success text-success bg-opacity-10"
                        : sale.status === "Cancelled"
                        ? "bg-danger text-danger bg-opacity-10"
                        : "bg-warning text-warning bg-opacity-10"
                    }`}
                  >
                    {sale.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <h6 className="fw-bold mb-3 border-bottom pb-2">Product Summary</h6>
          <div className="table-responsive mb-3">
            <table className="table table-sm table-bordered">
              <thead className="bg-light">
                <tr>
                  <th className="small text-muted py-2">Item Name</th>
                  <th
                    className="small text-muted py-2 text-center"
                    style={{ width: "80px" }}
                  >
                    Qty
                  </th>
                  <th
                    className="small text-muted py-2 text-end"
                    style={{ width: "100px" }}
                  >
                    Price
                  </th>
                  <th
                    className="small text-muted py-2 text-end"
                    style={{ width: "100px" }}
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {sale.products && sale.products.length > 0 ? (
                  sale.products.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="fw-bold small">{item.name}</div>
                        <small
                          className="text-muted"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {item.sku}
                        </small>
                      </td>
                      <td className="text-center align-middle">{item.qty}</td>
                      <td className="text-end align-middle">
                        {currencySymbol}
                        {item.price.toFixed(2)}
                      </td>
                      <td className="text-end align-middle fw-bold">
                        {currencySymbol}
                        {(item.lineTotal || item.price * item.qty).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center text-muted small py-3"
                    >
                      No product details available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div className="d-flex justify-content-end">
            <div style={{ width: "250px" }}>
              <div className="d-flex justify-content-between mb-1">
                <small className="text-muted">Taxable Value:</small>
                <small className="fw-bold">
                  {currencySymbol}
                  {((sale.amount || 0) - (sale.totalTax || 0)).toFixed(2)}
                </small>
              </div>
              {sale.cgstTotal > 0 && (
                <div className="d-flex justify-content-between mb-1">
                  <small className="text-muted">CGST:</small>
                  <small className="fw-bold">
                    {currencySymbol}
                    {sale.cgstTotal.toFixed(2)}
                  </small>
                </div>
              )}
              {sale.sgstTotal > 0 && (
                <div className="d-flex justify-content-between mb-1">
                  <small className="text-muted">SGST:</small>
                  <small className="fw-bold">
                    {currencySymbol}
                    {sale.sgstTotal.toFixed(2)}
                  </small>
                </div>
              )}
              <div className="d-flex justify-content-between mb-1 border-top pt-1">
                <small className="text-muted">Total GST:</small>
                <small className="fw-bold">
                  {currencySymbol}
                  {sale.totalTax.toFixed(2)}
                </small>
              </div>
              <div className="d-flex justify-content-between pt-2 border-top mt-2">
                <span className="fw-bold text-dark">Grand Total:</span>
                <span className="fw-bold text-primary fs-5">
                  {currencySymbol}
                  {sale.amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-light border-top d-flex justify-content-end gap-2">
          <button onClick={onClose} className="btn btn-light border px-4">
            Close
          </button>
          <button className="btn btn-primary px-4 d-flex align-items-center gap-2">
            <i className="bi bi-printer"></i> Print Bill
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleHistoryDetailModal;
