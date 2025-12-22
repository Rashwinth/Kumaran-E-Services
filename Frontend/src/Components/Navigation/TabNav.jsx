import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../../Styles/Navigation/TabNav.css";

const TabNav = () => {
  const location = useLocation();

  const tabs = [
    {
      id: "billing",
      label: " Billing",
      icon: "bi-receipt",
      path: "/billing",
    },
    {
      id: "product-catalog",
      label: "Product Catalog",
      icon: "bi-box-seam",
      path: "#product-catalog",
    },
    {
      id: "investors",
      label: "Investors",
      icon: "bi-briefcase",
      path: "#investors",
    },
    {
      id: "sale-history",
      label: "Sale History",
      icon: "bi-graph-up",
      path: "#sale-history",
    },
  ];

  return (
    <div className="tab-nav-wrapper">
      <div className="tab-nav-container">
        <div className="tab-list border-0">
          {tabs.map((tab) => {
            const isActive =
              location.pathname === tab.path ||
              (tab.path.startsWith("#") && window.location.hash === tab.path);
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`tab-button text-decoration-none transition-all ${
                  isActive ? "active" : ""
                }`}
                style={{
                  borderRadius: "12px 12px 0 0",
                  borderBottom: isActive
                    ? "3px solid #667eea"
                    : "3px solid transparent",
                }}
              >
                <i
                  className={`${tab.icon} nav-icon ${
                    isActive ? "text-primary" : ""
                  }`}
                ></i>
                <span className="nav-label">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TabNav;
