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
import { AuthProvider } from "./Context/AuthContext";
import LoadingPage from "./Components/Loading/LoadingPage";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import AddEmployee from "./Components/Employee/AddEmployee";
import Employee from "./Pages/Branch/Employee";
import ProtectedRoute from "./Modals/ProtectedRoute";

// Protected Route Component (fixed)

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
          {/* Public */}
          <Route path="/" element={<LoadingPage />} />
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/branch" element={<Branch />} />
            <Route path="/branch/:id" element={<BranchDetail />} />{" "}
            <Route path="/branch/:id/employee" element={<Employee />} />
            <Route
              path="/branch/:id/employee/add-employee"
              element={<AddEmployee />}
            />
            <Route path="/products" element={<Products />} />
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
