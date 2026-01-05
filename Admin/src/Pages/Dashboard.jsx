import "../Styles/Dashboard.css";
import { useAuth } from "../Context/AuthContext";
import { useBranch } from "../Context/BranchContext";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const { user, accessToken } = useAuth();
  const { branches, getBranches } = useBranch();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBranches();
    fetchDashboardStats();
  }, [getBranches]);

  const fetchDashboardStats = async () => {
    try {
      if (!accessToken) return;
      const baseURL = `${import.meta.env.VITE_BACKEND_BASE_URI}/admin`;
      const response = await axios.get(`${baseURL}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const trendData = stats?.revenueTrend?.map((item) => ({
    name: item.date.split("-").slice(1).join("/"), // MM/DD
    revenue: item.revenue,
  }));

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Analyzing your business data...</p>
          </div>
        ) : (
          <>
            {/* Top Summary Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon blue">
                  <i className="bi bi-people"></i>
                </div>
                <div className="stat-info">
                  <h3>Total Customers</h3>
                  <p className="stat-value">{stats?.totalUsers || 0}</p>
                  <span
                    className={`stat-change ${
                      (stats?.userGrowth || 0) >= 0 ? "positive" : "negative"
                    }`}
                  >
                    {stats?.userGrowth > 0 ? "+" : ""}
                    {stats?.userGrowth?.toFixed(1) || 0}% from last month
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">
                  <i className="bi bi-cash-stack"></i>
                </div>
                <div className="stat-info">
                  <h3>Total Revenue</h3>
                  <p className="stat-value">
                    {formatCurrency(stats?.totalRevenue)}
                  </p>
                  <span
                    className={`stat-change ${
                      (stats?.revenueGrowth || 0) >= 0 ? "positive" : "negative"
                    }`}
                  >
                    {stats?.revenueGrowth > 0 ? "+" : ""}
                    {stats?.revenueGrowth?.toFixed(1) || 0}% from last month
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple">
                  <i className="bi bi-receipt"></i>
                </div>
                <div className="stat-info">
                  <h3>Total Bills</h3>
                  <p className="stat-value">{stats?.totalBills || 0}</p>
                  <span
                    className={`stat-change ${
                      (stats?.billsGrowth || 0) >= 0 ? "positive" : "negative"
                    }`}
                  >
                    {stats?.billsGrowth > 0 ? "+" : ""}
                    {stats?.billsGrowth?.toFixed(1) || 0}% from last month
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">
                  <i className="bi bi-shop"></i>
                </div>
                <div className="stat-info">
                  <h3>Today's Sales</h3>
                  <p className="stat-value">
                    {formatCurrency(stats?.todayTotalRevenue)}
                  </p>
                  <span className="stat-change neutral">
                    {stats?.todayTotalBills} bills today
                  </span>
                </div>
              </div>
            </div>

            <div className="dashboard-main-grid">
              {/* Today's Performance Section */}
              <div className="dashboard-card performance-card">
                <div className="card-header">
                  <h2>Today's Performance</h2>
                </div>
                <div className="performance-split-container">
                  <div className="revenue-table-container">
                    <table className="revenue-table">
                      <thead>
                        <tr>
                          <th>Branch</th>
                          <th>Revenue</th>
                          <th>Bills</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.branchStats?.length > 0 ? (
                          stats.branchStats.map((branch) => (
                            <tr key={branch.id}>
                              <td>
                                <Link
                                  to={`/branch/${branch.id}/report`}
                                  state={{ dateRange: "today" }}
                                  className="text-decoration-none fw-semibold"
                                >
                                  {branch.name}
                                </Link>
                              </td>
                              <td className="revenue-amount">
                                {formatCurrency(branch.revenue)}
                              </td>
                              <td>{branch.bills}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center">
                              No transactions yet today
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="payment-split-section">
                    <h6>Payment Mode Split (Today)</h6>
                    <div className="payment-progress-bar">
                      <div
                        className="progress-segment cash"
                        style={{
                          width: `${
                            (stats?.paymentSplit?.Cash /
                              (stats?.todayTotalRevenue || 1)) *
                            100
                          }%`,
                        }}
                      ></div>
                      <div
                        className="progress-segment online"
                        style={{
                          width: `${
                            (stats?.paymentSplit?.Online /
                              (stats?.todayTotalRevenue || 1)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="payment-legend">
                      <div className="legend-item">
                        <span className="dot cash"></span> Cash{" "}
                        {formatCurrency(stats?.paymentSplit?.Cash)}
                      </div>
                      <div className="legend-item">
                        <span className="dot online"></span> Online{" "}
                        {formatCurrency(stats?.paymentSplit?.Online)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Trend Chart */}
              <div className="dashboard-card chart-card">
                <div className="card-header">
                  <h2>Revenue Trend (Last 7 Days)</h2>
                </div>
                <div
                  className="chart-container"
                  style={{
                    height: "300px",
                    minHeight: "300px",
                    marginTop: "1rem",
                  }}
                >
                  {trendData && trendData.length > 0 ? (
                    <ResponsiveContainer width="99%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient
                            id="colorRev"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#6366f1"
                              stopOpacity={0.1}
                            />
                            <stop
                              offset="95%"
                              stopColor="#6366f1"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f0f0f0"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#64748b" }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#64748b" }}
                          tickFormatter={(value) =>
                            `₹${
                              value >= 1000
                                ? (value / 1000).toFixed(1) + "k"
                                : value
                            }`
                          }
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                          formatter={(value) => [
                            formatCurrency(value),
                            "Revenue",
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#6366f1"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorRev)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                      No trend data available for this week
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>Recent Sales</h2>
                  <Link to="/report" className="view-all-button">
                    All
                  </Link>
                </div>
                <div className="transaction-list">
                  {stats?.recentTransactions?.length > 0 ? (
                    stats.recentTransactions.map((tx, idx) => (
                      <div key={idx} className="transaction-item">
                        <div className="tx-details">
                          <p className="tx-bill">{tx.billNumber}</p>
                          <p className="tx-branch">{tx.branch}</p>
                        </div>
                        <div className="tx-stats">
                          <p className="tx-amount">
                            {formatCurrency(tx.amount)}
                          </p>
                          <p className="tx-customer">{tx.customer}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-center py-3">
                      No recent sales
                    </p>
                  )}
                </div>
              </div>

              {/* Low Stock Alerts */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>Inventory Alerts</h2>
                  <span className="badge bg-danger rounded-pill">
                    {stats?.lowStockCount || 0}
                  </span>
                </div>
                <div className="low-stock-list">
                  {stats?.lowStockItems?.length > 0 ? (
                    stats.lowStockItems.map((item, idx) => (
                      <div key={idx} className="low-stock-item">
                        <div className="item-info">
                          <p className="item-name">{item.name}</p>
                          <p className="item-branch">{item.branch}</p>
                        </div>
                        <div className="item-qty">
                          <span className="qty-value text-danger">
                            {item.qty}
                          </span>
                          <span className="qty-label">pcs</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-center py-3">All clear!</p>
                  )}
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>Top Products (Month)</h2>
                </div>
                <div className="top-products-list">
                  {stats?.topProducts?.length > 0 ? (
                    stats.topProducts.map((item, idx) => (
                      <div key={idx} className="product-rank-item">
                        <div className="product-info">
                          <p className="product-name">{item.name}</p>
                          <p className="product-sales">{item.qty} units sold</p>
                        </div>
                        <div className="product-revenue">
                          {formatCurrency(item.revenue)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-center py-3">
                      No sales data yet
                    </p>
                  )}
                </div>
              </div>

              {/* Top Performing Staff */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>Staff Rankings</h2>
                </div>
                <div className="staff-leaderboard">
                  {stats?.topStaff?.length > 0 ? (
                    stats.topStaff.map((staff, idx) => (
                      <div key={idx} className="staff-item">
                        <div className="staff-rank">{idx + 1}</div>
                        <div className="staff-info">
                          <p className="staff-name">{staff.name}</p>
                          <p className="staff-bills">{staff.bills} bills</p>
                        </div>
                        <div className="staff-revenue">
                          {formatCurrency(staff.revenue)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-center py-3">
                      No active staff this month
                    </p>
                  )}
                </div>
              </div>

              {/* branch Shortcuts (Premium Square Grid) */}
              <div className="dashboard-card quick-actions-card">
                <div className="card-header">
                  <h2>Branch Shortcuts</h2>
                </div>
                {branches?.length > 0 ? (
                  branches.map((branch) => (
                    <div key={branch._id} className="branch-group mb-4">
                      <h6 className="text-muted small fw-bold text-uppercase mb-3">
                        {branch.name}
                      </h6>
                      <div className="quick-actions-grid branch-actions-grid">
                        <Link
                          to={`/branch/${branch._id}/products`}
                          className="qa-item"
                          title="Inventory & Products"
                        >
                          <div className="qa-icon bg-soft-blue">
                            <i className="bi bi-box-seam"></i>
                          </div>
                          <span>Products</span>
                        </Link>
                        <Link
                          to={`/branch/${branch._id}/employee`}
                          className="qa-item"
                          title="Staff Management"
                        >
                          <div className="qa-icon bg-soft-green">
                            <i className="bi bi-people"></i>
                          </div>
                          <span>Employees</span>
                        </Link>
                        <Link
                          to={`/branch/${branch._id}/accounts`}
                          className="qa-item"
                          title="Account & Billing"
                        >
                          <div className="qa-icon bg-soft-purple">
                            <i className="bi bi-bank"></i>
                          </div>
                          <span>Accounts</span>
                        </Link>
                        <Link
                          to={`/branch/${branch._id}/report`}
                          className="qa-item"
                          title="Sales Reports"
                        >
                          <div className="qa-icon bg-soft-orange">
                            <i className="bi bi-bar-chart-line"></i>
                          </div>
                          <span>Reports</span>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted small text-center w-100 py-3">
                    No active branches
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
