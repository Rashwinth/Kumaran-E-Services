import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ReportFilters from "../../Components/Reports/ReportFilters";
import ReportStats from "../../Components/Reports/ReportStats";
import ReportTable from "../../Components/Reports/ReportTable";
import "../../Styles/Reports.css";
import axios from "axios";
import { useBranch } from "../../Context/BranchContext";
import { useAuth } from "../../Context/AuthContext";
import BackButton from "../../Components/BackButton";

const BranchReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { branches, getBranches } = useBranch();
  const { accessToken } = useAuth();

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalBills: 0,
    totalCustomers: 0,
  });

  const [filters, setFilters] = useState({
    type: "sales",
    dateRange: location.state?.dateRange || "this_month",
    branch: id, // Locked to this branch
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (location.state?.dateRange) {
      setFilters((prev) => ({
        ...prev,
        dateRange: location.state.dateRange,
      }));
    }
  }, [location.state]);

  const baseURL = `${import.meta.env.VITE_BACKEND_BASE_URI}/admin`;

  // Init branch info
  useEffect(() => {
    if (branches.length > 0) {
      const branch = branches.find((b) => b._id === id);
      if (branch) {
        setCurrentBranch(branch);
      } else {
        // Fallback if branch not found
        getBranches();
      }
    } else {
      getBranches();
    }
  }, [id, branches, getBranches]);

  useEffect(() => {
    fetchData();
  }, [accessToken, id]); // Refetch if token or branch ID changes

  const fetchData = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      // For branch report, we always fetch sales since performance is for all-branches view
      const response = await axios.get(`${baseURL}/sales`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.data.success) {
        const rawData = response.data.data.map((item) => ({
          date: item.dateStr || item.createdAt,
          billNumber: item.billNumber,
          rawBranchId: item.branchId,
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

        // Important: Filter data by current branch ID immediately
        const branchData = rawData.filter(
          (item) => String(item.rawBranchId) === String(id)
        );
        setData(branchData);
        applyFilters(branchData, filters);
      }
    } catch (error) {
      console.error("Error fetching branch report data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data.length >= 0) {
      applyFilters(data, filters);
    }
  }, [filters, data]);

  // const handleGenerate = () => {
  //   fetchData();
  // };

  const applyFilters = (sourceData, currentFilters) => {
    let result = [...sourceData];

    // Branch filter is implicitly handled by 'data' being already filtered in fetchData
    // But we keep the logic just in case sourceData changes
    if (currentFilters.branch !== "all") {
      result = result.filter(
        (item) => String(item.rawBranchId) === String(currentFilters.branch)
      );
    }

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

    setFilteredData(result);
    calculateStats(result);
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

  const displayData = filteredData.map((item) => ({
    ...item,
    branchName: currentBranch?.name || "Target Branch",
  }));

  return (
    <div className="reports-container">
      <div className="reports-header" style={{ marginBottom: "1.5rem" }}>
        <BackButton label="Back" />
        <div className="reports-title" style={{ marginTop: "1rem" }}>
          <h1>{currentBranch?.name || "Branch"} - Sales Report</h1>
          <p>Detailed performance analysis for this specific branch.</p>
        </div>
      </div>

      <ReportFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        // onGenerate={handleGenerate}
        branches={branches}
        hideBranchSelector={true}
        availableTypes={[{ value: "sales", label: "Sales Report" }]}
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          Loading branch data...
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

export default BranchReport;
