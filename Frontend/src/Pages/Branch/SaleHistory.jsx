import React, { useState, useMemo } from "react";
import SaleHistoryStats from "../../Components/SaleHistory/SaleHistoryStats";
import SaleHistoryFilters from "../../Components/SaleHistory/SaleHistoryFilters";
import SaleHistoryTable from "../../Components/SaleHistory/SaleHistoryTable";
import SaleHistoryDetailModal from "../../Components/SaleHistory/SaleHistoryDetailModal";

// Hardcoded Mock Data
const MOCK_DATA = [
  {
    id: 1,
    billNo: "BILL-1001",
    date: "2024-03-15",
    time: "10:30 AM",
    customerName: "Ragu Ram",
    customerPhone: "9876543210",
    itemsCount: 3,
    amount: 1250.0,
    paymentMode: "Cash",
    status: "Paid",
    products: [
      { name: "Wireless Mouse", sku: "ACC-001", qty: 1, price: 450.0 },
      { name: "USB Cable 1m", sku: "CAB-003", qty: 2, price: 150.0 },
      { name: "Screen Cleaner", sku: "ACC-005", qty: 1, price: 500.0 },
    ],
  },
  {
    id: 2,
    billNo: "BILL-1002",
    date: "2026-01-01",
    time: "11:15 AM",
    customerName: "Priya Sharma",
    customerPhone: "8765432109",
    itemsCount: 5,
    amount: 2450.5,
    paymentMode: "UPI",
    status: "Paid",
    products: [
      { name: "Bluetooth Headset", sku: "AUD-101", qty: 1, price: 1200.0 },
      { name: "Phone Case (iPhone)", sku: "CAS-202", qty: 1, price: 800.0 },
      { name: "Type-C Adapter", sku: "ADP-303", qty: 3, price: 150.17 },
    ],
  },
  {
    id: 3,
    billNo: "BILL-1003",
    date: "2024-03-14",
    time: "02:45 PM",
    customerName: "Walk-in Customer",
    customerPhone: "N/A",
    itemsCount: 1,
    amount: 150.0,
    paymentMode: "Cash",
    status: "Paid",
    products: [
      { name: "Micro USB Cable", sku: "CAB-001", qty: 1, price: 150.0 },
    ],
  },
  {
    id: 4,
    billNo: "BILL-1004",
    date: "2024-03-14",
    time: "04:20 PM",
    customerName: "Senthil Kumar",
    customerPhone: "9988776655",
    itemsCount: 8,
    amount: 5600.0,
    paymentMode: "Card",
    status: "Paid",
    products: [
      { name: "Mechanical Keyboard", sku: "ACC-009", qty: 1, price: 3500.0 },
      { name: "Gaming Mouse", sku: "ACC-010", qty: 1, price: 2100.0 },
    ],
  },
  {
    id: 5,
    billNo: "BILL-1005",
    date: "2024-03-13",
    time: "09:10 AM",
    customerName: "Anitha Raj",
    customerPhone: "7766554433",
    itemsCount: 2,
    amount: 850.0,
    paymentMode: "UPI",
    status: "Cancelled",
    products: [
      { name: "Power Bank 10000mAh", sku: "PWR-505", qty: 1, price: 850.0 },
    ],
  },
  {
    id: 6,
    billNo: "BILL-1006",
    date: "2024-03-12",
    time: "06:30 PM",
    customerName: "David John",
    customerPhone: "9080706050",
    itemsCount: 12,
    amount: 12400.0,
    paymentMode: "Credit",
    status: "Pending",
    products: [
      { name: "24-inch Monitor", sku: "DIS-001", qty: 1, price: 11000.0 },
      { name: "HDMI Cable", sku: "CAB-005", qty: 2, price: 700.0 },
    ],
  },
  {
    id: 7,
    billNo: "BILL-1007",
    date: "2024-03-12",
    time: "01:20 PM",
    customerName: "Lakshmi Narayanan",
    customerPhone: "9123456780",
    itemsCount: 4,
    amount: 2100.0,
    paymentMode: "Cash",
    status: "Paid",
    products: [
      { name: "Router", sku: "NET-001", qty: 1, price: 1800.0 },
      { name: "LAN Cable 5m", sku: "CAB-101", qty: 2, price: 150.0 },
    ],
  },
  {
    id: 8,
    billNo: "BILL-1008",
    date: "2024-03-11",
    time: "11:00 AM",
    customerName: "Mohamed Ali",
    customerPhone: "8976543210",
    itemsCount: 6,
    amount: 3200.0,
    paymentMode: "UPI",
    status: "Paid",
    products: [
      { name: "External HDD Case", sku: "STO-001", qty: 2, price: 600.0 },
      { name: "500GB SSD", sku: "STO-005", qty: 1, price: 2600.0 },
    ],
  },
];

const SaleHistory = () => {
  const [filters, setFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
    paymentMode: "All",
    status: "All",
    sortBy: "Newest",
  });

  const [selectedSale, setSelectedSale] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: "",
      startDate: "",
      endDate: "",
      paymentMode: "All",
      status: "All",
      sortBy: "Newest",
    });
  };

  const handleViewSale = (sale) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  // Filter Logic
  const filteredData = useMemo(() => {
    return MOCK_DATA.filter((item) => {
      // Search
      const matchesSearch =
        item.billNo.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.customerName
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        item.customerPhone.includes(filters.search);

      // Payment Mode
      const matchesMode =
        filters.paymentMode === "All" ||
        item.paymentMode === filters.paymentMode;

      // Status
      const matchesStatus =
        filters.status === "All" || item.status === filters.status;

      // Date Range (Basic String Comparison for YYYY-MM-DD)
      const matchesStart = !filters.startDate || item.date >= filters.startDate;
      const matchesEnd = !filters.endDate || item.date <= filters.endDate;

      return (
        matchesSearch &&
        matchesMode &&
        matchesStatus &&
        matchesStart &&
        matchesEnd
      );
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case "Oldest":
          return (
            new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`)
          );
        case "Highest":
          return b.amount - a.amount;
        case "Lowest":
          return a.amount - b.amount;
        case "Newest":
        default:
          return (
            new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`)
          );
      }
    });
  }, [filters]);

  return (
    <div
      className="p-4"
      style={{ height: "calc(100vh - 65px)", overflowY: "auto" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Sale History</h2>
          <p className="text-muted small mb-0">
            View and manage past transactions
          </p>
        </div>
        <div>
          <button className="btn btn-outline-primary btn-sm rounded-pill px-3">
            <i className="bi bi-download me-2"></i>Export Report
          </button>
        </div>
      </div>

      <SaleHistoryStats data={filteredData} />

      <SaleHistoryFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      <SaleHistoryTable data={filteredData} onViewSale={handleViewSale} />

      <SaleHistoryDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sale={selectedSale}
      />
    </div>
  );
};

export default SaleHistory;
