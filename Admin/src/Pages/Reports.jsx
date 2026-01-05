import { useState, useEffect } from "react";
import ReportFilters from "../Components/Reports/ReportFilters";
import ReportStats from "../Components/Reports/ReportStats";
import ReportTable from "../Components/Reports/ReportTable";
import "../Styles/Reports.css";
import axios from "axios";
import { useBranch } from "../Context/BranchContext";
import { useAuth } from "../Context/AuthContext";

const Reports = () => {
  const { branches, getBranches } = useBranch();
  const { accessToken } = useAuth();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalBills: 0,
    totalCustomers: 0,
  });

  const [filters, setFilters] = useState({
    type: "sales", // Always default to sales report
    dateRange: "this_month",
    branch: "all",
    startDate: "",
    endDate: "",
  });

  const baseURL = `${import.meta.env.VITE_BACKEND_BASE_URI}/admin`;

  useEffect(() => {
    fetchData(); // Load data on mount
    getBranches();
  }, [accessToken]); // Add accessToken dependency to retry fetch when token is available

  const fetchData = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      // Fetch sales data for both Sales Report and Branch Performance
      if (filters.type === "sales" || filters.type === "branch-performance") {
        const response = await axios.get(`${baseURL}/sales`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.data.success) {
          const rawData = response.data.data.map((item) => ({
            date: item.dateStr || item.createdAt, // Prioritize dateStr (YYYY-MM-DD) if available
            billNumber: item.billNumber,
            rawBranchId: item.branchId, // Store raw ID for mapping later
            customerName: item.customer?.name || "Walk-in",
            customerPhone: item.customer?.phone,
            paymentMethod:
              item.paymentMethod?.type +
              (item.paymentMethod?.upiAccountName
                ? ` (${item.paymentMethod.upiAccountName})`
                : ""),
            amount: item.grandTotal,
            status: item.status,
          }));
          setData(rawData);
          applyFilters(rawData, filters);
        }
      }
    } catch (error) {
      console.error("Error fetching report data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data.length > 0) {
      applyFilters(data, filters);
    }
  }, [filters, data]);

  const handleGenerate = () => {
    fetchData();
  };

  const applyFilters = (sourceData, currentFilters) => {
    let result = [...sourceData];

    // Branch Filter (using rawBranchId)
    // Only apply for Sales Report, NOT for Branch Performance (which compares all branches)
    if (
      currentFilters.type !== "branch-performance" &&
      currentFilters.branch !== "all"
    ) {
      // Ensure IDs are strictly converted to strings for comparison
      result = result.filter(
        (item) => String(item.rawBranchId) === String(currentFilters.branch)
      );
    }

    // Date Filter Logic
    const todayStart = new Date();
    // Date Filter Logic
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const checkDate = (itemDateStr) => {
      const d = new Date(itemDateStr);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    if (currentFilters.dateRange === "today") {
      result = result.filter(
        (item) => checkDate(item.date).getTime() === today.getTime()
      );
    } else if (currentFilters.dateRange === "yesterday") {
      result = result.filter(
        (item) => checkDate(item.date).getTime() === yesterday.getTime()
      );
    } else if (currentFilters.dateRange === "this_week") {
      const day = today.getDay();
      const diff = (day === 0 ? -6 : 1) - day;
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() + diff);
      weekStart.setHours(0, 0, 0, 0);
      result = result.filter((item) => checkDate(item.date) >= weekStart);
    } else if (currentFilters.dateRange === "last_week") {
      const day = today.getDay();
      const diffToLastMonday = (day === 0 ? -6 : 1) - day - 7;
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() + diffToLastMonday);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      result = result.filter((item) => {
        const d = checkDate(item.date);
        return d >= weekStart && d <= weekEnd;
      });
    } else if (currentFilters.dateRange === "this_month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      result = result.filter((item) => checkDate(item.date) >= monthStart);
    } else if (currentFilters.dateRange === "last_month") {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      result = result.filter((item) => {
        const d = checkDate(item.date);
        return d >= start && d <= end;
      });
    } else if (currentFilters.dateRange === "custom") {
      if (currentFilters.startDate && currentFilters.endDate) {
        const start = new Date(currentFilters.startDate);
        const end = new Date(currentFilters.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        result = result.filter((item) => {
          const d = checkDate(item.date);
          return d >= start && d <= end;
        });
      } else {
        result = [];
      }
    }

    // If Branch Performance, Aggregate Data by Branch
    if (currentFilters.type === "branch-performance") {
      const branchGroups = {};

      result.forEach((sale) => {
        const bId = sale.rawBranchId;
        if (!branchGroups[bId]) {
          branchGroups[bId] = {
            rawBranchId: bId, // Keep for mapping name later
            totalSales: 0,
            totalBills: 0,
            billNumbers: [], // Optional
          };
        }
        branchGroups[bId].totalSales += sale.amount || 0;
        branchGroups[bId].totalBills += 1;
      });

      // Convert back to array
      result = Object.values(branchGroups);
    }

    setFilteredData(result);

    // Stats calc needs full sales list for totals, even if view is grouped
    // But for Branch perf view, stats should reflect total sales of all branches in view
    if (currentFilters.type === "branch-performance") {
      const totalSales = result.reduce((acc, b) => acc + b.totalSales, 0);
      const totalBills = result.reduce((acc, b) => acc + b.totalBills, 0);
      setStats({
        totalSales,
        totalBills,
        totalCustomers: 0, // Hard to count unique across branches aggregated
      });
    } else {
      calculateStats(result);
    }
  };

  const calculateStats = (dataSet) => {
    const totalSales = dataSet.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );
    const uniqueCustomers = new Set(dataSet.map((i) => i.customerName)).size;
    setStats({
      totalSales,
      totalBills: dataSet.length,
      totalCustomers: uniqueCustomers,
    });
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Map branch names for display
  const displayData = filteredData.map((item) => ({
    ...item,
    branchName:
      branches.find((b) => b._id === item.rawBranchId)?.name ||
      "Unknown Branch",
  }));

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div className="reports-title">
          <h1>Reports & Analytics</h1>
          <p>Generate comprehensive reports for your business performance.</p>
        </div>
      </div>

      <ReportFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onGenerate={handleGenerate}
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          Loading data...
        </div>
      ) : (
        <>
          <ReportStats stats={stats} />
          <ReportTable data={displayData} reportType={filters.type} />
        </>
      )}
    </div>
  );
};

export default Reports;
