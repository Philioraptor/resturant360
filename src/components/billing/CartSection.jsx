import { useState } from "react";
import {
  FaCoffee,
  FaUser,
  FaUsers,
  FaFileAlt,
  FaUtensils,
  FaHistory,
  FaTimesCircle,
  FaMinus,
  FaPlus,
  FaChevronDown,
  FaCheckCircle,
  FaReceipt
} from "react-icons/fa";
import { createOrder } from "../../services/api";
import ReceiptModal from "./ReceiptModal";
import SplitBillModal from "./SplitBillModal";

function CartSection({ cartItems, setCartItems, addToCart }) {
  const [orderType, setOrderType] = useState("DINE IN");
  const [activeIcon, setActiveIcon] = useState("ACT9");
  const [table, setTable] = useState("Table T9");
  const [phone, setPhone] = useState("");
  const [discount, setDiscount] = useState("");
  const [salesReturn, setSalesReturn] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isPaid, setIsPaid] = useState(true);
  const [loyalty, setLoyalty] = useState(true);
  const [virtualWallet, setVirtualWallet] = useState(false);
  const [isAcActive, setIsAcActive] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptCartCopy, setReceiptCartCopy] = useState([]);
  const [receiptTotal, setReceiptTotal] = useState(0);
  const [isKotOnly, setIsKotOnly] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [heldOrders, setHeldOrders] = useState([]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const updateQuantity = (id, change) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + change;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Subtotal calculation
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const discValue = parseFloat(discount) || 0;
  const acCharge = isAcActive ? Math.round(subtotal * 0.05) : 0;

  // Exact total calculation (280 stays 280)
  let rawTotal = subtotal + acCharge - discValue;
  if (salesReturn) rawTotal = -Math.abs(rawTotal);
  const computedTotal = subtotal > 0 ? Math.max(0, rawTotal) : 0;

  const handleSave = async (print = true, kot = false, ebill = false) => {
    if (cartItems.length === 0) {
      showToast("⚠️ Cart is empty! Add dishes first.");
      return;
    }

    const currentItemsCopy = [...cartItems];
    setReceiptCartCopy(currentItemsCopy);
    setReceiptTotal(computedTotal);

    try {
      const orderPayload = {
        table,
        orderType: orderType.toLowerCase().replace(/\s+/g, '-'),
        customerName: phone || 'Walk-in Customer',
        total: computedTotal,
        paymentMethod,
        sendKitchen: true,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          qty: item.qty,
          price: item.price,
          category: item.category,
          type: item.type,
        })),
      };

      await createOrder(orderPayload);

      if (kot) {
        setIsKotOnly(true);
        if (print) {
          setShowReceipt(true);
        } else {
          showToast("✅ KOT sent to Kitchen!");
        }
      } else if (ebill) {
        const phoneNum = phone || "Customer Phone";
        showToast(`📱 E-Bill sent via WhatsApp to ${phoneNum}!`);
      } else if (print) {
        setIsKotOnly(false);
        setShowReceipt(true);
      } else {
        showToast(`🎉 Order Placed! Paid ₹${computedTotal}.`);
      }

      setCartItems([]);
      setDiscount("");
    } catch (error) {
      console.error('Order submission failed:', error);
      showToast(`❌ ${error.message || 'Could not send order to kitchen.'}`);
    }
  };

  const handleHold = () => {
    if (cartItems.length === 0) {
      showToast("⚠️ Cart is empty! Nothing to hold.");
      return;
    }
    const newHold = {
      id: Date.now(),
      table,
      items: [...cartItems],
      total: computedTotal,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setHeldOrders([newHold, ...heldOrders]);
    setCartItems([]);
    setDiscount("");
    showToast(`⏸️ Order for ${table} placed on HOLD.`);
  };

  const resumeHeldOrder = (order) => {
    setCartItems(order.items);
    setTable(order.table);
    setHeldOrders(heldOrders.filter((o) => o.id !== order.id));
    setShowHistoryModal(false);
    showToast(`▶️ Resumed held order for ${order.table}`);
  };

  return (
    <div className="cart-section">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="cart-toast-banner">
          <FaCheckCircle /> <span>{toastMessage}</span>
        </div>
      )}

      {/* Order Type Tabs */}
      <div className="order-type-tabs">
        <button
          className={orderType === "DINE IN" ? "active" : ""}
          onClick={() => setOrderType("DINE IN")}
        >
          DINE IN
        </button>
        <button
          className={orderType === "DELIVERY" ? "active" : ""}
          onClick={() => setOrderType("DELIVERY")}
        >
          DELIVERY
        </button>
        <button
          className={orderType === "PICK UP" ? "active" : ""}
          onClick={() => setOrderType("PICK UP")}
        >
          PICK UP
        </button>
      </div>

      {/* Quick Action Toolbar */}
      <div className="quick-action-bar">
        <button
          className={`action-icon-btn ${activeIcon === "ACT9" ? "active" : ""}`}
          onClick={() => setActiveIcon("ACT9")}
          title="Table Activity"
        >
          <FaCoffee />
          <span className="icon-subtext">ACT9</span>
        </button>
        <button
          className={`action-icon-btn ${activeIcon === "user" ? "active" : ""}`}
          onClick={() => {
            setActiveIcon("user");
            showToast("👤 Guest count set to 1 Person");
          }}
          title="1 Guest"
        >
          <FaUser />
        </button>
        <button
          className={`action-icon-btn ${activeIcon === "users" ? "active" : ""}`}
          onClick={() => {
            setActiveIcon("users");
            showToast("👥 Guest count set to Group");
          }}
          title="Group Guests"
        >
          <FaUsers />
        </button>
        <button
          className={`action-icon-btn ${activeIcon === "bill" ? "active" : ""}`}
          onClick={() => handleSave(true, false, false)}
          title="Preview & Print Bill"
        >
          <FaFileAlt />
        </button>
        <button
          className={`action-icon-btn ${activeIcon === "kitchen" ? "active" : ""}`}
          onClick={() => handleSave(false, true, false)}
          title="Send KOT to Kitchen"
        >
          <FaUtensils />
        </button>
        <button
          className={`action-icon-btn ${activeIcon === "history" ? "active" : ""}`}
          onClick={() => setShowHistoryModal(true)}
          title="View Held Orders History"
        >
          <FaHistory />
          {heldOrders.length > 0 && <span className="icon-badge">{heldOrders.length}</span>}
        </button>
        <button
          className={`ac-btn ${isAcActive ? "active" : "inactive"}`}
          onClick={() => {
            setIsAcActive(!isAcActive);
            showToast(!isAcActive ? "AC Surcharge (+5%) added" : "AC Surcharge removed");
          }}
          title="Toggle AC Charge"
        >
          AC
        </button>
      </div>

      {/* Cart Controls Row */}
      <div className="cart-controls-row">
        {orderType === "DINE IN" ? (
          <div className="select-wrapper">
            <select value={table} onChange={(e) => setTable(e.target.value)}>
              <option value="Table T9">Table T9</option>
              <option value="Table T1">Table T1</option>
              <option value="Table T2">Table T2</option>
              <option value="Table T3">Table T3</option>
              <option value="Table T4">Table T4</option>
              <option value="Table T5">Table T5</option>
            </select>
            <FaChevronDown className="select-arrow" />
          </div>
        ) : (
          <input
            type="text"
            placeholder={orderType === "DELIVERY" ? "Delivery Address..." : "Pickup Name..."}
            className="cart-input"
          />
        )}

        <input
          type="text"
          placeholder="Phone (Loyalty)..."
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (e.target.value.length === 10) {
              showToast("⭐ Loyalty Member Found: 150 pts available!");
            }
          }}
          className="cart-input"
        />

        <input
          type="number"
          placeholder="Disc (₹)"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          className="cart-input disc-input"
        />
      </div>

      {/* Cart Table Header */}
      <div className="cart-table-header">
        <span className="col-items">ITEMS</span>
        <span className="col-check">CHECK ITEMS</span>
        <span className="col-qty">QTY.</span>
        <span className="col-price">PRICE</span>
      </div>

      {/* Cart Items List */}
      <div className="cart-items-list">
        {cartItems.length === 0 ? (
          <div className="empty-cart-msg">No items in cart</div>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="cart-item-row">
              <div className="item-name-col">
                <button
                  className="remove-item-btn"
                  onClick={() => removeItem(item.id)}
                  title="Remove Item"
                >
                  <FaTimesCircle />
                </button>
                <span className="item-title">{item.name}</span>
              </div>

              <div className="item-check-col">
                <span className={`veg-icon ${item.type === "Veg" ? "veg" : "non-veg"}`}>
                  <span className="inner-dot"></span>
                </span>
                <span className="item-category-tag">{item.category}</span>
              </div>

              <div className="item-qty-col">
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.id, -1)}
                >
                  <FaMinus />
                </button>
                <span className="qty-value">{item.qty}</span>
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.id, 1)}
                >
                  <FaPlus />
                </button>
              </div>

              <div className="item-price-col">
                <span className="price-main">
                  {(item.price * item.qty).toFixed(2)}
                </span>
                <span className="price-sub">
                  {(item.price * item.qty).toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Bottom Panel */}
      <div className="cart-bottom-panel">
        <div className="offers-total-row">
          <div className="offers-left">
            <button
              className="offer-btn"
              onClick={() => {
                setDiscount("50");
                showToast("🎁 BOGO Offer applied! ₹50 Discount added.");
              }}
            >
              BOGO OFFER
            </button>
            <button
              className="offer-btn"
              onClick={() => setShowSplitModal(true)}
            >
              SPLIT
            </button>
            <label className="sales-return-checkbox">
              <input
                type="checkbox"
                checked={salesReturn}
                onChange={(e) => setSalesReturn(e.target.checked)}
              />
              <span>Sales Return</span>
            </label>
          </div>

          <div className="total-badge">
            <span className="total-label">₹ Total</span>
            <span className="total-amount">{computedTotal}</span>
          </div>
        </div>

        {/* Payment Methods Row */}
        <div className="payment-methods-row">
          {["Cash", "Card", "Due", "Other", "Part"].map((method) => (
            <label key={method} className="radio-label">
              <input
                type="radio"
                name="paymentMethod"
                value={method}
                checked={paymentMethod === method}
                onChange={() => {
                  setPaymentMethod(method);
                  showToast(`Payment method set to ${method}`);
                }}
              />
              <span>{method}</span>
            </label>
          ))}
        </div>

        {/* Flags Row */}
        <div className="flags-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
            />
            <span>It's Paid</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={loyalty}
              onChange={(e) => setLoyalty(e.target.checked)}
            />
            <span>Loyalty</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={virtualWallet}
              onChange={(e) => setVirtualWallet(e.target.checked)}
            />
            <span>Virtual Wallet</span>
          </label>
        </div>

        {/* SINGLE FULL-WIDTH PRIMARY CHECKOUT ACTION BUTTON */}
        <div className="single-action-wrapper">
          <button
            className="single-checkout-btn"
            onClick={() => handleSave(true, false, false)}
          >
            <FaReceipt />
            <span>PLACE ORDER & GENERATE BILL (₹{computedTotal})</span>
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        cartItems={receiptCartCopy.length > 0 ? receiptCartCopy : cartItems}
        total={receiptTotal > 0 ? receiptTotal : computedTotal}
        orderType={orderType}
        table={table}
        paymentMethod={paymentMethod}
        isKotOnly={isKotOnly}
      />

      {/* Split Bill Modal */}
      <SplitBillModal
        isOpen={showSplitModal}
        onClose={() => setShowSplitModal(false)}
        total={computedTotal}
        cartItems={cartItems}
      />

      {/* Held Orders Modal */}
      {showHistoryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><FaHistory /> Held Orders ({heldOrders.length})</h3>
              <button className="close-modal-btn" onClick={() => setShowHistoryModal(false)}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="modal-body">
              {heldOrders.length === 0 ? (
                <p className="empty-msg">No held orders right now.</p>
              ) : (
                heldOrders.map((order) => (
                  <div key={order.id} className="held-order-card">
                    <div>
                      <strong>{order.table}</strong> ({order.items.length} items) - ₹{order.total}
                      <br />
                      <span className="subtext">Held at {order.time}</span>
                    </div>
                    <button
                      className="primary-red-btn resume-btn"
                      onClick={() => resumeHeldOrder(order)}
                    >
                      Resume
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartSection;
