import React from "react";

const SaleHistoryStats = ({ data }) => {
  const totalSales = data.reduce((sum, item) => sum + item.amount, 0);
  const totalTransactions = data.length;
  const averageValue =
    totalTransactions > 0 ? totalSales / totalTransactions : 0;

  return (
    <div className="row g-3 mb-4">
      {/* Total Sales */}
      <div className="col-md-4">
        <div className="bg-white p-3 rounded-4 shadow-sm border border-secondary border-opacity-10 d-flex align-items-center gap-3">
          <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-4">
            <i className="bi bi-currency-rupee fs-4"></i>
          </div>
          <div>
            <p className="text-muted small mb-1 fw-bold text-uppercase">
              Total Revenue
            </p>
            <h4 className="fw-bold mb-0 text-dark">
              ₹{totalSales.toLocaleString()}
            </h4>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="col-md-4">
        <div className="bg-white p-3 rounded-4 shadow-sm border border-secondary border-opacity-10 d-flex align-items-center gap-3">
          <div className="bg-success bg-opacity-10 text-success p-3 rounded-4">
            <i className="bi bi-receipt fs-4"></i>
          </div>
          <div>
            <p className="text-muted small mb-1 fw-bold text-uppercase">
              Transactions
            </p>
            <h4 className="fw-bold mb-0 text-dark">{totalTransactions}</h4>
          </div>
        </div>
      </div>

      {/* Average Bill */}
      <div className="col-md-4">
        <div className="bg-white p-3 rounded-4 shadow-sm border border-secondary border-opacity-10 d-flex align-items-center gap-3">
          <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-4">
            <i className="bi bi-graph-up-arrow fs-4"></i>
          </div>
          <div>
            <p className="text-muted small mb-1 fw-bold text-uppercase">
              Avg. Bill Value
            </p>
            <h4 className="fw-bold mb-0 text-dark">
              ₹{averageValue.toFixed(0)}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleHistoryStats;
