import React from "react";

const SettingsSidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "general", icon: "bi-gear", label: "General" },
    { id: "hardware", icon: "bi-printer", label: "Hardware & POS" },
    { id: "sync", icon: "bi-arrow-repeat", label: "Data & Sync" },
    { id: "about", icon: "bi-info-circle", label: "About" },
  ];

  return (
    <div className="settings-sidebar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`sidebar-item ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <i className={`bi ${tab.icon}`}></i>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default SettingsSidebar;
