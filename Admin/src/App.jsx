import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// Pages
import Login from "./Pages/User/Login";
import Dashboard from "./Pages/Dashboard";
import Branch from "./Pages/Branch/Branch";
import BranchDetail from "./Pages/Branch/BranchDetail";
import Products from "./Pages/Products";

// Context

import LoadingPage from "./Components/Loading/LoadingPage";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
// import AddEmployee from "./Components/Employee/AddEmployee";
import Employee from "./Pages/Branch/Employee";
import ProtectedRoute from "./Modals/ProtectedRoute";
import BranchProducts from "./Pages/Branch/BranchProducts";
import AddEmployeeModal from "./Components/Employee/AddEmployee";
import AccountManagement from "./Pages/Branch/Accounts";
import BranchAccountDetail from "./Pages/Branch/BranchAccountDetail";

// Protected Route Component (fixed)

import ScrollToTop from "./Components/ScrollToTop";

// Layout wrapper to conditionally show Header
const Layout = ({ children }) => {
  const location = useLocation();
  const noHeaderRoutes = ["/", "/login", "/register"];

  const hideHeader = noHeaderRoutes.includes(location.pathname);

  return (
    <>
      {!hideHeader && <Header />}
      <div className="main-content">{children}</div>
      {!hideHeader && <Footer />}
    </>
  );
};

function AppContent() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <ToastContainer position="top-right" autoClose={3000} theme="light" />

        <Routes>
          {/* Public */}
          <Route path="/" element={<LoadingPage />} />
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Brabch Routes */}
            <Route path="/branch" element={<Branch />} />
            <Route path="/branch/:id" element={<BranchDetail />} />

            {/* Employee route */}
            <Route path="/branch/:id/employee" element={<Employee />} />

            {/* product Route */}
            <Route path="/products" element={<Products />} />
            <Route path="/branch/:id/products" element={<BranchProducts />} />

            {/* Accounts Route */}
            <Route
              path="/branch/:id/accounts"
              element={<BranchAccountDetail />}
            />
            <Route path="/accounts" element={<AccountManagement />} />
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
    const handleWheel = () => {
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
