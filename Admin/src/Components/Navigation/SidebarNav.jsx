import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { toast } from "react-toastify";

const SidebarNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "bi-speedometer2",
      path: "/dashboard",
    },
    {
      id: "branch",
      label: "Manage Branches",
      icon: "bi-building",
      path: "/branch",
    },
    {
      id: "products",
      label: "Manage Products",
      icon: "bi-box-seam",
      path: "/products",
    },
    {
      id: "accounts",
      label: "Manage Accounts",
      icon: "bi-bank2",
      path: "/accounts",
    },
    {
      id: "report",
      label: "Sales Report",
      icon: "bi-clipboard-data",
      path: "/report",
    },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <>
      <div
        className={`sidebar-nav d-flex flex-column text-white shadow-lg transition-all ${
          sidebarOpen ? "open" : "closed"
        }`}
        style={{
          width: sidebarOpen ? "280px" : "80px",
          minWidth: sidebarOpen ? "280px" : "80px",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 10,
          background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
          overflowX: "hidden",
          overflowY: "auto",
          height: "100%",
          position: "relative",
          boxShadow: "4px 0 15px rgba(0,0,0,0.1) !important",
        }}
      >
        {/* Header Toggle Section */}
        <div
          className="d-flex align-items-center justify-content-end"
          style={{ height: "70px", padding: "0 15px" }}
        >
          <button
            className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center shadow-sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              width: "34px",
              height: "34px",
              color: "white",
              backgroundColor: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              transition: "all 0.3s ease",
              marginRight: sidebarOpen ? "0" : "8px",
            }}
          >
            <i
              className={`bi ${
                sidebarOpen
                  ? "bi-chevron-double-left"
                  : "bi-chevron-double-right"
              } fs-6`}
            ></i>
          </button>
        </div>

        {/* Small Menu Title */}
        <div
          className={`mb-3 transition-all ${
            sidebarOpen ? "px-4" : "text-center"
          }`}
          style={{ marginTop: "10px" }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: "800",
              letterSpacing: "1.2px",
              color: "rgba(255,255,255,0.45)",
              textTransform: "uppercase",
            }}
          >
            {sidebarOpen ? "Admin Console" : "MENU"}
          </span>
        </div>

        {/* Navigation List */}
        <nav className="px-2">
          <ul className="nav flex-column gap-2">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path.startsWith("#") &&
                  window.location.hash === item.path);
              return (
                <li key={item.id} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link d-flex align-items-center rounded-3 transition-all px-0 ${
                      isActive ? "bg-white shadow" : "text-white"
                    }`}
                    style={{
                      height: "54px",
                      backgroundColor: isActive ? "white" : "transparent",
                      color: isActive ? "#000000" : "#ffffff",
                      opacity: isActive ? 1 : 0.85,
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor =
                          "rgba(255, 255, 255, 0.1)";
                        e.currentTarget.style.opacity = "1";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.opacity = "0.85";
                      }
                    }}
                  >
                    {/* Fixed Icon Container - exactly 80px/sidebar width minus padding to center the icon */}
                    <div
                      className="d-flex justify-content-center align-items-center"
                      style={{ width: "64px", minWidth: "64px", flexShrink: 0 }}
                    >
                      <i
                        className={`bi ${item.icon} ${
                          isActive ? "fs-4" : "fs-5"
                        }`}
                      ></i>
                    </div>

                    {/* Menu Label */}
                    <span
                      style={{
                        opacity: sidebarOpen ? 1 : 0,
                        visibility: sidebarOpen ? "visible" : "hidden",
                        fontSize: "0.95rem",
                        fontWeight: isActive ? "700" : "500",
                        transition: "all 0.3s ease",
                        marginLeft: "4px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label}
                    </span>

                    {/* Active Indicator Pin */}
                    {isActive && sidebarOpen && (
                      <div className="ms-auto me-3">
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: "#764ba2",
                          }}
                        ></div>
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto p-3 w-100">
          <button
            className="btn w-100 d-flex align-items-center rounded-3 text-white"
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "none",
              height: "50px",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              paddingLeft: sidebarOpen ? "20px" : "0",
            }}
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right fs-5"></i>
            {sidebarOpen && <span className="ms-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none"
        style={{
          display: sidebarOpen ? "block" : "none",
          zIndex: 850,
        }}
        onClick={() => setSidebarOpen(false)}
      ></div>
    </>
  );
};

export default SidebarNav;
