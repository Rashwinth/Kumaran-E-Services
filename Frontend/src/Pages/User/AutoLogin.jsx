import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import Powered from "../../Components/Loading/Powered";
import "../../Styles/Connection.css"; // Reuse connection styling

import { getDecrypted } from "../../utils/storage";

const AutoLogin = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("Verifying branch credentials...");

  useEffect(() => {
    const performAutoLogin = async () => {
      try {
        const branch = getDecrypted("branch");
        const branchCode = branch ? branch.code : null;
        const branchToken = localStorage.getItem("branchToken");

        if (!branchCode || !branchToken) {
          setStatus("error");
          setMessage("No branch registered. Redirecting to setup...");
          setTimeout(() => navigate("/branch-login"), 2000);
          return;
        }

        // Simulating validation of branch credentials
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setStatus("success");
        setMessage(
          `Branch ${branchCode} Verified! Redirecting to staff login...`
        );

        setTimeout(() => navigate("/login"), 1500);
      } catch (error) {
        console.error("Auto-login error:", error);
        setStatus("error");
        setMessage("Branch authentication failed.");
        setTimeout(() => navigate("/branch-login"), 2000);
      }
    };

    performAutoLogin();
  }, [navigate]);

  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="loading-icon-wrapper">
          {status === "verifying" && (
            <Loader2 className="loading-spinner" size={64} />
          )}
          {status === "success" && (
            <ShieldCheck className="success-icon" size={64} color="#10b981" />
          )}
          {status === "error" && (
            <AlertCircle className="error-icon" size={64} color="#ef4444" />
          )}
        </div>

        <h1 className="loading-title">
          {status === "verifying" && "Authenticating Branch"}
          {status === "success" && "Branch Verified"}
          {status === "error" && "Access Denied"}
        </h1>

        <p className="loading-message">{message}</p>

        {status === "verifying" && (
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>

      <div className="loading-powered">
        <Powered theme="dark" />
      </div>
    </div>
  );
};

export default AutoLogin;
