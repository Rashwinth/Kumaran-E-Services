import React from "react";
// import "../../Styles/MonthYearFilter.css"; // Optional: Add styles if needed

const MonthYearFilter = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  onReset,
}) => {
  const months = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  // Generate years from 2024 to current year + 1
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2024 + 2 },
    (_, i) => 2024 + i
  );

  return (
    <div
      className="month-year-filter"
      style={{ display: "flex", gap: "10px", alignItems: "center" }}
    >
      <select
        value={selectedMonth}
        onChange={(e) => onMonthChange(parseInt(e.target.value))}
        className="glass-input"
        style={{ width: "auto", minWidth: "120px" }}
      >
        <option value="-1">All Months</option>
        {months.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      <select
        value={selectedYear}
        onChange={(e) => onYearChange(parseInt(e.target.value))}
        className="glass-input"
        style={{ width: "auto", minWidth: "100px" }}
      >
        <option value="-1">All Years</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      {onReset && (
        <button
          onClick={onReset}
          className="btn-icon"
          title="Reset to current month"
          style={{
            background: "transparent",
            border: "1px solid #ccc",
            color: "#6c757d",
            width: "35px",
            height: "35px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            borderRadius: "8px",
          }}
        >
          <i className="bi bi-arrow-counterclockwise"></i>
        </button>
      )}
    </div>
  );
};

export default MonthYearFilter;
