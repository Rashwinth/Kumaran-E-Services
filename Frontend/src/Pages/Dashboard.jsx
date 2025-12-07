import "../Styles/Dashboard.css";
import { useAuth } from "../Context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name?.split(" ")[0] || "User"}! 👋</h1>
          <p>Here's what's happening with your account today.</p>
        </div>

        {/* Dashboard sections go here */}
      </div>
    </div>
  );
};

export default Dashboard;
