import { Navigate, Outlet } from "react-router-dom";
import LoadingPage from "../Components/Loading/LoadingPage";
import { useAuth } from "../Context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingPage />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />; // <-- IMPORTANT
};

export default ProtectedRoute;
