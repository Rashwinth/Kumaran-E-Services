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
      </div>
    </div>
  );
};

export default GeneralSettings;
