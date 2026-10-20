import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUtensils,
  FaLock,
  FaEnvelope,
  FaUserShield,
  FaSignInAlt,
  FaEye,
  FaEyeSlash,
  FaInfoCircle,
  FaStore,
  FaUser,
  FaKey,
  FaCheckCircle,
  FaCashRegister,
  FaFire,
  FaTimes
} from "react-icons/fa";
import { loginUser, registerUser } from "../services/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState("");
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotStep, setForgotStep] = useState(1); // 1: request code, 2: enter code & new pass
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("session") === "expired") {
      setSessionExpiredMsg("Your session has expired. Please log in again to continue.");
    }

    const keyParam = params.get("key");
    if (keyParam) {
      setLicenseKey(keyParam.toUpperCase());
      setIsRegister(true);
    }

    if (params.get("mode") === "register") {
      setIsRegister(true);
    }
  }, []);

  useEffect(() => {
    if (lockoutTimer > 0) {
      const timer = setTimeout(() => setLockoutTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSessionExpiredMsg("");

    if (!isRegister && lockoutTimer > 0) {
      setError(`Please wait ${lockoutTimer} seconds before trying again.`);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address (e.g. name@restaurant.com).");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (isRegister && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    try {
      setLoading(true);

      let res;
      if (isRegister) {
        res = await registerUser({
          name: name.trim(),
          email: cleanEmail,
          password,
          restaurantName: restaurantName.trim() || "My Restaurant",
          role: "admin", // New self-registered users are always Restaurant Owners/Admins
          licenseKey: licenseKey.trim(),
        });
      } else {
        res = await loginUser({ email: cleanEmail, password });
      }

      // Save token and user details to localStorage
      localStorage.setItem("res360_token", res.token);
      localStorage.setItem("res360_user", JSON.stringify(res.user));

      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      }

      // Redirect based on role
      if (res.user?.role === "kitchen") {
        window.location.href = "/kds";
      } else if (res.user?.role === "waiter") {
        window.location.href = "/tables";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      console.error(isRegister ? "Registration failed:" : "Login failed:", err);
      const msg = err.message || (isRegister ? "Registration failed. Please try again." : "Invalid credentials.");
      setError(msg);

      if (!isRegister && (msg.includes("locked") || msg.includes("failed"))) {
        setLockoutTimer(30);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    setForgotError("");
    if (!forgotEmail.trim()) {
      setForgotError("Please enter your registered email address.");
      return;
    }

    try {
      setForgotLoading(true);
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate reset code.");

      if (data.data?.resetCode) {
        setResetCode(data.data.resetCode);
      }
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleApplyNewPassword = async (e) => {
    e.preventDefault();
    setForgotError("");

    if (!resetCode.trim()) {
      setForgotError("Please enter the 6-digit reset code.");
      return;
    }
    if (newPassword.length < 6) {
      setForgotError("New password must be at least 6 characters long.");
      return;
    }

    try {
      setForgotLoading(true);
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          resetCode: resetCode.trim(),
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password.");

      setShowForgotModal(false);
      setSuccessMsg("Password reset successfully! Please sign in with your new password.");
      setPassword("");
      setForgotStep(1);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const fillDemoCredentials = (role) => {
    setIsRegister(false);
    setError("");
    setSuccessMsg("");

    if (role === "admin") {
      setEmail("admin@restaurant360.com");
      setPassword("admin123");
    } else if (role === "cashier") {
      setEmail("cashier@restaurant360.com");
      setPassword("cashier123");
    } else if (role === "kitchen") {
      setEmail("kitchen@restaurant360.com");
      setPassword("chef123");
    } else if (role === "waiter") {
      setEmail("waiter@restaurant360.com");
      setPassword("waiter123");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #090d16 0%, #111827 50%, #030712 100%)",
        color: "#f3f4f6",
        padding: "20px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#111827",
          border: "1px solid #1f2937",
          borderRadius: "20px",
          padding: "36px 32px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Logo & Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              background: "linear-gradient(135deg, #ff7a00, #ea580c)",
              borderRadius: "16px",
              color: "#fff",
              fontSize: "24px",
              marginBottom: "12px",
              boxShadow: "0 10px 20px -5px rgba(255, 122, 0, 0.4)",
            }}
          >
            <FaUtensils />
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", margin: 0, letterSpacing: "-0.5px" }}>
            Restaurant <span style={{ color: "#ff7a00" }}>360</span>
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "13px", marginTop: "4px" }}>
            {isRegister
              ? "Create your Restaurant Account & Activate"
              : "Enterprise POS & Multi-Role Staff Portal"}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Register */}
        <div
          style={{
            display: "flex",
            background: "#1f2937",
            padding: "4px",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError("");
            }}
            style={{
              flex: 1,
              padding: "9px 0",
              border: "none",
              borderRadius: "9px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              background: !isRegister ? "#ff7a00" : "transparent",
              color: !isRegister ? "#fff" : "#9ca3af",
              transition: "all 0.2s ease",
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError("");
            }}
            style={{
              flex: 1,
              padding: "9px 0",
              border: "none",
              borderRadius: "9px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              background: isRegister ? "#ff7a00" : "transparent",
              color: isRegister ? "#fff" : "#9ca3af",
              transition: "all 0.2s ease",
            }}
          >
            Register Restaurant
          </button>
        </div>

        {/* Session Expired Banner */}
        {sessionExpiredMsg && (
          <div
            style={{
              background: "rgba(249, 115, 22, 0.15)",
              border: "1px solid #f97316",
              borderRadius: "10px",
              padding: "10px 14px",
              color: "#fb923c",
              fontSize: "13px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaInfoCircle /> <span>{sessionExpiredMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid #ef4444",
              borderRadius: "10px",
              padding: "10px 14px",
              color: "#fca5a5",
              fontSize: "13px",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div
            style={{
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid #10b981",
              borderRadius: "10px",
              padding: "10px 14px",
              color: "#6ee7b7",
              fontSize: "13px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaCheckCircle /> <span>{successMsg}</span>
          </div>
        )}

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              {/* Restaurant Name */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#d1d5db", marginBottom: "6px" }}>
                  Restaurant Name
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", fontSize: "14px" }}>
                    <FaStore />
                  </span>
                  <input
                    type="text"
                    required
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="e.g. Spice Route Bistro"
                    style={{
                      width: "100%",
                      padding: "11px 14px 11px 40px",
                      background: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Owner Full Name */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#d1d5db", marginBottom: "6px" }}>
                  Owner Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", fontSize: "14px" }}>
                    <FaUser />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rohit Sharma"
                    style={{
                      width: "100%",
                      padding: "11px 14px 11px 40px",
                      background: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#d1d5db", marginBottom: "6px" }}>
              {isRegister ? "Business Email" : "Email Address"}
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", fontSize: "14px" }}>
                <FaEnvelope />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@restaurant360.com"
                style={{
                  width: "100%",
                  padding: "11px 14px 11px 40px",
                  background: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: isRegister ? "14px" : "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#d1d5db" }}>
                Password
              </label>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotEmail(email);
                    setForgotError("");
                    setForgotStep(1);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#f97316",
                    fontSize: "11.5px",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Forgot Password?
                </button>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", fontSize: "14px" }}>
                <FaLock />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "11px 44px 11px 40px",
                  background: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  fontSize: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px",
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* License Key (Register Mode only - Optional) */}
          {isRegister && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#d1d5db" }}>
                  12-Char License Key <span style={{ color: "#9ca3af", fontWeight: "normal" }}>(Optional)</span>
                </label>
              </div>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", fontSize: "14px" }}>
                  <FaKey />
                </span>
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  placeholder="R360-XXXX-XXXX"
                  style={{
                    width: "100%",
                    padding: "11px 14px 11px 40px",
                    background: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "10px",
                    color: "#f59e0b",
                    fontFamily: "monospace",
                    letterSpacing: "1px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <p style={{ color: "#9ca3af", fontSize: "11px", margin: "4px 0 0" }}>
                Have an activation key from our checkout? Enter it to activate immediately. Or leave blank for 14-day free trial.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (!isRegister && lockoutTimer > 0)}
            style={{
              width: "100%",
              marginTop: isRegister ? "0" : "12px",
              padding: "13px",
              background: !isRegister && lockoutTimer > 0
                ? "#4b5563"
                : "linear-gradient(135deg, #ff7a00, #ea580c)",
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              fontSize: "14px",
              fontWeight: "700",
              cursor: (loading || (!isRegister && lockoutTimer > 0)) ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: !isRegister && lockoutTimer > 0 ? "none" : "0 10px 20px -5px rgba(255, 122, 0, 0.4)",
            }}
          >
            <FaSignInAlt />
            {loading
              ? isRegister ? "Setting up Restaurant..." : "Authenticating..."
              : !isRegister && lockoutTimer > 0
              ? `Locked (${lockoutTimer}s)`
              : isRegister
              ? "Register & Launch Dashboard"
              : "Sign In to Portal"}
          </button>
        </form>

        {/* Demo Roles Helper (Sign In mode only) */}
        {!isRegister && (
          <div style={{ marginTop: "22px", paddingTop: "18px", borderTop: "1px solid #1f2937" }}>
            <p style={{ color: "#9ca3af", fontSize: "11px", textAlign: "center", margin: "0 0 10px" }}>
              Quick 1-Click Role Switcher (For Testing RBAC):
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <button
                type="button"
                onClick={() => fillDemoCredentials("admin")}
                style={{
                  background: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  padding: "7px 10px",
                  color: "#e5e7eb",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FaUserShield style={{ color: "#f97316" }} /> <strong>Owner / Admin</strong>
              </button>

              <button
                type="button"
                onClick={() => fillDemoCredentials("cashier")}
                style={{
                  background: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  padding: "7px 10px",
                  color: "#e5e7eb",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FaCashRegister style={{ color: "#38bdf8" }} /> <strong>Cashier</strong>
              </button>

              <button
                type="button"
                onClick={() => fillDemoCredentials("kitchen")}
                style={{
                  background: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  padding: "7px 10px",
                  color: "#e5e7eb",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FaFire style={{ color: "#ef4444" }} /> <strong>Kitchen / Chef</strong>
              </button>

              <button
                type="button"
                onClick={() => fillDemoCredentials("waiter")}
                style={{
                  background: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  padding: "7px 10px",
                  color: "#e5e7eb",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FaUtensils style={{ color: "#10b981" }} /> <strong>Waiter / Floor</strong>
              </button>
            </div>
          </div>
        )}

        {/* FORGOT PASSWORD MODAL */}
        {showForgotModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "420px",
                background: "#111827",
                border: "1px solid #374151",
                borderRadius: "18px",
                padding: "28px",
                position: "relative",
              }}
            >
              <button
                onClick={() => setShowForgotModal(false)}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  background: "transparent",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                <FaTimes />
              </button>

              <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 6px" }}>
                Reset Restaurant Password
              </h3>
              <p style={{ color: "#9ca3af", fontSize: "12.5px", margin: "0 0 16px" }}>
                {forgotStep === 1
                  ? "Enter your registered email to request a 6-digit reset code."
                  : "Enter the 6-digit reset code and choose your new password."}
              </p>

              {forgotError && (
                <div style={{ background: "#7f1d1d", color: "#fca5a5", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", marginBottom: "12px" }}>
                  {forgotError}
                </div>
              )}

              {forgotStep === 1 ? (
                <form onSubmit={handleRequestResetCode}>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "12px", color: "#d1d5db", marginBottom: "6px" }}>
                      Registered Email:
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="admin@restaurant360.com"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        background: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "13.5px",
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{
                      width: "100%",
                      padding: "11px",
                      background: "linear-gradient(135deg, #ff7a00, #ea580c)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      fontWeight: "700",
                      cursor: forgotLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {forgotLoading ? "Generating Code..." : "Get 6-Digit Reset Code"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleApplyNewPassword}>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", fontSize: "12px", color: "#d1d5db", marginBottom: "6px" }}>
                      6-Digit Reset Code:
                    </label>
                    <input
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="e.g. 849201"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        background: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#f59e0b",
                        fontSize: "15px",
                        letterSpacing: "2px",
                        fontFamily: "monospace",
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "12px", color: "#d1d5db", marginBottom: "6px" }}>
                      New Password (Min 6 chars):
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        background: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "13.5px",
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{
                      width: "100%",
                      padding: "11px",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      fontWeight: "700",
                      cursor: forgotLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {forgotLoading ? "Updating..." : "Update Password & Return to Login"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
