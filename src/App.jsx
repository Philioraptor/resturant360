import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import Products from "./pages/Products";
import Tables from "./pages/Tables";
import KDS from "./pages/KDS";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import AIChatbot from "./pages/AIChatbot";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("res360_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RoleRoute({ allowedRoles, children }) {
  const user = (() => {
    try {
      const u = localStorage.getItem("res360_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const role = user?.role || "admin";

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "kitchen") return <Navigate to="/kds" replace />;
    if (role === "waiter") return <Navigate to="/tables" replace />;
    return <Navigate to="/billing" replace />;
  }

  return children;
}

function DashboardHome() {
  const user = (() => {
    try {
      const u = localStorage.getItem("res360_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const role = user?.role || "admin";
  if (role === "kitchen") return <Navigate to="/kds" replace />;
  if (role === "waiter") return <Navigate to="/tables" replace />;

  return <Dashboard />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  {/* Root Overview: Admins, Managers, Cashiers */}
                  <Route path="/" element={<DashboardHome />} />

                  {/* POS Billing: Admins, Managers, Cashiers, Waiters */}
                  <Route
                    path="/billing"
                    element={
                      <RoleRoute allowedRoles={["admin", "manager", "cashier", "waiter"]}>
                        <Billing />
                      </RoleRoute>
                    }
                  />

                  {/* Tables: Admins, Managers, Cashiers, Waiters */}
                  <Route
                    path="/tables"
                    element={
                      <RoleRoute allowedRoles={["admin", "manager", "cashier", "waiter"]}>
                        <Tables />
                      </RoleRoute>
                    }
                  />

                  {/* KDS (Kitchen Display System): Admins, Managers, Cashiers, Kitchen */}
                  <Route
                    path="/kds"
                    element={
                      <RoleRoute allowedRoles={["admin", "manager", "cashier", "kitchen"]}>
                        <KDS />
                      </RoleRoute>
                    }
                  />

                  {/* Customers: Admins, Managers, Cashiers */}
                  <Route
                    path="/customers"
                    element={
                      <RoleRoute allowedRoles={["admin", "manager", "cashier"]}>
                        <Customers />
                      </RoleRoute>
                    }
                  />

                  {/* Menu & Products: Admin & Manager Only */}
                  <Route
                    path="/products"
                    element={
                      <RoleRoute allowedRoles={["admin", "manager"]}>
                        <Products />
                      </RoleRoute>
                    }
                  />

                  {/* Stock & Inventory: Admin & Manager Only */}
                  <Route
                    path="/inventory"
                    element={
                      <RoleRoute allowedRoles={["admin", "manager"]}>
                        <Inventory />
                      </RoleRoute>
                    }
                  />

                  {/* Analytics & Reports: Admin & Manager Only */}
                  <Route
                    path="/reports"
                    element={
                      <RoleRoute allowedRoles={["admin", "manager"]}>
                        <Reports />
                      </RoleRoute>
                    }
                  />

                  {/* AI Analyst Chatbot: Admin & Manager Only */}
                  <Route
                    path="/ai-chatbot"
                    element={
                      <RoleRoute allowedRoles={["admin", "manager"]}>
                        <AIChatbot />
                      </RoleRoute>
                    }
                  />

                  {/* Settings: Admin & Manager Only */}
                  <Route
                    path="/settings"
                    element={
                      <RoleRoute allowedRoles={["admin", "manager"]}>
                        <Settings />
                      </RoleRoute>
                    }
                  />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
