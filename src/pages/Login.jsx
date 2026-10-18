import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaLock, FaEnvelope, FaUserShield, FaSignInAlt } from "react-icons/fa";
import { loginUser } from "../services/api";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser({ email, password });

      // Save token and user details to localStorage
      localStorage.setItem("res360_token", res.token);
      localStorage.setItem("res360_user", JSON.stringify(res.user));

      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      }

      window.location.href = "/";
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || "Invalid credentials. Please try again.");
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
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              background: "linear-gradient(135deg, #ff7a00, #ea580c)",
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              fontSize: "15px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 10px 20px -5px rgba(255, 122, 0, 0.4)",
            }}
          >
            <FaSignInAlt />
            {loading ? "Authenticating..." : "Sign In to Restaurant360"}
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
