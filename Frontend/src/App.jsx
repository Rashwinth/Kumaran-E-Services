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
import Register from "./Pages/User/Register";
import Dashboard from "./Pages/Dashboard";
import BranchLogin from "./Pages/Branch/BranchLogin";
import AutoLogin from "./Pages/User/AutoLogin";

// Context
import { AuthProvider, useAuth } from "./Context/AuthContext";
import LoadingPage from "./Components/Loading/LoadingPage";
import Header from "./Components/Header";
import Footer from "./Components/Footer";

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
  const noHeaderRoutes = [
    "/",
    "/login",
    "/register",
    "/branch-login",
    "/auto-login",
  ];

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
        <ToastContainer
          position="top-center"
          autoClose={1000}
          theme="dark"
          hideProgressBar
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoadingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/branch-login" element={<BranchLogin />} />
          <Route path="/auto-login" element={<AutoLogin />} />

          {/* Protected Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
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
