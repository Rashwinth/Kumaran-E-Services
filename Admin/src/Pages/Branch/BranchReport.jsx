import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ReportFilters from "../../Components/Reports/ReportFilters";
import ReportStats from "../../Components/Reports/ReportStats";
import ReportTable from "../../Components/Reports/ReportTable";
import "../../Styles/Reports.css";
import axios from "axios";
import { useBranch } from "../../Context/BranchContext";
import { useAuth } from "../../Context/AuthContext";
import BackButton from "../../Components/BackButton";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const formatDateStr = (dateStr, format) => {
  if (!dateStr || !dateStr.includes("-")) return dateStr;
  const [y, m, d] = dateStr.split("-");
  if (format === "DD/MM/YYYY") return `${d}/${m}/${y}`;
  if (format === "MM/DD/YYYY") return `${m}/${d}/${y}`;
  return dateStr;
};

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
        const rawData = response.data.data.map((item) => {
          const createdDate = new Date(item.createdAt);
          const dateStr =
            item.dateStr || createdDate.toISOString().split("T")[0];

          return {
            id: item._id,
            date: dateStr,
            time: createdDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            billNumber: item.billNumber,
            rawBranchId: item.branchId,
            customerName: item.customer?.name || "Walk-in",
            customerPhone: item.customer?.phone || "N/A",
            paymentMethod:
              item.paymentMethod?.type +
              (item.paymentMethod?.upiAccountName
                ? ` (${item.paymentMethod.upiAccountName})`
                : ""),
            amount: item.grandTotal,
            status: item.status === "Completed" ? "Paid" : item.status,
            items: item.items || [],
            cgstTotal: item.totalTax
              ? Number((item.totalTax / 2).toFixed(2))
              : 0,
            sgstTotal: item.totalTax
              ? Number((item.totalTax - item.totalTax / 2).toFixed(2))
              : 0,
            totalTax: item.totalTax || 0,
          };
        });

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
    // Stats calculation based on unique bills to avoid double counting items
    const uniqueSales = Array.from(
      new Map(
        dataSet.map((item) => [item.id || item.billNumber, item])
      ).values()
    );
    const totalSales = uniqueSales.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );
    const uniqueCustomers = new Set(uniqueSales.map((i) => i.customerName))
      .size;
    setStats({
      totalSales,
      totalBills: uniqueSales.length,
      totalCustomers: uniqueCustomers,
    });
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const displayData = useMemo(() => {
    return filteredData.map((item) => ({
      ...item,
      branchName: currentBranch?.name || "Target Branch",
      formattedDate: formatDateStr(item.date, "DD/MM/YYYY"),
    }));
  }, [filteredData, currentBranch]);

  const handleExport = async () => {
    if (displayData.length === 0) {
      return alert("No data to export");
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Branch Sales Report");

    // Add Branch Info Header
    if (currentBranch) {
      const bNameRow = worksheet.addRow([currentBranch.name?.toUpperCase()]);
      bNameRow.font = { bold: true, size: 18 };
      worksheet.mergeCells(`A${bNameRow.number}:N${bNameRow.number}`);
      bNameRow.alignment = { horizontal: "center" };

      const bAddrRow = worksheet.addRow([
        `${currentBranch.address?.street || ""}, ${
          currentBranch.address?.city || ""
        }`,
      ]);
      bAddrRow.font = { size: 12 };
      worksheet.mergeCells(`A${bAddrRow.number}:N${bAddrRow.number}`);
      bAddrRow.alignment = { horizontal: "center" };

      const bContactRow = worksheet.addRow([
        `Contact: ${
          currentBranch.contactPhone || currentBranch.phone || "N/A"
        }`,
      ]);
      bContactRow.font = { size: 12 };
      worksheet.mergeCells(`A${bContactRow.number}:N${bContactRow.number}`);
      bContactRow.alignment = { horizontal: "center" };

      worksheet.addRow([]); // Spacer
    }

    // Define Base Columns
    const columns = [
      { header: "Bill Number", key: "billNo", width: 25 },
      { header: "Date", key: "date", width: 15 },
      { header: "Customer", key: "customerName", width: 20 },
      { header: "Phone", key: "customerPhone", width: 15 },
      { header: "Product Code", key: "sku", width: 15 },
      { header: "Product Name", key: "name", width: 30 },
      { header: "Qty", key: "qty", width: 10 },
      { header: "Rate", key: "price", width: 15 },
      { header: "Taxable Value", key: "taxableValue", width: 15 },
      { header: "CGST", key: "cgst", width: 12 },
      { header: "SGST", key: "sgst", width: 12 },
      { header: "Line Total", key: "lineTotal", width: 18 },
      { header: "Mode", key: "paymentMode", width: 15 },
      { header: "Status", key: "status", width: 12 },
    ];
    worksheet.columns = columns.map((c) => ({ key: c.key, width: c.width }));

    const addTableSection = (title, rowData) => {
      if (rowData.length === 0) return;

      const sTitleRow = worksheet.addRow([title]);
      sTitleRow.font = { bold: true, size: 16, color: { argb: "FF1F4E78" } };
      worksheet.mergeCells(`A${sTitleRow.number}:N${sTitleRow.number}`);
      sTitleRow.alignment = { horizontal: "center" };
      worksheet.addRow([]); // Spacer

      const headerRow = worksheet.addRow(columns.map((c) => c.header));
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 14 };
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4F81BD" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      rowData.forEach((row) => {
        const excelRow = worksheet.addRow(row);
        excelRow.font = { size: 13 };
        // Currency formatting for Rate(8), Taxable(9), CGST(10), SGST(11), Total(12)
        [8, 9, 10, 11, 12].forEach((colIndex) => {
          const cell = excelRow.getCell(colIndex);
          cell.numFmt = `"₹"#,##0.00`;
        });
        excelRow.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });
      worksheet.addRow([]);
      worksheet.addRow([]);
    };

    const inclusiveRows = [];
    const exclusiveRows = [];
    const nonGstRows = [];

    displayData.forEach((sale) => {
      (sale.items || []).forEach((p) => {
        const rowData = [
          sale.billNumber,
          sale.formattedDate,
          sale.customerName,
          sale.customerPhone,
          p.product?.sku || p.sku || "N/A",
          p.product?.name || p.name || "N/A",
          p.qty,
          p.price,
          p.taxableValue || p.lineTotal - p.taxAmount,
          p.taxAmount / 2,
          p.taxAmount - p.taxAmount / 2,
          p.lineTotal,
          sale.paymentMethod,
          sale.status,
        ];
        const gstType = p.product?.gstType || p.gstType;
        if (gstType === "Included") inclusiveRows.push(rowData);
        else if (gstType === "NotIncluded") exclusiveRows.push(rowData);
        else nonGstRows.push(rowData);
      });
    });

    addTableSection("=== GST INCLUSIVE SALES ===", inclusiveRows);
    addTableSection("=== GST EXCLUSIVE SALES ===", exclusiveRows);
    addTableSection("=== NON-GST / EXEMPT SALES ===", nonGstRows);

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      `${currentBranch?.name?.replace(/\s+/g, "_")}_Detailed_Report_${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );
  };

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
        onExport={handleExport}
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
