import { useState, useEffect } from "react";
import { FaKey, FaShieldAlt, FaCheckCircle, FaExclamationTriangle, FaTimes, FaExternalLinkAlt } from "react-icons/fa";
import { redeemLicense, getLicenseStatus } from "../../services/api";

function LicenseModal({ isOpen, onClose, onLicenseUpdated }) {
  const [licenseKeyInput, setLicenseKeyInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [statusData, setStatusData] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchStatus = async () => {
    try {
      setFetching(true);
      const res = await getLicenseStatus();
      setStatusData(res);
    } catch (err) {
      console.error("Failed to fetch license status:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setMessage({ type: "", text: "" });
      setLicenseKeyInput("");
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!licenseKeyInput.trim()) {
      setMessage({ type: "error", text: "Please enter your license key." });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const res = await redeemLicense(licenseKeyInput.trim());

      setMessage({
        type: "success",
        text: res.message || "License activated successfully!",
      });

      // Update cached user in localStorage
      try {
        const saved = localStorage.getItem("res360_user");
        if (saved) {
          const userObj = JSON.parse(saved);
          userObj.subscriptionStatus = res.subscriptionStatus;
          userObj.subscriptionPlan = res.subscriptionPlan;
          userObj.licenseExpiresAt = res.licenseExpiresAt;
          userObj.licenseKey = res.licenseKey;
          userObj.daysRemaining = res.daysRemaining;
          localStorage.setItem("res360_user", JSON.stringify(userObj));
        }
      } catch (e) {
        console.error(e);
      }

      setLicenseKeyInput("");
      fetchStatus();

      if (onLicenseUpdated) {
        onLicenseUpdated(res);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Invalid or already used license key.",
      });
    } finally {
      setLoading(false);
    }
  };

  const isExpired = statusData?.isExpired || statusData?.subscriptionStatus === "expired";
  const daysLeft = statusData?.daysRemaining ?? 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-panel, #1e222d)",
          color: "var(--text-main, #f8fafc)",
          border: "1px solid var(--border-color, #334155)",
          borderRadius: "20px",
          maxWidth: "540px",
          width: "100%",
          padding: "28px 24px",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.45)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "18px",
            right: "18px",
            background: "rgba(255, 255, 255, 0.08)",
            border: "none",
            color: "var(--text-sub, #94a3b8)",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
          }}
        >
          <FaTimes />
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "20px",
              boxShadow: "0 4px 14px rgba(249, 115, 22, 0.3)",
            }}
          >
            <FaShieldAlt />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "19px", fontWeight: "700" }}>
              Restaurant360 Subscription & License
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "var(--text-sub, #94a3b8)" }}>
              Manage your software license validity and recharge coupons
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div
          style={{
            background: isExpired
              ? "rgba(239, 68, 68, 0.08)"
              : "rgba(34, 197, 94, 0.08)",
            border: isExpired
              ? "1px solid rgba(239, 68, 68, 0.25)"
              : "1px solid rgba(34, 197, 94, 0.25)",
            borderRadius: "14px",
            padding: "16px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-sub, #94a3b8)" }}>
              Current Plan Status
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "700",
                padding: "3px 10px",
                borderRadius: "20px",
                background: isExpired ? "#ef4444" : "#22c55e",
                color: "#ffffff",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              {isExpired ? <FaExclamationTriangle /> : <FaCheckCircle />}
              {isExpired ? "EXPIRED" : "ACTIVE"}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div>
              <div style={{ fontSize: "17px", fontWeight: "800", textTransform: "capitalize", color: "var(--text-main, #f8fafc)" }}>
                {statusData?.subscriptionPlan ? `${statusData.subscriptionPlan} Plan` : "14-Day Free Trial"}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-sub, #94a3b8)", marginTop: "2px" }}>
                Key: <code style={{ color: "#f97316", background: "rgba(249, 115, 22, 0.1)", padding: "2px 6px", borderRadius: "4px" }}>
                  {statusData?.licenseKey || "TRIAL"}
                </code>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "20px", fontWeight: "900", color: isExpired ? "#ef4444" : "#22c55e" }}>
                {daysLeft} <span style={{ fontSize: "13px", fontWeight: "600" }}>Days Left</span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-sub, #94a3b8)" }}>
                {statusData?.licenseExpiresAt ? `Expires: ${new Date(statusData.licenseExpiresAt).toLocaleDateString()}` : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "13px",
              marginBottom: "16px",
              background: message.type === "success" ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
              color: message.type === "success" ? "#22c55e" : "#ef4444",
              border: message.type === "success" ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {message.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Redeem Form */}
        <form onSubmit={handleRedeem}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
            <FaKey style={{ marginRight: "6px", color: "#f97316" }} />
            Enter New License Key to Recharge:
          </label>
          <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
            <input
              type="text"
              placeholder="e.g. RES360-A1B2-C3D4-E5F6"
              value={licenseKeyInput}
              onChange={(e) => setLicenseKeyInput(e.target.value.toUpperCase())}
              style={{
                flex: 1,
                padding: "11px 14px",
                borderRadius: "10px",
                border: "1px solid var(--border-color, #334155)",
                background: "var(--bg-input, #0f172a)",
                color: "#fff",
                fontSize: "14px",
                fontFamily: "monospace",
                letterSpacing: "1px",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                padding: "0 18px",
                fontWeight: "700",
                fontSize: "13px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "Verifying..." : "Apply Recharge"}
            </button>
          </div>
        </form>

        {/* Buy / Renew Link on Portfolio */}
        <div
          style={{
            marginTop: "16px",
            paddingTop: "16px",
            borderTop: "1px solid var(--border-color, #334155)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "12.5px",
          }}
        >
          <span style={{ color: "var(--text-sub, #94a3b8)" }}>
            Don't have an activation key?
          </span>
          <a
            href="http://localhost:5174/#pricing-section"
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#f97316",
              textDecoration: "none",
              fontWeight: "700",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            Renew on Restaurant360 Portfolio <FaExternalLinkAlt size={11} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default LicenseModal;
