import { NavLink } from "react-router-dom";
import {
  FaThLarge,
  FaShoppingCart,
  FaUtensils,
  FaTh,
  FaTv,
  FaBoxes,
  FaUsers,
  FaChartLine,
  FaRobot,
  FaCog,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaUserShield,
  FaCashRegister,
  FaFire
} from "react-icons/fa";
import "../../styles/sidebar.css";

function Sidebar({ isCollapsed, setIsCollapsed }) {
  const user = (() => {
    try {
      const u = localStorage.getItem("res360_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const userRole = user?.role || "admin";

  const allNavItems = [
    { path: "/", label: "Overview Dashboard", icon: FaThLarge, end: true, roles: ["admin", "manager", "cashier"] },
    { path: "/billing", label: "Billing Counter (POS)", icon: FaShoppingCart, roles: ["admin", "manager", "cashier", "waiter"] },
    { path: "/products", label: "Menu & Dishes", icon: FaUtensils, roles: ["admin", "manager"] },
    { path: "/tables", label: "Table Layout", icon: FaTh, roles: ["admin", "manager", "cashier", "waiter"] },
    { path: "/kds", label: "Kitchen Orders (KDS)", icon: FaTv, roles: ["admin", "manager", "cashier", "kitchen"] },
    { path: "/inventory", label: "Stock & Inventory", icon: FaBoxes, roles: ["admin", "manager"] },
    { path: "/customers", label: "Loyalty & Customers", icon: FaUsers, roles: ["admin", "manager", "cashier"] },
    { path: "/reports", label: "Analytics & Reports", icon: FaChartLine, roles: ["admin", "manager"] },
    { path: "/ai-chatbot", label: "AI Analyst Chatbot", icon: FaRobot, roles: ["admin", "manager"] },
    { path: "/settings", label: "System Settings", icon: FaCog, roles: ["admin", "manager"] }
  ];

  // Filter items matching user's role
  const visibleNavItems = allNavItems.filter(item => item.roles.includes(userRole));

  const handleLogout = () => {
    localStorage.removeItem("res360_token");
    localStorage.removeItem("res360_user");
    window.location.href = "/login";
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin": return { label: "Admin / Owner", color: "#f97316" };
      case "cashier": return { label: "Cashier", color: "#38bdf8" };
      case "kitchen": return { label: "Chef / Kitchen", color: "#ef4444" };
      case "waiter": return { label: "Waiter / Captain", color: "#10b981" };
      default: return { label: role, color: "#9ca3af" };
    }
  };

  const roleInfo = getRoleBadge(userRole);

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-top">
        <div className="logo-container">
          <span className="logo-text">
            {isCollapsed ? (
              <span className="logo-badge">360</span>
            ) : (
              <>
                restaurant<span className="logo-badge">360</span>
              </>
            )}
          </span>
        </div>

        {/* User Role Indicator */}
        {!isCollapsed && (
          <div
            style={{
              margin: "0 16px 14px",
              padding: "8px 12px",
              background: "rgba(255, 255, 255, 0.04)",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Active Role
            </div>
            <div style={{ fontSize: "12px", fontWeight: "700", color: roleInfo.color, marginTop: "2px" }}>
              {roleInfo.label}
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {visibleNavItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                title={item.label}
                className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
              >
                {({ isActive }) => (
                  <>
                    <div className="menu-left">
                      <IconComponent className="menu-icon" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>

                    {isActive && !isCollapsed && <div className="active-indicator"></div>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <button className="logout-btn" title="Logout" onClick={handleLogout}>
          <FaSignOutAlt />
          {!isCollapsed && <span>Logout</span>}
        </button>

        <button
          className="collapse-btn"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
