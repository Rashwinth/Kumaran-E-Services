import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "../../Context/AccountContext";
import "../../Styles/Accounts.css";

const AccountManagement = () => {
  const navigate = useNavigate();
  const { accounts, getAccounts, loading } = useAccount();
  const [historyModalAccount, setHistoryModalAccount] = useState(null);

  useEffect(() => {
    getAccounts();
  }, [getAccounts]);

  // Extract unique branches
  const branches = Array.from(
    new Map(accounts.map((acc) => [acc.branch._id, acc.branch])).values()
  );

  const getLatestBalance = (balanceHistory) => {
    if (!balanceHistory || balanceHistory.length === 0) return 0;
    return balanceHistory[balanceHistory.length - 1].closingBalance;
  };

  const calculateTotalByType = (branchAccounts, type) => {
    return branchAccounts
      .filter((acc) => acc.type === type)
      .reduce((sum, acc) => sum + getLatestBalance(acc.balanceHistory), 0);
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

  const handleMoreClick = (branchId) => {
    navigate(`/branch/${branchId}/accounts`);
  };

  const handleViewHistory = (branchId, type) => {
    // Find the first account matching branch and type
    const account = accounts.find(
      (acc) => acc.branch._id === branchId && acc.type === type
    );
    if (account) {
      setHistoryModalAccount(account);
    }
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
              View all branch accounts and balances
            </p>
          </div>
        </div>
      </div>

      {/* Branch-wise Stats */}
      <div className="branches-container">
        {branches.map((branch) => {
          const branchAccounts = accounts.filter(
            (acc) => acc.branch._id === branch._id
          );

          return (
            <div key={branch._id} className="branch-section">
              <div className="branch-section-header">
                <div className="branch-info">
                  <i className="bi bi-building"></i>
                  <h2 className="branch-name">
                    {branch.name}{" "}
                    <span className="branch-code">({branch.code})</span>
                  </h2>
                </div>
                <button
                  className="btn btn-outline-primary more-btn"
                  onClick={() => handleMoreClick(branch._id)}
                >
                  More Details
                  <i className="bi bi-arrow-right"></i>
                </button>
              </div>

              <div className="stats-grid">
                <div
                  className="stat-card stat-card-clickable"
                  onClick={() => handleViewHistory(branch._id, "Upi")}
                  title="Click to view history"
                >
                  <div className="stat-icon stat-icon-upi">
                    <i className="bi bi-phone-fill"></i>
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-title">
                      UPI ACCOUNTS
                      <i className="bi bi-clock-history history-indicator"></i>
                    </h3>
                    <div className="stat-amount">
                      {formatCurrency(
                        calculateTotalByType(branchAccounts, "Upi")
                      )}
                    </div>
                    <div className="stat-meta">
                      <span className="badge bg-primary">
                        {branchAccounts.filter((a) => a.type === "Upi").length}{" "}
                        Accounts
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="stat-card stat-card-clickable"
                  onClick={() => handleViewHistory(branch._id, "Cash")}
                  title="Click to view history"
                >
                  <div className="stat-icon stat-icon-cash">
                    <i className="bi bi-cash-stack"></i>
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-title">
                      CASH ACCOUNTS
                      <i className="bi bi-clock-history history-indicator"></i>
                    </h3>
                    <div className="stat-amount">
                      {formatCurrency(
                        calculateTotalByType(branchAccounts, "Cash")
                      )}
                    </div>
                    <div className="stat-meta">
                      <span className="badge bg-success">
                        {branchAccounts.filter((a) => a.type === "Cash").length}{" "}
                        Accounts
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="stat-card stat-card-clickable"
                  onClick={() => handleViewHistory(branch._id, "Credits")}
                  title="Click to view history"
                >
                  <div className="stat-icon stat-icon-credits">
                    <i className="bi bi-credit-card-fill"></i>
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-title">
                      CREDIT ACCOUNTS
                      <i className="bi bi-clock-history history-indicator"></i>
                    </h3>
                    <div className="stat-amount">
                      {formatCurrency(
                        calculateTotalByType(branchAccounts, "Credits")
                      )}
                    </div>
                    <div className="stat-meta">
                      <span className="badge bg-warning">
                        {
                          branchAccounts.filter((a) => a.type === "Credits")
                            .length
                        }{" "}
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
                          (sum, acc) =>
                            sum + getLatestBalance(acc.balanceHistory),
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
            </div>
          );
        })}
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
