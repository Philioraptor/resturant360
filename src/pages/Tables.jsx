import { useEffect, useMemo, useState } from "react";
import "../styles/tableLayout.css";
import { useNavigate } from "react-router-dom";
import { getTables, updateTableStatus, createTable, deleteTable as deleteTableAPI } from "../services/api";

const initialFloors = {
  "Ground Floor": [
    { id: "T1", seats: 4, status: "available" },
    { id: "T2", seats: 4, status: "available" },
    { id: "T3", seats: 4, status: "available" },
    { id: "T4", seats: 8, status: "available" },
    { id: "T5", seats: 2, status: "available" },
    { id: "T6", seats: 4, status: "available" },
  ],

  "First Floor": [
    { id: "T7", seats: 4, status: "available" },
    { id: "T8", seats: 4, status: "available" },
    { id: "T9", seats: 6, status: "available" },
  ],

  Terrace: [
    { id: "T10", seats: 4, status: "available" },
    { id: "T11", seats: 6, status: "available" },
  ],

  "VIP Cabin": [
    { id: "V1", seats: 6, status: "available" },
    { id: "V2", seats: 8, status: "available" },
  ],
};

const statusLabels = {
  available: "AVAILABLE",
  occupied: "OCCUPIED",
  reserved: "RESERVED",
  billing: "BILLING",
  cleaning: "CLEANING",
};

