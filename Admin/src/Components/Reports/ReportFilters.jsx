import { useBranch } from "../../Context/BranchContext";
import { useEffect } from "react";

const ReportFilters = ({
  filters,
  onFilterChange,
  hideBranchSelector = false,
  availableTypes = [
    { value: "sales", label: "Sales Report" },
    { value: "branch-performance", label: "Branch Performance" },
  ],
}) => {
  const { branches, getBranches } = useBranch();

  useEffect(() => {
    getBranches();
  }, [getBranches]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  return (
    <div className="report-filters">
      <div className="filter-group">
        <label>Report Type</label>
        <select
          name="type"
          value={filters.type}
          onChange={handleChange}
          className="filter-input"
        >
          {availableTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Date Range</label>
        <select
          name="dateRange"
          value={filters.dateRange}
          onChange={handleChange}
          className="filter-input"
        >
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="this_week">This Week</option>
          <option value="last_week">Last Week</option>
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {filters.dateRange === "custom" && (
        <>
          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
              className="filter-input"
            />
          </div>
        </>
      )}

      {filters.type !== "branch-performance" && !hideBranchSelector && (
        <div className="filter-group">
          <label>Branch</label>
          <select
            name="branch"
            value={filters.branch}
            onChange={handleChange}
            className="filter-input"
          >
            <option value="all">All Branches</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>
      )}

    </div>
  );
};

export default ReportFilters;
