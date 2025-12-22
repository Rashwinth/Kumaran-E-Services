import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// Pages
import Login from "./Pages/User/Login";
import BranchLogin from "./Pages/Branch/BranchLogin";
import AutoLogin from "./Pages/User/AutoLogin";
import ProductBilling from "./Pages/Billing/productBilling";
import LoadingPage from "./Components/Loading/LoadingPage";

// Components
import Footer from "./Components/Footer";
import SidebarNav from "./Components/Navigation/SidebarNav";
import TabNav from "./Components/Navigation/TabNav";
import ScrollToTop from "./Components/ScrollToTop";

// Context
import { useAuth } from "./Context/AuthContext";

// Style

// Protected Route Component
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Layout wrapper to conditionally show Header and Sidebar
const Layout = ({ children }) => {
  const location = useLocation();
  const noHeaderRoutes = [
    "/",
    "/login",
    "/register",
    "/branch-login",
    "/auto-login",
  ];

  const hideHeader = noHeaderRoutes.includes(location.pathname);

  // If we should hide the header, we just return the children (login pages)
  if (hideHeader) {
    return <div className="main-content">{children}</div>;
  }

  // Otherwise, return the full app layout with Sidebar, Header, and TabNav
  return (
    <div className="app-container">
      <div className="app-main-layout">
        <SidebarNav />
        <div className="main-content-area">
          <div className="content-viewport">{children}</div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

function AppContent() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <ToastContainer position="top-right" autoClose={3000} theme="light" />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoadingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/branch-login" element={<BranchLogin />} />
          <Route path="/auto-login" element={<AutoLogin />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/billing" element={<ProductBilling />} />
            {/* Add more protected routes here */}
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <>
      <GlobalScrollFix />
      <AppContent />
    </>
  );
}

const GlobalScrollFix = () => {
  useEffect(() => {
    const handleWheel = (e) => {
      if (document.activeElement.type === "number") {
        document.activeElement.blur();
      }
    };

    document.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      document.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return null;
};

export default App;
