import React from "react";

const PaymentPanel = ({
  accounts,
  selectedAccountId,
  onAccountChange,
  onPayment,
  onClear,
  grandTotal,
  isProcessing,
  disabled,
}) => {
  return (
    <div className="border-top pt-3 px-3 pb-3">
      <h6 className="fw-bold mb-3">Payment Method</h6>
      <div className="d-flex gap-2 mb-3">
        {accounts.map((acc) => (
          <button
            key={acc._id}
            className={`btn flex-fill ${
              selectedAccountId === acc._id
                ? "btn-primary"
                : "btn-outline-primary"
            }`}
            onClick={() => onAccountChange(acc._id)}
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

      <div className="d-flex gap-2">
        <button
          className="btn btn-outline-secondary flex-fill"
          onClick={onClear}
          disabled={isProcessing || disabled}
        >
          <i className="bi bi-x-circle me-2"></i>
          Clear (F4)
        </button>
        <button
          className="btn btn-success flex-fill"
          onClick={onPayment}
          disabled={isProcessing || disabled || !selectedAccountId}
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
              Pay ₹{grandTotal.toFixed(2)} (F10)
            </>
          )}
        </button>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="mt-3 p-2 bg-light rounded">
        <small className="text-muted d-block mb-1">
          <strong>Keyboard Shortcuts:</strong>
        </small>
        <div className="row g-1">
          <div className="col-6">
            <small className="text-muted">
              <kbd>F1</kbd> Add Customer
            </small>
          </div>
          <div className="col-6">
            <small className="text-muted">
              <kbd>F2</kbd> Focus Search
            </small>
          </div>
          <div className="col-6">
            <small className="text-muted">
              <kbd>F4</kbd> Clear Cart
            </small>
          </div>
          <div className="col-6">
            <small className="text-muted">
              <kbd>F10</kbd> Pay Now
            </small>
          </div>
          <div className="col-12">
            <small className="text-muted">
              <kbd>↑</kbd> <kbd>↓</kbd> Navigate • <kbd>Enter</kbd> Select •{" "}
              <kbd>Esc</kbd> Close
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPanel;
