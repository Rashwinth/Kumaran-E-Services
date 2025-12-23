import React from "react";

const BillingCart = ({ cart, onUpdateQty, onUpdateDiscount, onRemoveItem }) => {
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

  return (
    <div className="flex-grow-1 overflow-auto">
      <div
        className="table-responsive"
        style={{ maxHeight: "calc(100vh - 400px)" }}
      >
        <table className="table table-sm table-hover">
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
                <td colSpan="9" className="text-center text-muted py-5">
                  <i className="bi bi-cart-x fs-1 d-block mb-2"></i>
                  Cart is empty. Start scanning or searching products.
                </td>
              </tr>
            ) : (
              cartWithTotals.map((item, idx) => (
                <tr key={item._id} style={{ height: "60px" }}>
                  <td className="align-middle">{idx + 1}</td>
                  <td className="align-middle">
                    <div className="fw-bold">{item.name}</div>
                    <small className="text-secondary">#{item.sku}</small>
                  </td>
                  <td className="align-middle text-center">
                    <span className="badge bg-info">{item.gst}%</span>
                  </td>
                  <td className="align-middle text-end">₹{item.mrp}</td>
                  <td className="align-middle text-end">₹{item.price}</td>
                  <td className="align-middle">
                    <div className="d-flex align-items-center justify-content-center gap-1">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => onUpdateQty(item._id, -1)}
                        disabled={item.qty <= 1}
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                      <span className="fw-bold px-2">{item.qty}</span>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => onUpdateQty(item._id, 1)}
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
                        onUpdateDiscount(item._id, e.target.value)
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
                      onClick={() => onRemoveItem(item._id)}
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

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="border-top pt-3 px-3">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Subtotal ({totalItems} items)</span>
            <span className="fw-bold">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Tax (GST)</span>
            <span className="fw-bold">₹{totalTax.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between border-top pt-2">
            <span className="fs-5 fw-bold">Grand Total</span>
            <span className="fs-4 fw-bold text-primary">
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingCart;
