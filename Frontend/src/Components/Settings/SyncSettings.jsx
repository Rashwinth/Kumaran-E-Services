import React from "react";

const SyncSettings = ({ handleSync }) => {
  return (
    <div className="settings-section">
      <h3 className="settings-section-title">Data & Synchronization</h3>
      <div className="settings-group">
        <div className="setting-row">
          <div className="setting-info">
            <h4>Manual Data Sync</h4>
            <p>Force refresh products and customer data from core cloud</p>
          </div>
          <button className="btn-sync" onClick={handleSync}>
            <i className="bi bi-arrow-repeat"></i>
            Sync Now
          </button>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <h4>Synchronization Status</h4>
            <div className="sync-status">
              <div className="status-dot"></div>
              <span className="small text-muted">
                Last synced: {localStorage.getItem("last_sync") || "Just now"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncSettings;
