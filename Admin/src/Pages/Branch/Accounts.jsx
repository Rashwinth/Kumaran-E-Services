import { useState } from "react";
import "../../Styles/Accounts.css";

const AccountManagement = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [historyModalAccount, setHistoryModalAccount] = useState(null);

  // Hard-coded data
  const accounts = [
    {
      _id: "1",
      type: "Upi",
      branch: { _id: "b1", name: "Main Branch", code: "MB001" },
      balanceHistory: [
        { date: "2024-12-01", openingBalance: 50000, closingBalance: 52000 },
        { date: "2024-12-05", openingBalance: 52000, closingBalance: 54500 },
        { date: "2024-12-10", openingBalance: 54500, closingBalance: 58200 },
      ],
      status: "Active",
      createdAt: "2024-01-15",
    },
    {
      _id: "2",
      type: "Cash",
      branch: { _id: "b1", name: "Main Branch", code: "MB001" },
      balanceHistory: [
        { date: "2024-12-01", openingBalance: 100000, closingBalance: 98500 },
        { date: "2024-12-05", openingBalance: 98500, closingBalance: 102000 },
        { date: "2024-12-10", openingBalance: 102000, closingBalance: 105300 },
      ],
      status: "Active",
      createdAt: "2024-01-15",
    },
    {
      _id: "3",
      type: "Credits",
      branch: { _id: "b2", name: "East Branch", code: "EB002" },
      balanceHistory: [
        { date: "2024-12-01", openingBalance: 75000, closingBalance: 73000 },
        { date: "2024-12-05", openingBalance: 73000, closingBalance: 71500 },
        { date: "2024-12-10", openingBalance: 71500, closingBalance: 69800 },
      ],
      status: "Active",
      createdAt: "2024-02-20",
    },
    {
      _id: "4",
      type: "Upi",
      branch: { _id: "b2", name: "East Branch", code: "EB002" },
      balanceHistory: [
        { date: "2024-12-01", openingBalance: 45000, closingBalance: 47000 },
        { date: "2024-12-05", openingBalance: 47000, closingBalance: 49200 },
      ],
      status: "Active",
      createdAt: "2024-03-10",
    },
    {
      _id: "5",
      type: "Cash",
      branch: { _id: "b3", name: "West Branch", code: "WB003" },
      balanceHistory: [
        { date: "2024-12-01", openingBalance: 80000, closingBalance: 78000 },
      ],
      status: "Inactive",
      createdAt: "2024-04-05",
    },
  ];

  // Extract unique branches
  const branches = Array.from(
    new Map(accounts.map((acc) => [acc.branch._id, acc.branch])).values()
  );

  const [selectedBranch, setSelectedBranch] = useState(
    branches[0]?._id || null
  );

  const getLatestBalance = (balanceHistory) => {
    if (!balanceHistory || balanceHistory.length === 0) return 0;
    return balanceHistory[balanceHistory.length - 1].closingBalance;
  };

  const getBalanceChange = (balanceHistory) => {
    if (!balanceHistory || balanceHistory.length < 2) return 0;
    const latest = balanceHistory[balanceHistory.length - 1].closingBalance;
    const previous = balanceHistory[balanceHistory.length - 2].closingBalance;
    return latest - previous;
  };

  // Filter accounts by selected branch first, then by type
  const branchAccounts = accounts.filter(
    (acc) => acc.branch._id === selectedBranch
  );

  const calculateTotalByType = (type) => {
    return branchAccounts
      .filter((acc) => acc.type === type)
      .reduce((sum, acc) => sum + getLatestBalance(acc.balanceHistory), 0);
  };

  const filteredAccounts =
    activeFilter === "All"
      ? branchAccounts
      : branchAccounts.filter((acc) => acc.type === activeFilter);

  const getTypeIcon = (type) => {
    switch (type) {
      case "Upi":
        return "bi-phone-fill";
      case "Cash":
        return "bi-cash-stack";
      case "Credits":
        return "bi-credit-card-fill";
      default:
        return "bi-wallet2";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="account-container">
      {/* Header */}
      <div className="account-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="header-title">
              <i className="bi bi-wallet2"></i>
              Account Management
            </h1>
            <p className="header-subtitle">
              Manage all your branch accounts and balances
            </p>
          </div>
          <div className="branch-switcher">
            <label className="branch-switcher-label">
              <i className="bi bi-building"></i>
              Select Branch
            </label>
            <select
              className="branch-switcher-select"
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                setActiveFilter("All");
              }}
            >
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name} ({branch.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-upi">
            <i className="bi bi-phone-fill"></i>
          </div>
          <div className="stat-info">
            <h3 className="stat-title">UPI ACCOUNTS</h3>
            <div className="stat-amount">
              {formatCurrency(calculateTotalByType("Upi"))}
            </div>
            <div className="stat-meta">
              <span className="badge bg-primary">
                {branchAccounts.filter((a) => a.type === "Upi").length} Accounts
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-cash">
            <i className="bi bi-cash-stack"></i>
          </div>
          <div className="stat-info">
            <h3 className="stat-title">CASH ACCOUNTS</h3>
            <div className="stat-amount">
              {formatCurrency(calculateTotalByType("Cash"))}
            </div>
            <div className="stat-meta">
              <span className="badge bg-success">
                {branchAccounts.filter((a) => a.type === "Cash").length}{" "}
                Accounts
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-credits">
            <i className="bi bi-credit-card-fill"></i>
          </div>
          <div className="stat-info">
            <h3 className="stat-title">CREDIT ACCOUNTS</h3>
            <div className="stat-amount">
              {formatCurrency(calculateTotalByType("Credits"))}
            </div>
            <div className="stat-meta">
              <span className="badge bg-warning">
                {branchAccounts.filter((a) => a.type === "Credits").length}{" "}
                Accounts
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-total">
            <i className="bi bi-graph-up-arrow"></i>
          </div>
          <div className="stat-info">
            <h3 className="stat-title">TOTAL BALANCE</h3>
            <div className="stat-amount">
              {formatCurrency(
                branchAccounts.reduce(
                  (sum, acc) => sum + getLatestBalance(acc.balanceHistory),
                  0
                )
              )}
            </div>
            <div className="stat-meta">
              <span className="badge bg-info">
                {branchAccounts.length} Total Accounts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Section */}
      <div className="accounts-section">
        <div className="section-header">
          <h2 className="section-title">
            <i className="bi bi-list-ul"></i>
            All Accounts
          </h2>
          <div className="filter-tabs">
            {["All", "Upi", "Cash", "Credits"].map((filter) => (
              <button
                key={filter}
                className={`btn filter-btn ${
                  activeFilter === filter
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Accounts Grid */}
        <div className="accounts-grid">
          {filteredAccounts.map((account) => {
            const latestBalance = getLatestBalance(account.balanceHistory);
            const balanceChange = getBalanceChange(account.balanceHistory);
            const changePercent =
              account.balanceHistory.length >= 2
                ? (
                    (balanceChange /
                      account.balanceHistory[account.balanceHistory.length - 2]
                        .closingBalance) *
                    100
                  ).toFixed(2)
                : 0;

            return (
              <div key={account._id} className="account-card">
                <div className="account-card-header">
                  <div className="account-card-left">
                    <div
                      className={`account-icon account-icon-${account.type.toLowerCase()}`}
                    >
                      <i className={getTypeIcon(account.type)}></i>
                    </div>
                    <div>
                      <h3 className="account-type">{account.type}</h3>
                      <p className="branch-name">
                        <i className="bi bi-building"></i>
                        {account.branch.name} ({account.branch.code})
                      </p>
                    </div>
                  </div>
                  <div className="account-card-right">
                    <span
                      className={`badge bg-${
                        account.status === "Active"
                          ? "success"
                          : account.status === "Inactive"
                          ? "warning"
                          : "danger"
                      }`}
                    >
                      {account.status}
                    </span>
                  </div>
                </div>

                <div className="account-balance">
                  <div className="balance-label">Current Balance</div>
                  <div className="balance-amount">
                    {formatCurrency(latestBalance)}
                  </div>
                  {balanceChange !== 0 && (
                    <div
                      className={`balance-change ${
                        balanceChange > 0 ? "positive" : "negative"
                      }`}
                    >
                      <i
                        className={`bi bi-arrow-${
                          balanceChange > 0 ? "up" : "down"
                        }-circle-fill`}
                      ></i>
                      {formatCurrency(Math.abs(balanceChange))} ({changePercent}
                      %)
                    </div>
                  )}
                </div>

                <div className="account-footer">
                  <span className="account-date">
                    <i className="bi bi-calendar-plus"></i>
                    Created: {formatDate(account.createdAt)}
                  </span>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setHistoryModalAccount(account)}
                  >
                    View History
                    <i className="bi bi-clock-history"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History Modal */}
      {historyModalAccount && (
        <div
          className="history-modal-overlay"
          onClick={() => setHistoryModalAccount(null)}
        >
          <div className="history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="history-modal-header">
              <h3 className="history-modal-title">
                <i className="bi bi-clock-history"></i>
                Balance History
              </h3>
              <button
                className="history-modal-close"
                onClick={() => setHistoryModalAccount(null)}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>

            <div className="history-modal-body">
              <div className="history-account-info">
                <div className="history-account-type">
                  <div
                    className={`history-account-icon account-icon-${historyModalAccount.type.toLowerCase()}`}
                  >
                    <i className={getTypeIcon(historyModalAccount.type)}></i>
                  </div>
                  <h4 className="history-account-name">
                    {historyModalAccount.type} Account
                  </h4>
                </div>
                <p className="history-branch-name">
                  <i className="bi bi-building"></i>
                  {historyModalAccount.branch.name} (
                  {historyModalAccount.branch.code})
                </p>
              </div>

              <div className="history-list">
                {historyModalAccount.balanceHistory
                  .slice()
                  .reverse()
                  .map((history, idx) => (
                    <div key={idx} className="history-item">
                      <div className="history-date">
                        <i className="bi bi-calendar-date"></i>
                        {formatDate(history.date)}
                      </div>
                      <div className="history-balances">
                        <div className="history-balance">
                          <span className="history-label">Opening:</span>
                          <span className="history-value">
                            {formatCurrency(history.openingBalance)}
                          </span>
                        </div>
                        <div className="history-balance">
                          <span className="history-label">Closing:</span>
                          <span className="history-value history-value-bold">
                            {formatCurrency(history.closingBalance)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;
