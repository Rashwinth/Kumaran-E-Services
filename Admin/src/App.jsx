import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
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
import { AuthProvider, useAuth } from "./Context/AuthContext";
import LoadingPage from "./Components/Loading/LoadingPage";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import AddEmployee from "./Components/Branch_Components/AddEmployee";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

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
      <Layout>
        <ToastContainer position="top-right" autoClose={3000} theme="light" />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoadingPage />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/branch"
            element={
              <ProtectedRoute>
                <Branch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/branch/:id"
            element={
              <ProtectedRoute>
                <BranchDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/branch/:id/add-employee"
            element={
              <ProtectedRoute>
                <AddEmployee />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
