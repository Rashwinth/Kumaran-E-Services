import React from "react";

const HardwareSettings = ({ settings, handleChange, handleToggle }) => {
  return (
    <div className="settings-section">
      <h3 className="settings-section-title">Hardware & POS Settings</h3>
      <div className="settings-group">
        <div className="setting-row">
          <div className="setting-info">
            <h4>Thermal Printer Size</h4>
            <p>Paper width for invoice printing</p>
          </div>
          <select
            className="settings-select"
            value={settings.paperSize}
            onChange={(e) => handleChange("paperSize", e.target.value)}
          >
            <option>58mm</option>
            <option>80mm</option>
          </select>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <h4>Auto-print after bill</h4>
            <p>Automatically trigger printer after saving a sale</p>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={settings.autoPrint}
              onChange={() => handleToggle("autoPrint")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <h4>Print Preview</h4>
            <p>Show preview window before printing</p>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={settings.printPreview}
              onChange={() => handleToggle("printPreview")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <h4>Barcode Scanner</h4>
            <p>Enable optimized input for laser scanners</p>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={settings.barcodeScanner}
              onChange={() => handleToggle("barcodeScanner")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default HardwareSettings;
