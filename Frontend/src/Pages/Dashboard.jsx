import "../Styles/Dashboard.css";
import { useAuth } from "../Context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Dashboard sections go here */}
      </div>
    </div>
  );
};

export default Dashboard;
