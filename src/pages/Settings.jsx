import { useState, useEffect } from "react";
import { getSettings, updateSettings } from "../services/api";
import "./Settings.css";

function Settings() {
  const [activeTab, setActiveTab] = useState("restaurant");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

    loadSettings();
  }, []);

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

    </div>
  );
}

export default Settings;