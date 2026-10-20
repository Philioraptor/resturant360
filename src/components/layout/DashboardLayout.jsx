import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import LicenseModal from "../common/LicenseModal";
import "../../styles/dashboard.css";

function DashboardLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("app_theme");
    return saved !== null ? saved === "dark" : true;
  });

  const [isSubscriptionLocked, setIsSubscriptionLocked] = useState(() => {
    try {
      const saved = localStorage.getItem("res360_user");
      if (saved) {
        const u = JSON.parse(saved);
        return u.isExpired || u.subscriptionStatus === "expired";
      }
      return false;
    } catch {
      return false;
    }
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

  useEffect(() => {
    const handleExpired = () => {
      setIsSubscriptionLocked(true);
    };
    window.addEventListener("res360:subscriptionExpired", handleExpired);
    return () => window.removeEventListener("res360:subscriptionExpired", handleExpired);
  }, []);

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

      {/* Subscription Lock Screen Guard */}
      <LicenseModal
        isOpen={isSubscriptionLocked}
        isForced={true}
        onClose={() => {}}
        onLicenseUpdated={(newDetails) => {
          setIsSubscriptionLocked(false);
          try {
            const saved = localStorage.getItem("res360_user");
            if (saved) {
              const u = JSON.parse(saved);
              u.subscriptionStatus = newDetails.subscriptionStatus;
              u.subscriptionPlan = newDetails.subscriptionPlan;
              u.licenseExpiresAt = newDetails.licenseExpiresAt;
              u.licenseKey = newDetails.licenseKey;
              u.daysRemaining = newDetails.daysRemaining;
              u.isExpired = false;
              localStorage.setItem("res360_user", JSON.stringify(u));
            }
          } catch (e) {
            console.error(e);
          }
        }}
      />
    </div>
  );
}

export default DashboardLayout;

