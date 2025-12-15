import React, { useRef } from "react";

const BarcodeInput = ({
  value,
  onChange,
  placeholder = "Scan or enter SKU",
  ...props
}) => {
  const inputRef = useRef(null);

  const handleFocus = () => {
    inputRef.current?.focus();
    inputRef.current?.select();
  };

  const handleKeyDown = (e) => {
    // Physical scanners send 'Enter' after the code
    if (e.key === "Enter") {
      e.preventDefault();
      // Blur to simulate "done" state, so user feels the transaction is complete
      inputRef.current?.blur();
    }
  };

  return (
    <div
      className="barcode-input-container"
      style={{ position: "relative", width: "100%" }}
    >
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          {...props}
          style={{ paddingRight: "40px", width: "100%", flex: 1 }}
        />

        {/* Focus Button - This IS the "Scan Icon" equivalent for a physical scanner */}
        <button
          type="button"
          onClick={handleFocus}
          title="Click to Focus for Scanning"
          style={{
            background: "#e2e8f0",
            border: "1px solid #cbd5e0",
            borderRadius: "0.375rem",
            cursor: "pointer",
            color: "#4a5568",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 10px",
            height: "42px",
          }}
        >
          {/* Barcode Icon */}
          <i
            className="bi bi-qr-code-scan"
            style={{
              width: "40",
              height: "24",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "1",
            }}
          ></i>
        </button>
      </div>
    </div>
  );
};

export default BarcodeInput;