function Tables() {
  const [floors, setFloors] = useState(initialFloors);
  const navigate = useNavigate();
  const [activeFloor, setActiveFloor] = useState("Ground Floor");

  useEffect(() => {
    const loadTables = async () => {
      try {
        const data = await getTables();
        if (data && typeof data === 'object') {
          setFloors(data);
          setActiveFloor(Object.keys(data)[0] || 'Ground Floor');
        }
      } catch (error) {
        console.error('Failed to load tables:', error);
      }
    };

    loadTables();
  }, []);

  const [selectedTableId, setSelectedTableId] = useState("T1");

  const [search, setSearch] = useState("");

  const currentTables = floors[activeFloor] || [];
 const [showFloorModal, setShowFloorModal] = useState(false);
const [newFloorName, setNewFloorName] = useState("");
  const selectedTable =
    currentTables.find((table) => table.id === selectedTableId) ||
    currentTables[0];



  const filteredTables = useMemo(() => {
    return currentTables.filter((table) =>
      table.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [currentTables, search]);



  const statusCount = (status) => {
    return currentTables.filter(
      (table) => table.status === status
    ).length;
  };



  const selectTable = (table) => {
    setSelectedTableId(table.id);
  };



  const changeStatus = async (status) => {
    if (!selectedTable) return;

    try {
      await updateTableStatus(selectedTable.id, status);
      setFloors((previous) => ({
        ...previous,

        [activeFloor]: previous[activeFloor].map((table) =>
          table.id === selectedTable.id
            ? { ...table, status }
            : table
        ),
      }));
    } catch (error) {
      console.error('Failed to update table status:', error);
    }
  };



const addTable = async () => {
  const maxNumber = Object.values(floors)
    .flat()
    .reduce((max, table) => {
      const num = parseInt(String(table.id).replace(/\D/g, "")) || 0;
      return Math.max(max, num);
    }, 0);

  const newTableId = `T${maxNumber + 1}`;
  const payload = {
    tableId: newTableId,
    floor: activeFloor,
    seats: 4,
    status: "available",
  };

  try {
    const created = await createTable(payload);
    const newTable = {
      id: created.id || created.tableId || newTableId,
      seats: created.seats || 4,
      status: created.status || "available",
    };

    setFloors((prev) => ({
      ...prev,
      [activeFloor]: [...(prev[activeFloor] || []), newTable],
    }));

    setSelectedTableId(newTable.id);
  } catch (err) {
    console.error("Create table failed:", err);
    alert(err.message || "Failed to add table.");
  }
};

const deleteTable = async () => {
  if (!selectedTable) return;

  const confirmDelete = window.confirm(
    `Delete ${selectedTable.id}?`
  );

  if (!confirmDelete) return;

  try {
    await deleteTableAPI(selectedTable.id);
    const updatedTables = currentTables.filter(
      (table) => table.id !== selectedTable.id
    );

    setFloors((previous) => ({
      ...previous,
      [activeFloor]: updatedTables,
    }));

    setSelectedTableId(
      updatedTables.length > 0
        ? updatedTables[0].id
        : null
    );
  } catch (err) {
    console.error("Delete table failed:", err);
    alert(err.message || "Failed to delete table.");
  }
};



  const changeFloor = (floor) => {
    setActiveFloor(floor);

    const firstTable = floors[floor]?.[0];

    setSelectedTableId(
      firstTable ? firstTable.id : null
    );

    setSearch("");
  };
  /* =========================
   ADD FLOOR
========================= */

const handleAddFloor = () => {
  const name = newFloorName.trim();
 

  if (!name) return;

  if (floors[name]) {
    alert("Floor already exists.");
    return;
  }

  setFloors((prev) => ({
    ...prev,
    [name]: [],
  }));

  setActiveFloor(name);
  setSelectedTableId(null);
  setSearch("");
  setNewFloorName("");
  setShowFloorModal(false);
};


  
  /* =========================
     OPEN POS
  ========================= */



const openPOS = () => {
  if (!selectedTable) return;

  navigate(`/billing?table=${selectedTable.id}`);
};

  return (
    <div className="tables-page">



      <div className="tables-page-header">

        <div>
          <h1>Table Management</h1>

          <p>
            Floor layout, reservations & assignments.
          </p>
        </div>

        <div className="table-header-actions">

          <div className="table-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search table..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <div className="table-online">
            <span></span>
            Online
          </div>

          <button className="table-user">

            <span className="user-avatar">
              CA
            </span>

            cashier1

            <span>⌄</span>

          </button>

        </div>

      </div>



      <div className="tables-content">



        <div className="tables-toolbar">

          <div className="floor-tabs">

            {Object.keys(floors).map((floor) => (
              <button
                key={floor}
                className={
                  activeFloor === floor
                    ? "floor-active"
                    : ""
                }
                onClick={() =>
                  changeFloor(floor)
                  
                }
              >
                {floor}
              </button>
            ))}
            <button className="add-floor" onClick={() => setShowFloorModal(true)}>
             +
            </button>

          </div>



          <div className="table-status">

            <span>
              <i className="available-dot"></i>
              Available ({statusCount("available")})
            </span>

            <span>
              <i className="occupied-dot"></i>
              Occupied ({statusCount("occupied")})
            </span>

            <span>
              <i className="reserved-dot"></i>
              Reserved ({statusCount("reserved")})
            </span>

            <span>
              <i className="billing-dot"></i>
              Billing ({statusCount("billing")})
            </span>

          </div>



          <div className="table-actions">

            <button
              className="delete-section"
              onClick={deleteTable}
            >
              Delete Table
            </button>

            <button
              className="add-table"
              onClick={addTable}
            >
              + Add Table
            </button>

          </div>

        </div>



        <div className="tables-workspace">



          <div className="tables-grid">

            {filteredTables.length === 0 ? (

              <div className="no-tables">
                No tables found
              </div>

            ) : (

              filteredTables.map((table) => (

                <button
                  key={table.id}
                  className={`table-card ${
                    selectedTable?.id === table.id
                      ? "selected"
                      : ""
                  } status-${table.status}`}
                  onClick={() =>
                    selectTable(table)
                  }
                >

                  <div className="table-card-top">

                    <strong>
                      {table.id}
                    </strong>

                    <span>
                      {table.seats} Pax
                    </span>

                  </div>

                  <div className="table-circle">
                    <span>▦</span>
                  </div>

                  <div className="table-status-text">
                    {statusLabels[table.status]}
                  </div>

                  <small>
                    {table.status === "available"
                      ? "Ready"
                      : "In Use"}
                  </small>

                </button>

              ))

            )}

          </div>



          {selectedTable ? (

            <aside className="table-details-panel">

              <div className="details-title">

                <h2>
                  Table {selectedTable.id}
                </h2>

                <span
                  className={`available-badge badge-${selectedTable.status}`}
                >
                  {statusLabels[selectedTable.status]}
                </span>

              </div>



              <button
                className="open-pos"
                onClick={openPOS}
              >
                ₹ &nbsp; Take Order / Open POS
              </button>



              <div className="table-info">

                <div>
                  <span>
                    ♙ Capacity
                  </span>

                  <strong>
                    {selectedTable.seats} Seats
                  </strong>
                </div>

                <div>
                  <span>
                    ⌖ Area Section
                  </span>

                  <strong>
                    {activeFloor}
                  </strong>
                </div>

              </div>



              <div className="details-section">

                <h4>
                  UPDATE STATUS
                </h4>

                <div className="status-grid">

                  <button
                    className={
                      selectedTable.status ===
                      "available"
                        ? "status-active"
                        : ""
                    }
                    onClick={() =>
                      changeStatus("available")
                    }
                  >
                    Set Available
                  </button>

                  <button
                    className={
                      selectedTable.status ===
                      "occupied"
                        ? "status-active"
                        : ""
                    }
                    onClick={() =>
                      changeStatus("occupied")
                    }
                  >
                    Set Occupied
                  </button>

                  <button
                    className={
                      selectedTable.status ===
                      "reserved"
                        ? "status-active"
                        : ""
                    }
                    onClick={() =>
                      changeStatus("reserved")
                    }
                  >
                    Set Reserved
                  </button>

                  <button
                    className={
                      selectedTable.status ===
                      "billing"
                        ? "status-active"
                        : ""
                    }
                    onClick={() =>
                      changeStatus("billing")
                    }
                  >
                    Set Billing
                  </button>

                  <button
                    className={
                      selectedTable.status ===
                      "cleaning"
                        ? "status-active"
                        : ""
                    }
                    onClick={() =>
                      changeStatus("cleaning")
                    }
                  >
                    Set Cleaning
                  </button>

                </div>

              </div>



              <div className="details-section">

                <h4>
                  ERP OPERATIONS
                </h4>

                <div className="erp-list">

                  <button
                    onClick={() =>
                      alert(
                        `Transfer ${selectedTable.id}`
                      )
                    }
                  >
                    ⇄ &nbsp; Transfer Table
                  </button>

                  <button
                    onClick={() =>
                      alert(
                        `Merge ${selectedTable.id}`
                      )
                    }
                  >
                    ♧ &nbsp; Merge Table
                  </button>

                  <button
                    onClick={() =>
                      alert(
                        "Dissolve merged group"
                      )
                    }
                  >
                    🔗 &nbsp; Dissolve Merged Group
                  </button>

                  <button
                    onClick={() =>
                      alert(
                        `Book reservation for ${selectedTable.id}`
                      )
                    }
                  >
                    ▣ &nbsp; Book Reservation
                  </button>

                  <button
                    onClick={deleteTable}
                  >
                    ⌫ &nbsp; Delete Table
                  </button>

                </div>

              </div>

            </aside>

          ) : (

            <aside className="table-details-panel">
              <div className="no-selection">
                No table selected
              </div>
            </aside>

          )}

        </div>

      </div>
      {showFloorModal && (
  <div className="floor-modal-overlay">
    <div className="floor-modal">
      <h3>Add New Floor</h3>

      <input
        type="text"
        placeholder="Enter floor name"
        value={newFloorName}
        onChange={(e) => setNewFloorName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAddFloor();
        }}
      />

      <div className="floor-modal-actions">
        <button
          className="cancel-btn"
          onClick={() => {
            setShowFloorModal(false);
            setNewFloorName("");
          }}
        >
          Cancel
        </button>

        <button
          className="create-btn"
          onClick={handleAddFloor}
        >
          Create Floor
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default Tables;