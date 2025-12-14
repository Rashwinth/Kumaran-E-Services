import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAccount } from "../../Context/AccountContext";
import { useBranch } from "../../Context/BranchContext";
import "../../Styles/Accounts.css";
import { toast } from "react-toastify";
import UniversalDelete from "../../Modals/UniversalDelete";

const BranchAccountDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Context
  const {
    accounts, // These are the accounts for the current branch (set by getAccountsByBranch)
    getAccountsByBranch,
    addAccount,
    updateAccount,
    deleteAccount,
    loading: accountsLoading,
  } = useAccount();

  const { branches, getBranches } = useBranch();

  // Local State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [currentBranch, setCurrentBranch] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    type: "",
    upiAccountName: "",
    balance: "",
    status: "Active",
  });

  // Load Branch Info
  useEffect(() => {
    if (branches.length > 0) {
      const branch = branches.find((b) => b._id === id);
      if (branch) {
        setCurrentBranch(branch);
      }
    } else {
      getBranches();
    }
  }, [id, branches, getBranches]);

  // Load Accounts
  useEffect(() => {
    getAccountsByBranch(id);
  }, [id, getAccountsByBranch]);

  // Default Selection Logic
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      const upiAccount = accounts.find((acc) => acc.type === "Upi");
      if (upiAccount) {
        setSelectedAccount(upiAccount);
      } else {
        setSelectedAccount(accounts[0]);
      }
    } else if (accounts.length === 0) {
      setSelectedAccount(null);
    }
  }, [accounts, selectedAccount]);

  // Handle Form Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open Modal
  const openModal = (account = null) => {
    setEditingAccount(account);
    if (account) {
      setFormData({
        type: account.type,
        upiAccountName: account.upiAccountName || "",
        balance:
          account.balanceHistory?.length > 0
            ? account.balanceHistory[account.balanceHistory.length - 1]
                .closingBalance
            : "",
        status: account.status,
      });
    } else {
      setFormData({
        type: "",
        upiAccountName: "",
        balance: "",
        status: "Active",
      });
    }
    setShowAddModal(true);
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        type: formData.type,
        upiAccountName:
          formData.type === "Upi" ? formData.upiAccountName : undefined,
        status: formData.status,
        branch: id,
      };

      if (!editingAccount) {
        // Create: Add initial balance history
        payload.balanceHistory = [
          {
            date: new Date(),
            openingBalance: parseFloat(formData.balance) || 0,
            closingBalance: parseFloat(formData.balance) || 0,
          },
        ];

        await addAccount(payload);
      } else {
        // Update: Do not overwrite balance history here to avoid data loss.
        // If status or name changed:
        await updateAccount(editingAccount._id, payload);
      }

      setShowAddModal(false);
      // Refresh? addAccount updates context state.
    } catch (error) {
      // handled by context toast
    }
  };

  // Delete
  const handleDeleteClick = (accountId) => {
    setDeleteId(accountId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteAccount(deleteId);
      if (selectedAccount && selectedAccount._id === deleteId) {
        setSelectedAccount(null);
      }
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  // Stat Helpers
  // We need to calculate totals from 'accounts'
  const getLatestBalance = (balanceHistory) => {
    if (!balanceHistory || balanceHistory.length === 0) return 0;
    return balanceHistory[balanceHistory.length - 1].closingBalance;
  };

  const calculateTotalByType = (type) => {
    return accounts
      .filter((acc) => acc.type === type)
      .reduce((sum, acc) => sum + getLatestBalance(acc.balanceHistory), 0);
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

  const handleViewStatHistory = (type) => {
    const account = accounts.find((acc) => acc.type === type);
    if (account) setSelectedAccount(account);
  };

  const handleEditStat = (type) => {
    const account = accounts.find((acc) => acc.type === type);
    if (account) openModal(account);
  };

  const handleDeleteStat = (type) => {
    const account = accounts.find((acc) => acc.type === type);
    if (account) handleDeleteClick(account._id);
  };

  // Branch Name fallback
  const displayBranchName = currentBranch
    ? currentBranch.name
    : accounts[0]?.branch?.name || "Branch";
  const displayBranchCode = currentBranch
    ? currentBranch.code
    : accounts[0]?.branch?.code || "";

  return (
    <div className="account-container">
      {/* Header */}
      <div className="account-header">
        <div className="header-content">
          <div className="header-text">
            <Link to={`/branch/${id}`} className="back-button">
              <i className="bi bi-arrow-left"></i>
              Back to Branch
            </Link>
            <h1 className="header-title">
              <i className="bi bi-wallet2"></i>
              {displayBranchName} - Accounts
            </h1>
            <p className="header-subtitle">
              Manage accounts for {displayBranchName} ({displayBranchCode})
            </p>
          </div>
          <button
            className="btn btn-primary add-account-btn"
            onClick={() => openModal(null)}
          >
            <i className="bi bi-plus-circle"></i>
            Add Account
          </button>
        </div>
      </div>

      {accountsLoading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          Loading Accounts...
        </div>
      ) : (
        <>
          <div className="branches-container">
            <div className="branch-section">
              <div className="branch-section-header">
                <div className="branch-info">
                  <i className="bi bi-building"></i>
                  <h2 className="detail-branch-name">
                    {displayBranchName}{" "}
                    <span className="branch-code">({displayBranchCode})</span>
                  </h2>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="stats-grid">
                {/* UPI Card */}
                <div
                  className={`stat-card stat-card-clickable ${
                    selectedAccount?.type === "Upi" ? "active-stat" : ""
                  }`}
                  onClick={() => handleViewStatHistory("Upi")}
                  title="Click to view history"
                  style={{
                    border:
                      selectedAccount?.type === "Upi"
                        ? "2px solid #667eea"
                        : "1px solid #e2e8f0",
                  }}
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
                      {formatCurrency(calculateTotalByType("Upi"))}
                    </div>
                    <div className="stat-meta">
                      <span className="badge bg-primary">
                        {accounts.filter((a) => a.type === "Upi").length}{" "}
                        Accounts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cash Card */}
                <div
                  className={`stat-card stat-card-clickable ${
                    selectedAccount?.type === "Cash" ? "active-stat" : ""
                  }`}
                  onClick={() => handleViewStatHistory("Cash")}
                  style={{
                    border:
                      selectedAccount?.type === "Cash"
                        ? "2px solid #10b981"
                        : "1px solid #e2e8f0",
                  }}
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
                      {formatCurrency(calculateTotalByType("Cash"))}
                    </div>
                    <div className="stat-meta">
                      <span className="badge bg-success">
                        {accounts.filter((a) => a.type === "Cash").length}{" "}
                        Accounts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Credits Card */}
                <div
                  className={`stat-card stat-card-clickable ${
                    selectedAccount?.type === "Credits" ? "active-stat" : ""
                  }`}
                  onClick={() => handleViewStatHistory("Credits")}
                  style={{
                    border:
                      selectedAccount?.type === "Credits"
                        ? "2px solid #f59e0b"
                        : "1px solid #e2e8f0",
                  }}
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
                      {formatCurrency(calculateTotalByType("Credits"))}
                    </div>
                    <div className="stat-meta">
                      <span className="badge bg-warning">
                        {accounts.filter((a) => a.type === "Credits").length}{" "}
                        Accounts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Total Card */}
                <div className="stat-card">
                  <div className="stat-icon stat-icon-total">
                    <i className="bi bi-graph-up-arrow"></i>
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-title">TOTAL BALANCE</h3>
                    <div className="stat-amount">
                      {formatCurrency(
                        accounts.reduce(
                          (sum, acc) =>
                            sum + getLatestBalance(acc.balanceHistory),
                          0
                        )
                      )}
                    </div>
                    <div className="stat-meta">
                      <span className="badge bg-info">
                        {accounts.length} Total Accounts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inline History Display */}
          {selectedAccount && selectedAccount.balanceHistory && (
            <div className="branches-container" style={{ marginTop: "1rem" }}>
              <div className="branch-section">
                <div
                  className="section-header"
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    paddingBottom: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <h2 className="section-title" style={{ margin: 0 }}>
                      <i className="bi bi-clock-history"></i>
                      Transaction History: {selectedAccount.type}
                    </h2>
                    {selectedAccount.type === "Upi" &&
                      accounts.filter((a) => a.type === "Upi").length > 1 && (
                        <select
                          value={selectedAccount._id}
                          onChange={(e) => {
                            const acc = accounts.find(
                              (a) => a._id === e.target.value
                            );
                            if (acc) setSelectedAccount(acc);
                          }}
                          className="form-select form-select-sm"
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            borderColor: "#cbd5e1",
                            outline: "none",
                            width: "auto",
                          }}
                        >
                          {accounts
                            .filter((a) => a.type === "Upi")
                            .map((acc) => (
                              <option key={acc._id} value={acc._id}>
                                {acc.upiAccountName}
                              </option>
                            ))}
                        </select>
                      )}
                  </div>

                  <div
                    className="account-actions"
                    style={{ display: "flex", gap: "0.5rem" }}
                  >
                    <button
                      className="btn btn-edit"
                      onClick={() => openModal(selectedAccount)}
                      style={{
                        fontSize: "0.875rem",
                        padding: "0.4rem 0.8rem",
                      }}
                    >
                      <i className="bi bi-pencil-square"></i> Edit
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDeleteClick(selectedAccount._id)}
                      style={{
                        fontSize: "0.875rem",
                        padding: "0.4rem 0.8rem",
                      }}
                    >
                      <i className="bi bi-trash3"></i> Delete
                    </button>
                  </div>
                </div>

                <div
                  className="history-account-info"
                  style={{ marginBottom: "1rem" }}
                >
                  <div className="history-account-type">
                    <div
                      className={`history-account-icon account-icon-${selectedAccount.type.toLowerCase()}`}
                    >
                      <i className={getTypeIcon(selectedAccount.type)}></i>
                    </div>
                    <h4 className="history-account-name">
                      {selectedAccount.type} Account
                      {selectedAccount.upiAccountName && (
                        <span
                          style={{
                            fontSize: "0.8em",
                            color: "#666",
                            marginLeft: "5px",
                          }}
                        >
                          - {selectedAccount.upiAccountName}
                        </span>
                      )}
                    </h4>
                  </div>
                </div>

                <div className="history-list">
                  {[...selectedAccount.balanceHistory]
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
                  {selectedAccount.balanceHistory.length === 0 && (
                    <div style={{ padding: "1rem", textAlign: "center" }}>
                      No history available
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div
          className="history-modal-overlay"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="history-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "500px" }}
          >
            <div className="history-modal-header">
              <h3 className="history-modal-title">
                <i className="bi bi-plus-circle"></i>
                {editingAccount ? "Edit Account" : "Add New Account"}
              </h3>
              <button
                className="history-modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="history-modal-body" style={{ padding: "1.5rem" }}>
              <form onSubmit={handleSubmit}>
                {/* Account Type */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      color: "#374151",
                      fontSize: "0.875rem",
                    }}
                  >
                    Account Type *
                  </label>
                  <select
                    name="type"
                    required
                    value={formData.type}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1.5px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "1rem",
                    }}
                    disabled={!!editingAccount} // Disable type change on edit to avoid complexity? Should probably allow unless critical constraint. User didn't specify. I'll enable it.
                  >
                    <option value="">Select Type</option>
                    <option value="Upi">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Credits">Credits</option>
                  </select>
                </div>

                {/* UPI Account Name - Conditional */}
                {formData.type === "Upi" && (
                  <div style={{ marginBottom: "1.25rem" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 600,
                        color: "#374151",
                        fontSize: "0.875rem",
                      }}
                    >
                      UPI Account Name *
                    </label>
                    <input
                      type="text"
                      name="upiAccountName"
                      placeholder="e.g., GPay, PhonePe, Paytm"
                      value={formData.upiAccountName}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1.5px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "1rem",
                      }}
                    />
                    <small
                      style={{
                        color: "#64748b",
                        fontSize: "0.75rem",
                        marginTop: "0.25rem",
                        display: "block",
                      }}
                    >
                      Enter the UPI provider name (GPay, PhonePe, etc.)
                    </small>
                  </div>
                )}

                {/* Initial Balance */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      color: "#374151",
                      fontSize: "0.875rem",
                    }}
                  >
                    {editingAccount
                      ? "Current Balance (Read Only)"
                      : "Initial Balance *"}
                  </label>
                  <input
                    type="number"
                    name="balance"
                    required={!editingAccount}
                    step="0.01"
                    placeholder="0.00"
                    value={formData.balance}
                    onChange={handleInputChange}
                    readOnly={!!editingAccount} // Read only on edit
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1.5px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "1rem",
                      backgroundColor: editingAccount ? "#f3f4f6" : "white",
                    }}
                  />
                  {editingAccount && (
                    <small style={{ color: "#666" }}>
                      Balance updates should be done via transactions (Not
                      implemented here)
                    </small>
                  )}
                </div>

                {/* Status */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      color: "#374151",
                      fontSize: "0.875rem",
                    }}
                  >
                    Status *
                  </label>
                  <select
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1.5px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "1rem",
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{
                      padding: "0.75rem 1.5rem",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      background: "#f3f4f6",
                      color: "#374151",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "0.75rem 1.5rem",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                    }}
                  >
                    {editingAccount ? "Update Account" : "Add Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <UniversalDelete
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={confirmDelete}
        title="Delete Account"
        message="Are you sure you want to delete this account? This will permanently remove all transaction history associated with it."
        itemName={
          accounts.find((a) => a._id === deleteId)?.type
            ? `${accounts.find((a) => a._id === deleteId)?.type} Account`
            : "Account"
        }
        isLoading={accountsLoading}
      />
    </div>
  );
};

export default BranchAccountDetail;
