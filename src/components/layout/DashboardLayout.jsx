import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../../styles/dashboard.css";

function DashboardLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("app_theme");
    return saved !== null ? saved === "dark" : true;
  });

  useEffect(() => {
    localStorage.setItem("app_theme", isDarkMode ? "dark" : "light");
    if (isDarkMode) {
      document.documentElement.classList.remove("light-theme");
      document.documentElement.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
      document.body.classList.add("dark-theme");
    } else {
      document.documentElement.classList.remove("dark-theme");
      document.documentElement.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
      document.body.classList.add("light-theme");
    }
  }, [isDarkMode]);

  const handleToggleCollapse = (val) => {
    const nextVal = typeof val === "function" ? val(isCollapsed) : val;
    setIsCollapsed(nextVal);
    localStorage.setItem("sidebar_collapsed", String(nextVal));
  };

  return (
    <div className={`dashboard ${isDarkMode ? "dark-theme" : "light-theme"}`}>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={handleToggleCollapse} />

      <div className={`main-content ${isCollapsed ? "sidebar-collapsed" : ""}`}>
        <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
