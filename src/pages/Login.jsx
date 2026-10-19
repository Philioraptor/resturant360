import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaLock, FaEnvelope, FaUserShield, FaSignInAlt, FaEye, FaEyeSlash, FaInfoCircle } from "react-icons/fa";
import { loginUser } from "../services/api";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState("");
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("session") === "expired") {
      setSessionExpiredMsg("Your session has expired. Please log in again to continue.");
    }
  }, []);

  useEffect(() => {
    if (lockoutTimer > 0) {
      const timer = setTimeout(() => setLockoutTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutTimer]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSessionExpiredMsg("");

    if (lockoutTimer > 0) {
      setError(`Please wait ${lockoutTimer} seconds before trying again.`);
      return;
    }

    // Client-side email format regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your restaurant email.");
      return;
    }
    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address (e.g. admin@restaurant360.com).");
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

    try {
      setLoading(true);
      const res = await loginUser({ email: cleanEmail, password });

      // Save token and user details to localStorage
      localStorage.setItem("res360_token", res.token);
      localStorage.setItem("res360_user", JSON.stringify(res.user));

      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      }

      window.location.href = "/";
    } catch (err) {
      console.error("Login failed:", err);
      const msg = err.message || "Invalid credentials. Please try again.";
      setError(msg);

      if (msg.includes("locked") || msg.includes("failed")) {
        setLockoutTimer(30);
      }
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (type) => {
    if (type === "admin") {
      setEmail("admin@restaurant360.com");
      setPassword("admin123");
    } else {
      setEmail("rohit@restaurant360.com");
      setPassword("rohit123");
    }
    setError("");
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
          maxWidth: "440px",
          background: "#111827",
          border: "1px solid #1f2937",
          borderRadius: "20px",
          padding: "36px 32px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Logo & Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
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
              marginBottom: "14px",
              boxShadow: "0 10px 20px -5px rgba(255, 122, 0, 0.4)",
            }}
          >
            <FaUtensils />
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", margin: 0, letterSpacing: "-0.5px" }}>
            Restaurant <span style={{ color: "#ff7a00" }}>360</span>
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "14px", marginTop: "6px" }}>
            Enterprise POS & Restaurant Management Portal
          </p>
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
              marginBottom: "18px",
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
              marginBottom: "18px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#d1d5db", marginBottom: "8px" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
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
                  padding: "12px 14px 12px 42px",
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

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#d1d5db", marginBottom: "8px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
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
                  padding: "12px 44px 12px 42px",
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

          <button
            type="submit"
            disabled={loading || lockoutTimer > 0}
            style={{
              width: "100%",
              padding: "13px",
              background: lockoutTimer > 0
                ? "#4b5563"
                : "linear-gradient(135deg, #ff7a00, #ea580c)",
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              fontSize: "15px",
              fontWeight: "700",
              cursor: (loading || lockoutTimer > 0) ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: lockoutTimer > 0 ? "none" : "0 10px 20px -5px rgba(255, 122, 0, 0.4)",
            }}
          >
            <FaSignInAlt />
            {loading
              ? "Authenticating..."
              : lockoutTimer > 0
              ? `Locked (${lockoutTimer}s)`
              : "Sign In to Restaurant360"}
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #1f2937" }}>
          <p style={{ color: "#9ca3af", fontSize: "12px", textAlign: "center", margin: "0 0 10px" }}>
            1-Click Demo Login for Testing:
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => fillCredentials("admin")}
              style={{
                flex: 1,
                background: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                padding: "8px 12px",
                color: "#e5e7eb",
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <FaUserShield style={{ color: "#f97316" }} /> Admin
            </button>

            <button
              type="button"
              onClick={() => fillCredentials("staff")}
              style={{
                flex: 1,
                background: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                padding: "8px 12px",
                color: "#e5e7eb",
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <FaUtensils style={{ color: "#38bdf8" }} /> Cashier / Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
