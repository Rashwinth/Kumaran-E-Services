import React from "react";

const GeneralSettings = ({ branchInfo, settings, handleChange }) => {
  return (
    <div className="settings-section">
      <h3 className="settings-section-title">General Settings</h3>
      <div className="settings-group">
        <div className="setting-row">
          <div className="setting-info">
            <h4>Assigned Branch</h4>
            <p>Primary branch code for this device</p>
          </div>
          <div className="read-only-box">{branchInfo.code}</div>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <h4>Branch Name</h4>
            <p>Trading as listed in registration</p>
          </div>
          <div className="read-only-box">{branchInfo.name}</div>
        </div>

        <div className="setting-row border-top pt-4">
          <div className="setting-info">
            <h4>Language</h4>
            <p>Primary display language for the interface</p>
          </div>
          <select
            className="settings-select"
            value={settings.language}
            onChange={(e) => handleChange("language", e.target.value)}
          >
            <option>English</option>
            <option>Tamil</option>
            <option>Hindi</option>
          </select>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <h4>Date & Time Format</h4>
            <p>How dates are displayed in bills and reports</p>
          </div>
          <select
            className="settings-select"
            value={settings.dateFormat}
            onChange={(e) => handleChange("dateFormat", e.target.value)}
          >
            <option>DD/MM/YYYY</option>
            <option>MM/DD/YYYY</option>
            <option>YYYY-MM-DD</option>
          </select>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <h4>Rounding Method</h4>
            <p>How total amounts are calculated (Rounding)</p>
          </div>
          <select
            className="settings-select"
            value={settings.rounding}
            onChange={(e) => handleChange("rounding", e.target.value)}
          >
            <option value="none">None (2 Decimals)</option>
            <option value="round">Nearest Integer (1)</option>
            <option value="nearest">Nearest Multiple</option>
            <option value="ceil">Round Up (Ceil)</option>
            <option value="floor">Round Down (Floor)</option>
          </select>
        </div>

        {settings.rounding === "nearest" && (
          <div className="setting-row">
            <div className="setting-info">
              <h4>Rounding Multiple</h4>
              <p>Value to round to (e.g., 5 or 10)</p>
            </div>
            <input
              type="number"
              className="settings-input"
              style={{
                width: "120px",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ddd",
              }}
              value={settings.roundingValue || 10}
              onChange={(e) =>
                handleChange("roundingValue", parseInt(e.target.value) || 1)
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralSettings;
