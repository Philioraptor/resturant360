import { useState, useEffect } from "react";
import { getSettings, updateSettings, redeemLicense, getLicenseStatus } from "../services/api";
import "./Settings.css";

function Settings() {
  const [activeTab, setActiveTab] = useState("restaurant");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // License state
  const [licenseData, setLicenseData] = useState(null);
  const [licenseKeyInput, setLicenseKeyInput] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState({ type: "", text: "" });

  const [restaurant, setRestaurant] = useState({
    name: "Restaurant360",
    phone: "",
    address: "",
    fssai: "",
    gstin: "",
  });

  const [taxSettings, setTaxSettings] = useState({
    gst: "5",
    serviceCharge: "0",
    packingCharge: "0",
  });

  const [printerSettings, setPrinterSettings] = useState({
    enabled: true,
    autoPrintKOT: true,
    printerName: "Kitchen Printer",
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSettings();
        if (data) {
          setRestaurant({
            name: data.name || data.branchName || "Restaurant360",
            phone: data.phone || "",
            address: data.address || "",
            fssai: data.fssai || "",
            gstin: data.gstin || "",
          });
          setTaxSettings({
            gst: String(data.gst || data.taxRate || "5"),
            serviceCharge: String(data.serviceCharge || "0"),
            packingCharge: String(data.packingCharge || "0"),
          });
          setPrinterSettings({
            enabled: data.printerEnabled !== undefined ? data.printerEnabled : true,
            autoPrintKOT: data.autoPrintKOT !== undefined ? data.autoPrintKOT : true,
            printerName: data.printerName || "Kitchen Printer",
          });
        }
      } catch (err) {
        console.error("Failed to load settings from MongoDB:", err);
      } finally {
        setLoading(false);
      }
    };

    const loadLicense = async () => {
      try {
        const lic = await getLicenseStatus();
        if (lic) setLicenseData(lic);
      } catch (err) {
        console.error("Failed to load license:", err);
      }
    };

    loadSettings();
    loadLicense();
  }, []);

  const handleRedeemLicense = async (e) => {
    e.preventDefault();
    if (!licenseKeyInput.trim()) {
      setRedeemMessage({ type: "error", text: "Please enter your license key." });
      return;
    }

    try {
      setRedeemLoading(true);
      setRedeemMessage({ type: "", text: "" });
      const res = await redeemLicense(licenseKeyInput.trim());
      setRedeemMessage({ type: "success", text: res.message || "License activated successfully!" });
      
      // Update local storage user
      try {
        const saved = localStorage.getItem("res360_user");
        if (saved) {
          const u = JSON.parse(saved);
          u.subscriptionStatus = res.subscriptionStatus;
          u.subscriptionPlan = res.subscriptionPlan;
          u.licenseExpiresAt = res.licenseExpiresAt;
          u.licenseKey = res.licenseKey;
          u.daysRemaining = res.daysRemaining;
          localStorage.setItem("res360_user", JSON.stringify(u));
        }
      } catch (err) {
        console.error(err);
      }

      setLicenseKeyInput("");
      const updated = await getLicenseStatus();
      if (updated) setLicenseData(updated);
    } catch (err) {
      setRedeemMessage({ type: "error", text: err.message || "Failed to redeem key." });
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleRestaurantChange = (e) => {
    const { name, value } = e.target;

    setRestaurant((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTaxChange = (e) => {
    const { name, value } = e.target;

    setTaxSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        name: restaurant.name,
        branchName: restaurant.name,
        phone: restaurant.phone,
        address: restaurant.address,
        fssai: restaurant.fssai,
        gstin: restaurant.gstin,
        taxRate: Number(taxSettings.gst) || 5,
        gst: taxSettings.gst,
        serviceCharge: taxSettings.serviceCharge,
        packingCharge: taxSettings.packingCharge,
        printerEnabled: printerSettings.enabled,
        autoPrintKOT: printerSettings.autoPrintKOT,
        printerName: printerSettings.printerName,
      };

      await updateSettings(payload);
      alert("Settings saved to MongoDB successfully!");
    } catch (err) {
      console.error("Save settings failed:", err);
      alert("Failed to save settings: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page">

      {/* Page Header */}
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Configure your restaurant.</p>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">

        <button
          className={`settings-tab ${
            activeTab === "restaurant" ? "active" : ""
          }`}
          onClick={() => setActiveTab("restaurant")}
        >
          <span>⌂</span>
          Restaurant Details
        </button>

        <button
          className={`settings-tab ${
            activeTab === "tax" ? "active" : ""
          }`}
          onClick={() => setActiveTab("tax")}
        >
          <span>%</span>
          GST & Charges
        </button>

        <button
          className={`settings-tab ${
            activeTab === "printer" ? "active" : ""
          }`}
          onClick={() => setActiveTab("printer")}
        >
          <span>▣</span>
          Receipt Printer
        </button>

        <button
          className={`settings-tab ${
            activeTab === "database" ? "active" : ""
          }`}
          onClick={() => setActiveTab("database")}
        >
          <span>▤</span>
          Database & Sync
        </button>

        <button
          className={`settings-tab ${
            activeTab === "license" ? "active" : ""
          }`}
          onClick={() => setActiveTab("license")}
        >
          <span>🛡️</span>
          Subscription & License
        </button>

      </div>

      {/* Restaurant Details */}
      {activeTab === "restaurant" && (
        <div className="settings-card">

          <div className="card-heading">
            <div>
              <h2>Restaurant Profile Details</h2>
              <p>Manage your restaurant information.</p>
            </div>
          </div>

          <div className="form-grid">

            <div className="form-group">
              <label>
                Restaurant Name <span>*</span>
              </label>

              <input
                type="text"
                name="name"
                value={restaurant.name}
                onChange={handleRestaurantChange}
                placeholder="Enter restaurant name"
              />
            </div>

            <div className="form-group">
              <label>
                Contact Phone Number <span>*</span>
              </label>

              <input
                type="text"
                name="phone"
                value={restaurant.phone}
                onChange={handleRestaurantChange}
                placeholder="+91 XXXXXX XXXXX"
              />
            </div>

            <div className="form-group full-width">
              <label>
                Address <span>*</span>
              </label>

              <textarea
                name="address"
                value={restaurant.address}
                onChange={handleRestaurantChange}
                placeholder="Enter restaurant address"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>FSSAI License Number</label>

              <input
                type="text"
                name="fssai"
                value={restaurant.fssai}
                onChange={handleRestaurantChange}
                placeholder="14-digit FSSAI number"
                maxLength="14"
              />
            </div>

            <div className="form-group">
              <label>GSTIN ID</label>

              <input
                type="text"
                name="gstin"
                value={restaurant.gstin}
                onChange={handleRestaurantChange}
                placeholder="15-digit GSTIN"
                maxLength="15"
              />
            </div>

          </div>

          <div className="form-actions">
            <button
              className="save-button"
              onClick={handleSave}
            >
              <span>▣</span>
              Save Changes
            </button>
          </div>

        </div>
      )}

      {/* GST & Charges */}
      {activeTab === "tax" && (
        <div className="settings-card">

          <div className="card-heading">
            <h2>GST & Charges</h2>
            <p>Configure taxes and additional restaurant charges.</p>
          </div>

          <div className="form-grid">

            <div className="form-group">
              <label>GST Rate (%)</label>

              <input
                type="number"
                name="gst"
                value={taxSettings.gst}
                onChange={handleTaxChange}
              />
            </div>

            <div className="form-group">
              <label>Service Charge (%)</label>

              <input
                type="number"
                name="serviceCharge"
                value={taxSettings.serviceCharge}
                onChange={handleTaxChange}
              />
            </div>

            <div className="form-group">
              <label>Packing Charge (₹)</label>

              <input
                type="number"
                name="packingCharge"
                value={taxSettings.packingCharge}
                onChange={handleTaxChange}
              />
            </div>

          </div>

          <div className="form-actions">
            <button
              className="save-button"
              onClick={handleSave}
            >
              <span>▣</span>
              Save Changes
            </button>
          </div>

        </div>
      )}

      {/* Receipt Printer */}
      {activeTab === "printer" && (
        <div className="settings-card">

          <div className="card-heading">
            <h2>Receipt Printer</h2>
            <p>Configure receipt and kitchen printing.</p>
          </div>

          <div className="toggle-list">

            <div className="toggle-row">
              <div>
                <h3>Enable Printer</h3>
                <p>Enable receipt printer functionality.</p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={printerSettings.enabled}
                  onChange={(e) =>
                    setPrinterSettings({
                      ...printerSettings,
                      enabled: e.target.checked,
                    })
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="toggle-row">
              <div>
                <h3>Auto Print KOT</h3>
                <p>Automatically print kitchen orders.</p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={printerSettings.autoPrintKOT}
                  onChange={(e) =>
                    setPrinterSettings({
                      ...printerSettings,
                      autoPrintKOT: e.target.checked,
                    })
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

          </div>

          <div className="form-group printer-input">
            <label>Printer Name</label>

            <input
              type="text"
              value={printerSettings.printerName}
              onChange={(e) =>
                setPrinterSettings({
                  ...printerSettings,
                  printerName: e.target.value,
                })
              }
            />
          </div>

          <div className="form-actions">
            <button
              className="save-button"
              onClick={handleSave}
            >
              <span>▣</span>
              Save Changes
            </button>
          </div>

        </div>
      )}

      {/* Database */}
      {activeTab === "database" && (
        <div className="settings-card">

          <div className="card-heading">
            <h2>Database & Sync</h2>
            <p>Manage your restaurant data connection.</p>
          </div>

          <div className="database-status">

            <div className="status-icon">
              ✓
            </div>

            <div>
              <h3>Database Connected</h3>
              <p>
                Restaurant360 database connection is active.
              </p>
            </div>

          </div>

          <div className="database-info">

            <div>
              <span>Database</span>
              <strong>restaurant360</strong>
            </div>

            <div>
              <span>Environment</span>
              <strong>Development</strong>
            </div>

            <div>
              <span>API Status</span>
              <strong className="online-text">Online</strong>
            </div>

          </div>

        </div>
      )}

      {/* Subscription & License Tab */}
      {activeTab === "license" && (
        <div className="settings-card">
          <div className="card-heading">
            <div>
              <h2>Subscription & Software License</h2>
              <p>Manage your restaurant license key, plan validity, and recharge coupons.</p>
            </div>
          </div>

          {/* Current Status Banner */}
          <div
            style={{
              padding: "18px 20px",
              borderRadius: "14px",
              marginBottom: "24px",
              background: licenseData?.isExpired ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
              border: licenseData?.isExpired ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid rgba(34, 197, 94, 0.25)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  background: licenseData?.isExpired ? "#ef4444" : "#22c55e",
                  color: "#fff",
                }}
              >
                {licenseData?.isExpired ? "EXPIRED" : "ACTIVE"}
              </span>
              <h3 style={{ margin: "6px 0 2px", fontSize: "18px", color: "var(--text-main, #f8fafc)", textTransform: "capitalize" }}>
                {licenseData?.subscriptionPlan ? `${licenseData.subscriptionPlan} Plan` : "14-Day Free Trial"}
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-sub, #94a3b8)" }}>
                Active License Key: <strong style={{ color: "#f97316", fontFamily: "monospace" }}>{licenseData?.licenseKey || "TRIAL"}</strong>
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "24px", fontWeight: "800", color: licenseData?.isExpired ? "#ef4444" : "#22c55e" }}>
                {licenseData?.daysRemaining ?? 0} <span style={{ fontSize: "14px", fontWeight: "600" }}>Days Left</span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-sub, #94a3b8)" }}>
                {licenseData?.licenseExpiresAt ? `Expires: ${new Date(licenseData.licenseExpiresAt).toLocaleDateString()}` : ""}
              </div>
            </div>
          </div>

          {/* Feedback Message */}
          {redeemMessage.text && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                fontSize: "13.5px",
                marginBottom: "20px",
                background: redeemMessage.type === "success" ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                color: redeemMessage.type === "success" ? "#22c55e" : "#ef4444",
                border: redeemMessage.type === "success" ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              {redeemMessage.text}
            </div>
          )}

          {/* Recharge Section */}
          <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
            <h4 style={{ margin: "0 0 6px", fontSize: "15px" }}>Recharge with License Key</h4>
            <p style={{ margin: "0 0 16px", fontSize: "13px", color: "var(--text-sub, #94a3b8)" }}>
              Generated a subscription key from the Restaurant360 Portfolio? Enter your 12-character license key below to activate or extend your validity.
            </p>

            <form onSubmit={handleRedeemLicense} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="e.g. R360-A1B2-C3D4"
                value={licenseKeyInput}
                onChange={(e) => setLicenseKeyInput(e.target.value.toUpperCase())}
                style={{
                  flex: "1 1 280px",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-input, #0f172a)",
                  color: "#fff",
                  fontSize: "14px",
                  fontFamily: "monospace",
                  letterSpacing: "1px",
                }}
              />
              <button
                type="submit"
                disabled={redeemLoading}
                className="save-button"
                style={{ margin: 0, padding: "0 22px" }}
              >
                {redeemLoading ? "Verifying..." : "Apply License Key"}
              </button>
            </form>
          </div>

          {/* Link to Buy / Renew on Portfolio */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "rgba(249, 115, 22, 0.06)", border: "1px dashed rgba(249, 115, 22, 0.3)", borderRadius: "12px" }}>
            <div>
              <strong style={{ color: "#f97316", fontSize: "14px" }}>Need to buy or renew your license?</strong>
              <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "var(--text-sub, #94a3b8)" }}>
                Visit our official pricing portal to choose a Monthly, Yearly, or Enterprise package.
              </p>
            </div>
            <a
              href="http://localhost:5174/#pricing-section"
              target="_blank"
              rel="noreferrer"
              style={{
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                color: "#ffffff",
                padding: "9px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                textDecoration: "none",
                display: "inline-block",
                boxShadow: "0 4px 12px rgba(249, 115, 22, 0.25)",
              }}
            >
              Open Portfolio & Renew →
            </a>
          </div>
        </div>
      )}

    </div>
  );
}

export default Settings;