import { useEffect, useState, useMemo } from "react";
import { getInventory, createInventoryItem, deleteInventoryItem } from "../services/api";
import { FaPlus, FaTrash, FaExclamationTriangle, FaBoxes, FaTimes } from "react-icons/fa";

function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");

  // New item form state
  const [newItem, setNewItem] = useState({
    item: "",
    category: "Vegetables",
    stock: "",
    reorderLevel: "10",
    unit: "kg",
  });

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await getInventory();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Inventory load failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newItem.item.trim() || !newItem.stock) {
      alert("Please provide item name and current stock.");
      return;
    }

    try {
      const payload = {
        item: newItem.item.trim(),
        category: newItem.category,
        stock: Number(newItem.stock),
        reorderLevel: Number(newItem.reorderLevel || 10),
        unit: newItem.unit || "kg",
      };

      const created = await createInventoryItem(payload);
      setItems((prev) => [created, ...prev]);
      setNewItem({
        item: "",
        category: "Vegetables",
        stock: "",
        reorderLevel: "10",
        unit: "kg",
      });
      setShowAddModal(false);
    } catch (err) {
      console.error("Create inventory item failed:", err);
      alert("Failed to add inventory item: " + err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from stock?`)) return;
    try {
      await deleteInventoryItem(id);
      setItems((prev) => prev.filter((it) => (it._id ?? it.id ?? it.sku) !== id));
    } catch (err) {
      console.error("Delete inventory item failed:", err);
      alert("Failed to delete item: " + err.message);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((it) =>
      (it.item || "").toLowerCase().includes(search.toLowerCase()) ||
      (it.category || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const lowStockCount = useMemo(() => {
    return items.filter((it) => Number(it.stock) <= Number(it.reorderLevel)).length;
  }, [items]);

  return (
    <div style={{ padding: "28px", color: "var(--text-main)", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "700", margin: 0 }}>Stock & Inventory Management</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "4px", fontSize: "14px" }}>
            Track restaurant raw ingredients, stock levels, and automated reorder alerts.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#f97316",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "10px 18px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          <FaPlus /> Add Stock Item
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#111827", borderRadius: "14px", padding: "18px", border: "1px solid #1f2937" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#9ca3af", fontSize: "13px" }}>
            <FaBoxes /> Total Ingredients
          </div>
          <h2 style={{ fontSize: "28px", margin: "8px 0 0", color: "#fff" }}>{items.length}</h2>
        </div>

        <div style={{ background: "#111827", borderRadius: "14px", padding: "18px", border: "1px solid #1f2937" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#fbbf24", fontSize: "13px" }}>
            <FaExclamationTriangle /> Low Stock Alerts
          </div>
          <h2 style={{ fontSize: "28px", margin: "8px 0 0", color: lowStockCount > 0 ? "#fbbf24" : "#10b981" }}>
            {lowStockCount} {lowStockCount > 0 && <span style={{ fontSize: "12px", color: "#fbbf24" }}>Needs Reorder</span>}
          </h2>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="🔍 Search ingredients by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "400px",
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: "8px",
            padding: "10px 14px",
            color: "#fff",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Inventory Table */}
      <div style={{ background: "#111827", borderRadius: "14px", border: "1px solid #1f2937", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#0f172a" }}>
            <tr style={{ color: "#9ca3af", fontSize: "12px", textTransform: "uppercase" }}>
              <th style={{ padding: "14px 16px", textAlign: "left" }}>Ingredient Item</th>
              <th style={{ padding: "14px 16px", textAlign: "left" }}>Category</th>
              <th style={{ padding: "14px 16px", textAlign: "left" }}>Current Stock</th>
              <th style={{ padding: "14px 16px", textAlign: "left" }}>Reorder Threshold</th>
              <th style={{ padding: "14px 16px", textAlign: "left" }}>Status</th>
              <th style={{ padding: "14px 16px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: "32px", textAlign: "center", color: "#6b7280" }}>
                  {loading ? "Loading stock inventory..." : "No inventory items found."}
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isLow = Number(item.stock) <= Number(item.reorderLevel);
                const itemId = item._id || item.id || item.sku;
                return (
                  <tr key={itemId} style={{ borderTop: "1px solid #1f2937" }}>
                    <td style={{ padding: "14px 16px", fontWeight: "600" }}>{item.item}</td>
                    <td style={{ padding: "14px 16px", color: "#9ca3af" }}>{item.category}</td>
                    <td style={{ padding: "14px 16px", fontWeight: "700", color: isLow ? "#fbbf24" : "#38bdf8" }}>
                      {item.stock} {item.unit}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#9ca3af" }}>
                      {item.reorderLevel} {item.unit}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {isLow ? (
                        <span style={{ background: "#78350f", color: "#fef08a", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "600" }}>
                          ⚠️ Low Stock
                        </span>
                      ) : (
                        <span style={{ background: "#064e3b", color: "#6ee7b7", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "600" }}>
                          ✓ In Stock
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <button
                        onClick={() => handleDelete(itemId, item.item)}
                        title="Delete ingredient"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          fontSize: "14px",
                          padding: "6px",
                        }}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Stock Item Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: "16px",
              padding: "24px",
              width: "100%",
              maxWidth: "450px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ margin: 0, fontSize: "18px" }}>Add Stock Ingredient</h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "16px" }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>Ingredient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mozzarella Cheese, Basmati Rice"
                  value={newItem.item}
                  onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                  style={{ width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", padding: "10px", color: "#fff" }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  style={{ width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", padding: "10px", color: "#fff" }}
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Grains">Grains</option>
                  <option value="Poultry">Poultry</option>
                  <option value="Spices">Spices</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Packaging">Packaging</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>Current Stock *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 25"
                    value={newItem.stock}
                    onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                    style={{ width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", padding: "10px", color: "#fff" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>Unit</label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    style={{ width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", padding: "10px", color: "#fff" }}
                  >
                    <option value="kg">kg</option>
                    <option value="liter">liter</option>
                    <option value="pcs">pcs</option>
                    <option value="packets">packets</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>Low Stock Reorder Alert Level</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 10"
                  value={newItem.reorderLevel}
                  onChange={(e) => setNewItem({ ...newItem, reorderLevel: e.target.value })}
                  style={{ width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", padding: "10px", color: "#fff" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ background: "#374151", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 16px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", fontWeight: "600", cursor: "pointer" }}
                >
                  Save Ingredient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
