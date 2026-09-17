import { useEffect, useState } from "react";
import {
  FaBox,
  FaFolder,
  FaPuzzlePiece,
  FaFileCsv,
  FaPlus,
  FaEdit,
  FaTrash,
  FaUpload,
  FaCamera,
  FaLink,
  FaTimes
} from "react-icons/fa";
import { getProducts, getCategories, createProduct, createCategory } from "../services/api";
import "../styles/products.css";
const COLOR_OPTIONS = [
  { name: "None", bg: "#f1f5f9", color: "#475569" },
  { name: "Red", bg: "#fee2e2", color: "#dc2626" },
  { name: "Orange", bg: "#ffedd5", color: "#ea580c" },
  { name: "Amber", bg: "#fef3c7", color: "#d97706" },
  { name: "Yellow", bg: "#fef9c3", color: "#ca8a04" },
  { name: "Lime", bg: "#ecfccb", color: "#65a30d" },
  { name: "Green", bg: "#dcfce7", color: "#16a34a" },
  { name: "Emerald", bg: "#d1fae5", color: "#059669" },
  { name: "Teal", bg: "#ccfbf1", color: "#0d9488" },
  { name: "Cyan", bg: "#cffaff", color: "#0891b2" },
  { name: "Sky", bg: "#e0f2fe", color: "#0284c7" },
  { name: "Blue", bg: "#dbeafe", color: "#2563eb" },
  { name: "Indigo", bg: "#e0e7ff", color: "#4f46e5" },
  { name: "Violet", bg: "#ede9fe", color: "#7c3aed" },
  { name: "Purple", bg: "#f3e8ff", color: "#9333ea" },
  { name: "Fuchsia", bg: "#fae8ff", color: "#c026d3" },
  { name: "Pink", bg: "#fce7f3", color: "#db2777" },
  { name: "Rose", bg: "#ffe4e6", color: "#e11d48" }
];
const DEFAULT_TAGS = [
  "Veg", "Non-Veg", "Vegan", "Egg", "Spicy",
  "Contains Nuts", "Gluten-Free", "Dairy-Free",
  "New Arrival", "Bestseller", "Organic", "Fragrance-Free", "Limited"
];

