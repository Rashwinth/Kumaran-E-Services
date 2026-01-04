import React from "react";

const Loader = ({ message = "Processing..." }) => {
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center"
      style={{
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="position-relative">
        {/* Animated outer ring */}
        <div
          className="spinner-border text-primary"
          style={{
            width: "4rem",
            height: "4rem",
            borderWidth: "0.25rem",
            opacity: 0.8,
          }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>

        {/* Inner pulse effect */}
        <div
          className="position-absolute top-50 start-50 translate-middle rounded-circle bg-primary opacity-25"
          style={{
            width: "2.5rem",
            height: "2.5rem",
            animation: "pulse-custom 2s infinite ease-in-out",
          }}
        ></div>
      </div>

      <div className="mt-4 text-center">
        <h5
          className="fw-bold mb-1"
          style={{
            letterSpacing: "0.1em",
            background: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {message.toUpperCase()}
        </h5>

        <div className="d-flex gap-2 justify-content-center opacity-75">
          <span className="loader-dot bg-primary shadow-sm"></span>
          <span
            className="loader-dot bg-primary shadow-sm"
            style={{ animationDelay: "0.2s" }}
          ></span>
          <span
            className="loader-dot bg-primary shadow-sm"
            style={{ animationDelay: "0.4s" }}
          ></span>
        </div>
      </div>

      <style>{`
        @keyframes pulse-custom {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; }
          50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.5; }
        }
        .loader-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: dot-jump 1.4s infinite ease-in-out;
        }
        @keyframes dot-jump {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
