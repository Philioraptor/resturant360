import { useState, useEffect, useRef } from "react";
import {
  FaStore,
  FaSun,
  FaMoon,
  FaExpand,
  FaCompress,
  FaBell,
  FaCheck,
  FaChevronDown,
  FaCheckDouble
} from "react-icons/fa";
import "../../styles/header.css";


function Header({ isDarkMode, setIsDarkMode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [store, setStore] = useState("rahul");
  const [showStoreMenu, setShowStoreMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const notifRef = useRef(null);
  const storeRef = useRef(null);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New Order Received", text: "Table T9 placed order #104 (₹294)", time: "2 mins ago", unread: true },
    { id: 2, title: "KOT Status Update", text: "Kitchen marked Chicken 65 Ready", time: "5 mins ago", unread: true },
    { id: 3, title: "Loyalty Points Claimed", text: "Customer +91 9876543210 redeemed 50 pts", time: "12 mins ago", unread: false }
  ]);
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (storeRef.current && !storeRef.current.contains(event.target)) {
        setShowStoreMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };
  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("res360_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("res360_token");
    localStorage.removeItem("res360_user");
    window.location.href = "/login";
  };

  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="header">

      <div className="header-left">
        <h1>Resturant360</h1>
        
      </div>


      <div className="header-right">

        <button
          className={`status-pill ${isOnline ? "online" : "offline"}`}
          onClick={() => setIsOnline(!isOnline)}
          title="Click to toggle Online/Offline status"
        >
          <span className="status-dot"></span>
          <span>{isOnline ? "Online" : "Offline"}</span>
        </button>


        <div className="store-pill-wrapper" ref={storeRef}>
          <button
            className="store-pill"
            onClick={() => {
              setShowStoreMenu((prev) => !prev);
              setShowNotifications(false);
            }}
          >
            <FaStore className="store-icon" />
            <span>{store}</span>
            <FaChevronDown className={`arrow-icon ${showStoreMenu ? "open" : ""}`} />
          </button>

          {showStoreMenu && (
            <div className="header-dropdown store-dropdown">
              <div className="dropdown-title">Select Branch / Store</div>
              {["rahul", "Main Branch - Downtown", "Express Outlet - Station"].map((branch) => (
                <div
                  key={branch}
                  className={`dropdown-item ${store === branch ? "active" : ""}`}
                  onClick={() => {
                    setStore(branch);
                    setShowStoreMenu(false);
                  }}
                >
                  <span>{branch}</span>
                  {store === branch && <FaCheck className="check-icon" />}
                </div>
              ))}
            </div>
          )}
        </div>


        <button
          className="header-icon-btn theme-toggle-btn"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? <FaSun className="sun-icon" /> : <FaMoon className="moon-icon" />}
        </button>


        <button
          className="header-icon-btn"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <FaCompress /> : <FaExpand />}
        </button>


        <div className="notification-wrapper" ref={notifRef}>
          <button
            className={`header-icon-btn notification-btn ${showNotifications ? "active" : ""}`}
            title="Notifications"
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifications((prev) => !prev);
              setShowStoreMenu(false);
            }}
          >
            <FaBell />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="header-dropdown notification-dropdown">
              <div className="dropdown-header">
                <div className="notif-header-title">
                  <FaBell className="header-icon" />
                  <span>Notifications</span>
                  {unreadCount > 0 && <span className="count-pill">{unreadCount} New</span>}
                </div>
                {unreadCount > 0 && (
                  <button className="mark-read-btn" onClick={markAllRead}>
                    <FaCheckDouble /> Read all
                  </button>
                )}
              </div>

              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="empty-notif">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`notif-card ${n.unread ? "unread" : ""}`}>
                      <div className="notif-card-header">
                        <span className="notif-card-title">{n.title}</span>
                        <span className="notif-card-time">{n.time}</span>
                      </div>
                      <p className="notif-card-text">{n.text}</p>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="dropdown-footer">
                  <button
                    className="clear-all-btn"
                    onClick={() => setNotifications([])}
                  >
                    Clear All Notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>


        <div className="user-profile" title={currentUser?.email || "User Profile"}>
          <div className="avatar-circle">
            {getInitials(currentUser?.name)}
          </div>
          <div className="user-info">
            <span className="user-name">{currentUser?.name || "Admin"}</span>
            <span className="user-role" style={{ textTransform: "capitalize" }}>
              {currentUser?.role || "Owner"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            style={{
              background: "rgba(239, 68, 68, 0.12)",
              color: "#ef4444",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              padding: "5px 9px",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: "600",
              cursor: "pointer",
              marginLeft: "6px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.2s"
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