function Products() {
  const [activeTab, setActiveTab] = useState("products");

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const productData = await getProducts();
        const categoryData = await getCategories();
        setProducts(productData?.products || []);
        setCategories(categoryData || []);
        if (categoryData.length) {
            setProdCategory(categoryData[0]._id || categoryData[0].id);
        }
      } catch (error) {
        console.error('Failed to load products data:', error);
        alert(error.message);
      }
    };

    loadData();
  }, []);
  const [addonGroups, setAddonGroups] = useState([
    { id: 1, name: "Extra Cheese", selection: "Optional", active: true },
    { id: 2, name: "Spice Level", selection: "Required", active: true }
  ]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catColor, setCatColor] = useState("None");
  const [catActive, setCatActive] = useState(true);
  const [prodName, setProdName] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodSku, setProdSku] = useState("");
  const [prodBarcode, setProdBarcode] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCostPrice, setProdCostPrice] = useState("");
  const [prodCashback, setProdCashback] = useState(0);
  const [prodTax, setProdTax] = useState("-- No Tax --");
  const [prodSelectedTags, setProdSelectedTags] = useState(["Veg"]);
  const [prodCustomTag, setProdCustomTag] = useState("");
  const [prodTrackInventory, setProdTrackInventory] = useState(false);
  const [prodActive, setProdActive] = useState(true);
  const [prodImageUrl, setProdImageUrl] = useState("");
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;

    try {
      const newCat = await createCategory({
        name: catName.trim(),
        description: catDesc.trim(),
        color: catColor,
        active: catActive,
      });

      setCategories((prev) => [...prev, newCat]);
      setCatName("");
      setCatDesc("");
      setCatColor("None");
      setCatActive(true);
      setShowAddCategoryModal(false);
    } catch (error) {
      console.error('Create category failed:', error);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice) return;

    try {
      const initials = prodName.trim().substring(0, 2).toUpperCase();
      const colors = ["#84cc16", "#14b8a6", "#3b82f6", "#a855f7", "#ec4899", "#f97316"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      console.log("Sending category:", prodCategory);
console.log("Categories:", categories);

      const selectedCategory = categories.find(
  (c) =>
    c._id === prodCategory ||
    c.id === prodCategory ||
    c.name === prodCategory
);

console.log("Selected category ID:", prodCategory);

const payload = {
  name: prodName.trim(),
  initials,
  badgeColor: randomColor,
  category: prodCategory,
  active: prodActive,
  price: Number(prodPrice),
  sku: prodSku,
  barcode: prodBarcode,
  tags: prodSelectedTags,
};

console.log("Payload:", payload);

const newProd = await createProduct(payload);

      setProducts((prev) => [...prev, newProd]);
      setProdName("");
      setProdPrice("");
      setProdCostPrice("");
      setProdSku("");
      setProdBarcode("");
      setProdCashback(0);
      setShowAddProductModal(false);
    } catch (error) {
      console.error('Create product failed:', error);
    }
  };

  const toggleTag = (tag) => {
    if (prodSelectedTags.includes(tag)) {
      setProdSelectedTags(prodSelectedTags.filter((t) => t !== tag));
    } else {
      setProdSelectedTags([...prodSelectedTags, tag]);
    }
  };

  const addCustomTag = () => {
    if (prodCustomTag.trim() && !prodSelectedTags.includes(prodCustomTag.trim())) {
      setProdSelectedTags([...prodSelectedTags, prodCustomTag.trim()]);
      setProdCustomTag("");
    }
  };

  const deleteCategory = (id) => {
    setCategories(categories.filter((c) => c._id !== id));
  };

  const deleteProduct = (id) => {
  setProducts((prev) => prev.filter((p) => p._id !== id));
};

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (activeTab === "products") {
      csvContent += "Name,Category,Price,Status\n";
      products.forEach((p) => {
        csvContent += `"${p.name}","${p.category}",${p.price},"${p.active ? "Active" : "Inactive"}"\n`;
      });
    } else {
      csvContent += "Name,Color,Status\n";
      categories.forEach((c) => {
        csvContent += `"${c.name}","${c.color}","${c.active ? "Active" : "Inactive"}"\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeTab}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="products-page">
      <div className="products-page-header">
        <h1>Products</h1>


        <div className="products-tabs-row">
          <div className="products-nav-tabs">
            <button
              className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              <FaBox /> Products
            </button>
            <button
              className={`tab-btn ${activeTab === "categories" ? "active" : ""}`}
              onClick={() => setActiveTab("categories")}
            >
              <FaFolder /> Categories
            </button>
            <button
              className={`tab-btn ${activeTab === "addons" ? "active" : ""}`}
              onClick={() => setActiveTab("addons")}
            >
              <FaPuzzlePiece /> Addon Groups
            </button>
          </div>


          <div className="products-actions-right">
            {activeTab === "products" && (
              <>
                <button className="add-secondary-btn" onClick={() => setShowAddCategoryModal(true)}>
                  + Add Category
                </button>
                <button className="csv-btn" onClick={exportCSV}>
                  <FaFileCsv /> CSV
                </button>
                <button className="add-main-btn" onClick={() => setShowAddProductModal(true)}>
                  + Add Product
                </button>
              </>
            )}

            {activeTab === "categories" && (
              <>
                <button className="csv-btn" onClick={exportCSV}>
                  <FaFileCsv /> CSV
                </button>
                <button className="add-main-btn" onClick={() => setShowAddCategoryModal(true)}>
                  + Add Category
                </button>
              </>
            )}

            {activeTab === "addons" && (
              <button className="add-main-btn" onClick={() => alert("Add Addon Group")}>
                + Add Addon Group
              </button>
            )}
          </div>
        </div>
      </div>


      {activeTab === "products" && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>CATEGORY</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "24px" }}>
                    No products added yet. Click "+ Add Product" to create one.
                  </td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod._id}>
                    <td>
                      <div className="product-cell">
                        <div
                          className="badge-avatar"
                          style={{ backgroundColor: prod.badgeColor || "#84cc16" }}
                        >
                          {prod.initials}
                        </div>
                        <span className="product-name-text">{prod.name}</span>
                      </div>
                    </td>
                    <td>{prod.category?.name||"-"}</td>
                    <td>
                      <span className={`status-badge ${prod.active ? "active" : "inactive"}`}>
                        {prod.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="icon-action-btn"
                          title="Edit Product"
                          onClick={() => {
                            setProdName(prod.name);
                            setProdPrice(prod.price.toString());
                            setProdCategory(prod.category?._id||"");
                            setShowAddProductModal(true);
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="icon-action-btn delete"
                          title="Delete Product"
                          onClick={() => deleteProduct(prod._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}


      {activeTab === "categories" && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>COLOR</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "24px" }}>
                    No categories created yet. Click "+ Add Category" to create one.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id}>
                    <td style={{ fontWeight: 700 }}>{cat.name}</td>
                    <td>
                      {cat.color && cat.color !== "None" ? (
                        <span
                          className="color-indicator-swatch"
                          style={{
                            backgroundColor:
                              COLOR_OPTIONS.find((c) => c.name === cat.color)?.bg || "#cbd5e1"
                          }}
                          title={cat.color}
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${cat.active ? "active" : "inactive"}`}>
                        {cat.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="icon-action-btn"
                          title="Edit Category"
                          onClick={() => {
                            setCatName(cat.name);
                            setCatDesc(cat.description || "");
                            setCatColor(cat.color || "None");
                            setCatActive(cat.active);
                            setShowAddCategoryModal(true);
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="icon-action-btn delete"
                          title="Delete Category"
                          onClick={() => deleteCategory(cat._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}


      {activeTab === "addons" && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>GROUP NAME</th>
                <th>SELECTION TYPE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {addonGroups.map((addon) => (
                <tr key={addon.id}>
                  <td style={{ fontWeight: 700 }}>{addon.name}</td>
                  <td>{addon.selection}</td>
                  <td>
                    <span className="status-badge active">Active</span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="icon-action-btn" title="Edit">
                        <FaEdit />
                      </button>
                      <button className="icon-action-btn delete" title="Delete">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {showAddCategoryModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-title-row">
              <h2>Add Category</h2>
              <button className="close-modal-x" onClick={() => setShowAddCategoryModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateCategory}>
              <div className="form-group-block">
                <label className="form-label">
                  Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  className="form-input-text"
                  placeholder="Enter category name"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-block">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Enter description"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                />
              </div>

              <div className="form-group-block">
                <label className="form-label">Color</label>
                <div className="color-palette-grid">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      type="button"
                      key={c.name}
                      className={`color-pill-btn ${catColor === c.name ? "selected" : ""}`}
                      style={{ backgroundColor: c.bg, color: c.color }}
                      onClick={() => setCatColor(c.name)}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-checkbox-row">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={catActive}
                    onChange={(e) => setCatActive(e.target.checked)}
                  />
                  <span>Active</span>
                </label>
              </div>

              <button type="submit" className="modal-submit-btn">
                Create
              </button>
            </form>
          </div>
        </div>
      )}


      {showAddProductModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-title-row">
              <h2>Add Product</h2>
              <button className="close-modal-x" onClick={() => setShowAddProductModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div className="form-group-block">
                <label className="form-label">
                  Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  className="form-input-text"
                  placeholder="Enter product name"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  required
                />
              </div>


              <div className="form-group-block">
                <label className="form-label">Product Image</label>
                <div className="image-upload-dropzone">
                  <FaUpload className="upload-icon" />
                  <div className="upload-text">Drag & drop an image here, or click to browse</div>
                </div>

                <div className="or-divider">
                  <span>OR USE</span>
                </div>

                <div className="image-options-row">
                  <button type="button" className="option-btn">
                    <FaCamera /> Camera
                  </button>
                  <button type="button" className="option-btn">
                    <FaLink /> Paste URL
                  </button>
                </div>
                <div className="form-subtext">Max 5 MB. Images are compressed to WebP.</div>
              </div>

              <div className="form-row-2col">
                <div className="form-group-block">
                  <label className="form-label">
                    Category <span className="required-star">*</span>
                  </label>
                  <select
                     className="form-select"
                     value={prodCategory}
                     onChange={(e) => setProdCategory(e.target.value)}
                     required
                     >
  {categories.map((c) => (
    <option key={c._id } value={c._id }>
      {c.name}
    </option>
  ))}
</select>
                </div>

                <div className="form-group-block">
                  <label className="form-label">SKU</label>
                  <input
                    type="text"
                    className="form-input-text"
                    placeholder="Enter SKU"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group-block">
                <label className="form-label">Barcode</label>
                <input
                  type="text"
                  className="form-input-text"
                  placeholder="Scan or type a barcode..."
                  value={prodBarcode}
                  onChange={(e) => setProdBarcode(e.target.value)}
                />
              </div>

              <div className="form-row-2col">
                <div className="form-group-block">
                  <label className="form-label">
                    Price (₹) <span className="required-star">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-input-text"
                    placeholder="Enter price"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group-block">
                  <label className="form-label">Cost Price</label>
                  <input
                    type="number"
                    className="form-input-text"
                    placeholder="Enter cost price"
                    value={prodCostPrice}
                    onChange={(e) => setProdCostPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group-block">
                <label className="form-label">Cashback %</label>
                <input
                  type="number"
                  className="form-input-text"
                  value={prodCashback}
                  onChange={(e) => setProdCashback(e.target.value)}
                />
                <div className="form-subtext">% of item price added to customer's loyalty wallet</div>
              </div>

              <div className="form-group-block">
                <label className="form-label">Tax category</label>
                <select
                  className="form-select"
                  value={prodTax}
                  onChange={(e) => setProdTax(e.target.value)}
                >
                  <option value="-- No Tax --">— No Tax —</option>
                  <option value="GST 5%">GST 5%</option>
                  <option value="GST 12%">GST 12%</option>
                  <option value="GST 18%">GST 18%</option>
                </select>
                <div className="form-subtext">No tax will be calculated or printed until a tax category is selected.</div>
              </div>


              <div className="form-group-block">
                <label className="form-label">Tags</label>
                <div className="tags-pills-row">
                  {DEFAULT_TAGS.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      className={`tag-toggle-btn ${prodSelectedTags.includes(tag) ? "selected" : ""}`}
                      onClick={() => toggleTag(tag)}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>

                <div className="custom-tag-input-row">
                  <input
                    type="text"
                    className="form-input-text"
                    placeholder="Type a tag and press Enter"
                    value={prodCustomTag}
                    onChange={(e) => setProdCustomTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomTag();
                      }
                    }}
                  />
                  <button type="button" className="add-tag-btn" onClick={addCustomTag}>
                    Add
                  </button>
                </div>
              </div>

              <div className="form-checkbox-row">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={prodTrackInventory}
                    onChange={(e) => setProdTrackInventory(e.target.checked)}
                  />
                  <span>Track Inventory</span>
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={prodActive}
                    onChange={(e) => setProdActive(e.target.checked)}
                  />
                  <span>Active</span>
                </label>
              </div>

              <button type="submit" className="modal-submit-btn">
                Create Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
