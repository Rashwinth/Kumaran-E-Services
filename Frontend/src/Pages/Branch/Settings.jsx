import React, { useState, useEffect } from "react";
import "../../Styles/Settings.css";
import { toast } from "react-toastify";
import { useAuth } from "../../Context/AuthContext";

// Sub-components
import SettingsSidebar from "../../Components/Settings/SettingsSidebar";
import GeneralSettings from "../../Components/Settings/GeneralSettings";
import AccountsSettings from "../../Components/Settings/AccountsSettings";
import HardwareSettings from "../../Components/Settings/HardwareSettings";
import SyncSettings from "../../Components/Settings/SyncSettings";
import AboutSettings from "../../Components/Settings/AboutSettings";
import { saveEncrypted, getDecrypted } from "../../utils/storage";

function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");

  const [settings, setSettings] = useState(() => {
    const saved = getDecrypted("app_settings");
    return {
      language:
        saved?.language || localStorage.getItem("setting_lang") || "English",
      currency:
        saved?.currency ||
        localStorage.getItem("setting_currency") ||
        "INR (₹)",
      dateFormat:
        saved?.dateFormat ||
        localStorage.getItem("setting_date_format") ||
        "DD/MM/YYYY",
      paperSize:
        saved?.paperSize ||
        localStorage.getItem("setting_paper_size") ||
        "80mm",
      autoPrint:
        saved?.autoPrint ??
        localStorage.getItem("setting_auto_print") === "true",
      printPreview:
        saved?.printPreview ??
        localStorage.getItem("setting_print_preview") === "true",
      barcodeScanner:
        saved?.barcodeScanner ??
        localStorage.getItem("setting_barcode_enabled") === "true",
      rounding: saved?.rounding || "none",
      roundingValue: saved?.roundingValue || 10,
    };
  });

  const [branchInfo, setBranchInfo] = useState({
    name: "Kumaran E-Services",
    code: user?.branchCode || "N/A",
    address: "Local Branch St, City",
    contact: "0000000000",
  });

  useEffect(() => {
    const storedBranch = localStorage.getItem("branch");
    if (storedBranch) {
      const parsed = JSON.parse(storedBranch);
      setBranchInfo({
        name: parsed.name,
        code: parsed.code,
        address: `${parsed.address?.street || ""}, ${
          parsed.address?.city || ""
        }`,
        contact: parsed.contact?.phone || "N/A",
      });
    }
  }, [user]);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    saveEncrypted("app_settings", settings);
    toast.success("Settings saved securely!");
  };

  const handleSync = () => {
    const toastId = toast.loading("Synchronizing data...");
    setTimeout(() => {
      toast.update(toastId, {
        render: "Data synchronized perfectly!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      localStorage.setItem("last_sync", new Date().toLocaleString());
    }, 1500);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div>
          <h1>Branch Settings</h1>
          <p>Configure your workspace and hardware preferences</p>
        </div>
      </div>

      <div className="settings-grid">
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="settings-content">
          {activeTab === "general" && (
            <GeneralSettings
              branchInfo={branchInfo}
              settings={settings}
              handleChange={handleChange}
            />
          )}

          {activeTab === "accounts" && <AccountsSettings />}

          {activeTab === "hardware" && (
            <HardwareSettings
              settings={settings}
              handleChange={handleChange}
              handleToggle={handleToggle}
            />
          )}

          {activeTab === "sync" && <SyncSettings handleSync={handleSync} />}

          {activeTab === "about" && <AboutSettings />}

          {activeTab !== "accounts" && (
            <div className="d-flex justify-content-end">
              <button className="btn-save-settings" onClick={saveSettings}>
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
