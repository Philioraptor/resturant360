import { useState, useEffect } from "react";
import MenuSection from "../components/billing/MenuSection";
import CartSection from "../components/billing/CartSection";
import LicenseModal from "../components/common/LicenseModal";
import "../styles/billing.css";


function Billing() {
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("res360_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isExpired = currentUser?.isExpired || currentUser?.subscriptionStatus === "expired";

  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Paneer Tikka",
      category: "Starters",
      type: "Veg",
      price: 280,
      qty: 1
    }
  ]);

  const addToCart = (dish) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === dish.id);
      if (existing) {
        return prevItems.map((item) =>
          item.id === dish.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevItems, { ...dish, qty: 1 }];
    });
  };

  return (
    <div>
      {isExpired && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            color: "#ef4444",
            padding: "10px 16px",
            borderRadius: "10px",
            marginBottom: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          <span>
            ⚠️ Your restaurant software subscription has expired. Please apply a new license key voucher to continue.
          </span>
          <button
            onClick={() => setIsLicenseModalOpen(true)}
            style={{
              background: "#ef4444",
              color: "#fff",
              border: "none",
              padding: "5px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Recharge License
          </button>
        </div>
      )}

      <div className="billing-page-layout">
        <div className="billing-left-panel">
          <MenuSection addToCart={addToCart} />
        </div>

        <div className="billing-right-panel">
          <CartSection
            cartItems={cartItems}
            setCartItems={setCartItems}
            addToCart={addToCart}
          />
        </div>
      </div>

      <LicenseModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
        onLicenseUpdated={(newDetails) => {
          setCurrentUser((prev) => ({
            ...prev,
            subscriptionStatus: newDetails.subscriptionStatus,
            subscriptionPlan: newDetails.subscriptionPlan,
            licenseExpiresAt: newDetails.licenseExpiresAt,
            licenseKey: newDetails.licenseKey,
            daysRemaining: newDetails.daysRemaining,
            isExpired: false,
          }));
        }}
      />
    </div>
  );
}

export default Billing;
