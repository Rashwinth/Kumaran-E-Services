import React from "react";

const BackButton = ({ label = "Back", style }) => {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <button
      onClick={handleBack}
      className="back-button"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "none",
        border: "none",
        color: "var(--text-secondary, #64748b)",
        fontSize: "0.95rem",
        fontWeight: "500",
        cursor: "pointer",
        padding: "8px 0",
        transition: "color 0.2s ease",
        ...style,
      }}
      onMouseEnter={(e) =>
        (e.target.style.color = "var(--primary-color, #3b82f6)")
      }
      onMouseLeave={(e) =>
        (e.target.style.color = "var(--text-secondary, #64748b)")
      }
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19 12H5M5 12L12 19M5 12L12 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </button>
  );
};

export default BackButton;
