import { useState, useEffect } from "react";
import api from "../services/api";
import "../App.css";

export default function StaffDashboard({ loggedInUser }) {
  const [activeTab, setActiveTab] = useState("queue"); // queue, pos, stock
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ignoredItemIds, setIgnoredItemIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ignoredStockItemIds") || "[]");
    } catch (e) {
      return [];
    }
  });

  // Add Menu State (Staff can add new items and restock items only)
  const [addName, setAddName] = useState("");
  const [addCategory, setAddCategory] = useState("Starters");
  const [addPrice, setAddPrice] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addQuantity, setAddQuantity] = useState("");

  // Walk-in Payment Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [payOrder, setPayOrder] = useState(null);

  // POS State
  const [posCart, setPosCart] = useState([]);
  const [walkinName, setWalkinName] = useState("");
  const [walkinGuests, setWalkinGuests] = useState(0);
  const [posLoading, setPosLoading] = useState(false);

  // Load orders
  const loadOrders = async () => {
    try {
      const res = await api.get("/orders");
      // Sort: newest first
      const sorted = res.data.sort((a, b) => new Date(b.orderTime || 0) - new Date(a.orderTime || 0));
      setOrders(sorted);
    } catch (e) {
      console.error("Failed to load orders", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Load menu
  const loadMenu = async () => {
    try {
      const res = await api.get("/menu");
      setMenuItems(res.data);
    } catch (e) {
      console.error("Failed to load menu", e);
    } finally {
      setLoadingMenu(false);
    }
  };

  // Load customers
  const loadCustomers = async () => {
    try {
      const res = await api.get("/customers");
      setCustomers(res.data);
    } catch (e) {
      console.error("Failed to load customers list", e);
    }
  };

  useEffect(() => {
    loadOrders();
    loadMenu();
    loadCustomers();

    // Poll orders, menu, and customers every 8 seconds
    const interval = setInterval(() => {
      loadOrders();
      loadMenu();
      loadCustomers();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "ignoredStockItemIds") {
        try {
          setIgnoredItemIds(JSON.parse(e.newValue || "[]"));
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (menuItems.length > 0) {
      try {
        const currentIgnored = JSON.parse(localStorage.getItem("ignoredStockItemIds") || "[]");
        const activeLowStockIds = menuItems.filter(item => item.availableQuantity <= 10).map(item => item.itemId);
        const cleanedIgnored = currentIgnored.filter(id => activeLowStockIds.includes(id));
        
        const isSame = cleanedIgnored.length === currentIgnored.length && 
                       cleanedIgnored.every((val, index) => val === currentIgnored[index]);
        if (!isSame) {
          localStorage.setItem("ignoredStockItemIds", JSON.stringify(cleanedIgnored));
          setIgnoredItemIds(cleanedIgnored);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [menuItems]);

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/${newStatus}`);
      loadOrders();
      
      // Update selected order details if open
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));
      }
      
      alert(`Order ${orderId} updated to ${newStatus}`);
    } catch (e) {
      console.error("Failed to update status", e);
      alert("Failed to update order status");
    }
  };

  // Delete/Cancel order
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm(`Are you sure you want to cancel and delete order ${orderId}?`)) {
      try {
        await api.delete(`/orders/${orderId}`);
        setSelectedOrder(null);
        loadOrders();
        alert("Order cancelled successfully");
      } catch (e) {
        console.error(e);
        alert("Failed to delete order");
      }
    }
  };

  // Update menu item quantity
  const handleUpdateStock = async (itemId, newQty) => {
    const qtyInt = parseInt(newQty);
    if (isNaN(qtyInt) || qtyInt < 0) {
      alert("Please enter a valid stock quantity (0 or more)");
      return;
    }

    try {
      await api.put(`/menu/${itemId}/${qtyInt}`);
      loadMenu();
      alert("Stock updated successfully");
    } catch (e) {
      console.error(e);
      alert("Failed to update stock");
    }
  };

  // Edit Menu Handlers (Staff can add new items and restock items only)
  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    if (!addName || !addPrice || !addQuantity) {
      alert("Please fill in required fields.");
      return;
    }

    try {
      await api.post("/menu", {
        itemName: addName,
        category: addCategory,
        description: addDescription,
        price: Number(addPrice),
        availableQuantity: Number(addQuantity),
        availability: "Available"
      });

      // Clear Form
      setAddName("");
      setAddCategory("Starters");
      setAddDescription("");
      setAddPrice("");
      setAddQuantity("");

      // Reload
      loadMenu();
      alert("Menu item added successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to add menu item");
    }
  };

  const handleUpstock = async (item) => {
    const newQty = item.availableQuantity + 1;
    try {
      await api.put(`/menu/${item.itemId}/${newQty}`);
      loadMenu();
    } catch (e) {
      console.error("Failed to upstock", e);
    }
  };

  const handleDownstock = async (item) => {
    if (item.availableQuantity <= 0) return;
    const newQty = item.availableQuantity - 1;
    try {
      await api.put(`/menu/${item.itemId}/${newQty}`);
      loadMenu();
    } catch (e) {
      console.error("Failed to downstock", e);
    }
  };

  // Walk-in Online Payment Modal Handlers
  const handleOpenPayModal = (order) => {
    setPayOrder(order);
    setShowPayModal(true);
  };

  const handleClosePayModal = () => {
    setShowPayModal(false);
    setPayOrder(null);
  };

  const handleSimulateOnlinePay = async () => {
    if (!payOrder) return;
    try {
      await api.put(`/orders/${payOrder.orderId}/Paid`);
      loadOrders();
      if (selectedOrder && selectedOrder.orderId === payOrder.orderId) {
        setSelectedOrder(prev => ({ ...prev, orderStatus: "Paid" }));
      }
      alert("💳 Mock Online Payment Success! Order status updated to Paid.");
      handleClosePayModal();
    } catch (e) {
      console.error(e);
      alert("Failed to process payment");
    }
  };

  // Walk-in POS handlers
  const addToPosCart = (item) => {
    const existing = posCart.find(c => c.itemId === item.itemId);
    const cartQty = existing ? existing.quantity : 0;

    if (cartQty >= item.availableQuantity) {
      alert(`Only ${item.availableQuantity} of ${item.itemName} are available in stock.`);
      return;
    }

    if (existing) {
      setPosCart(posCart.map(c => c.itemId === item.itemId ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setPosCart([...posCart, { itemId: item.itemId, itemName: item.itemName, price: item.price, quantity: 1 }]);
    }
  };

  const removeFromPosCart = (itemId) => {
    setPosCart(posCart.map(c => c.itemId === itemId ? { ...c, quantity: c.quantity - 1 } : c).filter(c => c.quantity > 0));
  };

  const submitPosOrder = async (e) => {
    e.preventDefault();
    if (posCart.length === 0) {
      alert("Please add items to the POS cart.");
      return;
    }
    if (!walkinName.trim()) {
      alert("Please enter a customer name.");
      return;
    }

    setPosLoading(true);
    try {
      // 1. Create walk-in customer
      const custRes = await api.post("/customers", {
        customerName: `Walk-in (${walkinName.trim()})`,
        accompanyingPeople: Number(walkinGuests)
      });

      const customerId = custRes.data.customerId;

      // 2. Place order
      const orderItems = posCart.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity
      }));

      const orderRes = await api.post("/orders", {
        customerId,
        items: orderItems
      });

      const orderId = orderRes.data.orderId;

      alert(`POS Order placed successfully!\nOrder ID: ${orderId}`);
      
      // Reset POS form
      setPosCart([]);
      setWalkinName("");
      setWalkinGuests(0);
      loadOrders();
      loadMenu();
      loadCustomers();
      setActiveTab("queue");
    } catch (err) {
      console.error(err);
      alert("Failed to submit POS order. Check stock levels.");
    } finally {
      setPosLoading(false);
    }
  };

  const getCustomerName = (customerId) => {
    const c = customers.find(cust => cust.customerId === customerId);
    return c ? c.customerName : customerId;
  };

  const getCustomerPartySize = (customerId) => {
    const c = customers.find(cust => cust.customerId === customerId);
    return c ? c.partySize : "N/A";
  };

  const subtotal = posCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  // Low Stock Level warning
  const lowStockItems = menuItems.filter(item => item.availableQuantity <= 10 && !ignoredItemIds.includes(item.itemId));
  const lowStockCount = lowStockItems.length;

  return (
    <div className="container animate-fade">
      {/* Flashing Low Stock Alert Banner */}
      {lowStockCount > 0 && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: "16px 24px", 
            marginBottom: "20px", 
            borderLeft: "5px solid var(--danger)", 
            background: "rgba(239, 68, 68, 0.08)",
            textAlign: "left",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            animation: "pulse 2s infinite" 
          }}
        >
          <div>
            <strong style={{ color: "#ffffff", fontSize: "1.05rem" }}>⚠️ INVENTORY WARNING: Low Stock Levels Detected</strong>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              There are <strong style={{ color: "var(--danger)" }}>{lowStockCount}</strong> menu items currently falling below the threshold of 10 units. Please review inventory immediately.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: "0.8rem", padding: "6px 12px", border: "1px solid var(--danger-border)", color: "var(--danger)" }}
              onClick={() => setActiveTab("stock")}
            >
              Review Stock
            </button>
            <button 
              className="btn btn-glass" 
              style={{ fontSize: "0.8rem", padding: "6px 12px" }}
              onClick={() => {
                const newIgnored = [...ignoredItemIds, ...lowStockItems.map(item => item.itemId)];
                setIgnoredItemIds(newIgnored);
                localStorage.setItem("ignoredStockItemIds", JSON.stringify(newIgnored));
              }}
            >
              Ignore Warning
            </button>
          </div>
        </div>
      )}

      {/* Title Header */}
      <div className="glass-panel" style={{ padding: "20px 30px", marginBottom: "30px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontFamily: "var(--display)" }}>Staff Dashboard</h1>
          <p style={{ color: "var(--text-secondary)" }}>Signed in as: <strong style={{ color: "white" }}>{loggedInUser?.fullName || "Employee"}</strong></p>
        </div>
        <div className="tab-headers" style={{ marginBottom: 0 }}>
          <button className={`tab-btn ${activeTab === "queue" ? "active" : ""}`} onClick={() => setActiveTab("queue")}>📋 Active Orders</button>
          <button className={`tab-btn ${activeTab === "pos" ? "active" : ""}`} onClick={() => setActiveTab("pos")}>💻 Walk-in POS</button>
          <button className={`tab-btn ${activeTab === "stock" ? "active" : ""}`} onClick={() => setActiveTab("stock")}>📝 Edit Menu</button>
        </div>
      </div>

      {/* Main Tab Contents */}
      {activeTab === "queue" && (
        <div className="split-layout">
          {/* Order Queue List */}
          <div className="glass-panel" style={{ padding: "24px", textAlign: "left" }}>
            <div className="flex-between" style={{ marginBottom: "16px" }}>
              <h2 style={{ fontFamily: "var(--display)", fontSize: "1.4rem" }}>Orders Queue</h2>
              <button onClick={loadOrders} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>🔄 Refresh</button>
            </div>

            {loadingOrders ? (
              <div className="flex-center" style={{ padding: "40px 0" }}>
                <div className="spinner"></div>
              </div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                📭 No active orders in queue.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "650px", overflowY: "auto", paddingRight: "4px" }}>
                {orders.map(order => {
                  const custName = getCustomerName(order.customerId);
                  const isSelected = selectedOrder?.orderId === order.orderId;
                  
                  return (
                    <div
                      key={order.orderId}
                      className="glass-panel"
                      onClick={() => setSelectedOrder(order)}
                      style={{
                        padding: "16px",
                        cursor: "pointer",
                        background: isSelected ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.01)",
                        borderColor: isSelected ? "var(--accent)" : "var(--border-glass)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div className="flex-between" style={{ marginBottom: "8px" }}>
                        <div>
                          <strong style={{ color: "#ffffff", marginRight: "8px" }}>{order.orderId}</strong>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{custName}</span>
                        </div>
                        <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      
                      <div className="flex-between" style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        <span>Total: <strong style={{ color: "var(--accent)" }}>₹{order.totalAmount?.toFixed(2)}</strong></span>
                        <span>{order.orderTime ? new Date(order.orderTime).toLocaleTimeString() : "N/A"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Side: Order Detail & Actions Panel */}
          <div className="glass-panel" style={{ padding: "24px", textAlign: "left" }}>
            {selectedOrder ? (
              <div>
                <div className="flex-between" style={{ borderBottom: "1px solid var(--border-glass)", paddingBottom: "14px", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ fontFamily: "var(--display)", fontSize: "1.4rem" }}>Order Details</h2>
                    <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>ID: <strong style={{ color: "white" }}>{selectedOrder.orderId}</strong></span>
                  </div>
                  <button onClick={() => handleDeleteOrder(selectedOrder.orderId)} className="btn btn-danger" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>
                    Cancel Order
                  </button>
                </div>

                {/* Details Fields */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Guest Name</span>
                    <div style={{ fontWeight: "600", color: "#ffffff", marginTop: "4px" }}>
                      {getCustomerName(selectedOrder.customerId)}
                    </div>
                  </div>
                  <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Table Party Size</span>
                    <div style={{ fontWeight: "600", color: "#ffffff", marginTop: "4px" }}>
                      {getCustomerPartySize(selectedOrder.customerId)} Guests
                    </div>
                  </div>
                </div>

                {/* Itemized Order list */}
                <h3 style={{ fontSize: "1.1rem", marginBottom: "10px", fontFamily: "var(--display)" }}>Ordered Items</h3>
                <div style={{ background: "rgba(0, 0, 0, 0.2)", borderRadius: "8px", padding: "10px 16px", marginBottom: "24px", maxHeight: "250px", overflowY: "auto" }}>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex-between" style={{ padding: "8px 0", borderBottom: idx < selectedOrder.items.length - 1 ? "1px solid rgba(255, 255, 255, 0.05)" : "none" }}>
                        <div>
                          <span style={{ color: "#ffffff", fontWeight: "500" }}>{item.menuItem?.itemName || `Dish #${item.itemId}`}</span>
                          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginLeft: "8px" }}>₹{item.sellingPrice?.toFixed(2)} each</span>
                        </div>
                        <strong style={{ color: "var(--accent)" }}>x{item.quantity}</strong>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "10px 0", color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center" }}>
                      No items found in this order.
                    </div>
                  )}
                </div>

                {/* Financial Summary */}
                <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "14px", marginBottom: "30px", fontSize: "0.95rem" }}>
                  <div className="flex-between" style={{ marginBottom: "6px" }}>
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex-between" style={{ marginBottom: "6px" }}>
                    <span>GST (18%):</span>
                    <span>₹{selectedOrder.gst?.toFixed(2)}</span>
                  </div>
                  <div className="flex-between" style={{ fontSize: "1.2rem", fontWeight: "700", borderTop: "1px dotted var(--border-glass)", paddingTop: "10px", marginTop: "4px" }}>
                    <span style={{ color: "#ffffff" }}>Grand Total:</span>
                    <span style={{ color: "var(--accent)" }}>₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>

                {/* Live Status Management Stepper Controls */}
                <h3 style={{ fontSize: "1.1rem", marginBottom: "12px", fontFamily: "var(--display)" }}>Progress Order Stage</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {selectedOrder.orderStatus === "Pending" && (
                    <button onClick={() => handleUpdateStatus(selectedOrder.orderId, "Confirmed")} className="btn btn-primary" style={{ flexGrow: 1 }}>
                      ✓ Confirm Order
                    </button>
                  )}
                  {(selectedOrder.orderStatus === "Confirmed" || selectedOrder.orderStatus === "Preparing" || selectedOrder.orderStatus === "Ready") && (
                    <button onClick={() => handleUpdateStatus(selectedOrder.orderId, "Served")} className="btn btn-primary" style={{ flexGrow: 1, background: "#2dd4bf", color: "#0b0f19" }}>
                      🚀 Serve to Table
                    </button>
                  )}
                  {selectedOrder.orderStatus === "Served" && (
                    getCustomerName(selectedOrder.customerId).toLowerCase().includes("walk-in") ? (
                      <div style={{ background: "rgba(223, 183, 67, 0.15)", border: "1px solid var(--accent)", padding: "16px", borderRadius: "12px", width: "100%" }}>
                        <div style={{ fontWeight: "600", color: "white", marginBottom: "12px", textAlign: "center" }}>
                          🏃 Walk-in Order Settlement
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button 
                            type="button"
                            onClick={() => handleUpdateStatus(selectedOrder.orderId, "Paid")} 
                            className="btn btn-primary" 
                            style={{ flex: 1, background: "var(--success)", color: "#0b0f19", fontSize: "0.85rem", padding: "10px", margin: 0 }}
                          >
                            💵 Settle Cash
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleOpenPayModal(selectedOrder)} 
                            className="btn btn-primary" 
                            style={{ flex: 1, background: "var(--accent)", color: "#0b0f19", fontSize: "0.85rem", padding: "10px", margin: 0 }}
                          >
                            📱 Pay Online (QR)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: "rgba(45, 212, 191, 0.15)", border: "1px solid #2dd4bf", color: "#2dd4bf", padding: "12px", borderRadius: "8px", width: "100%", textAlign: "center", fontWeight: "600", fontSize: "0.9rem" }}>
                        🍽️ Food Served. Awaiting Customer Payment...
                      </div>
                    )
                  )}
                  {selectedOrder.orderStatus === "Paid" && (
                    <div style={{ background: "var(--success-bg)", border: "1px solid var(--success-border)", color: "var(--success)", padding: "12px", borderRadius: "8px", width: "100%", textAlign: "center", fontWeight: "600", fontSize: "0.9rem" }}>
                      💵 Order Completed & Paid
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "350px", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "15px" }}>👆</div>
                <p>Select an order from the queue to view details and manage preparation status.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "pos" && (
        <div className="split-layout">
          {/* POS Menu Grid */}
          <div className="glass-panel" style={{ padding: "24px", textAlign: "left" }}>
            <h2 style={{ fontFamily: "var(--display)", fontSize: "1.4rem", marginBottom: "16px" }}>Select Dishes</h2>
            {loadingMenu ? (
              <div className="flex-center" style={{ padding: "40px 0" }}>
                <div className="spinner"></div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", maxHeight: "600px", overflowY: "auto", paddingRight: "4px" }}>
                {menuItems.map(item => {
                  const isOutOfStock = item.availableQuantity === 0;
                  return (
                    <div 
                      key={item.itemId} 
                      className="glass-panel" 
                      onClick={() => !isOutOfStock && addToPosCart(item)}
                      style={{ 
                        padding: "12px", 
                        cursor: isOutOfStock ? "not-allowed" : "pointer", 
                        opacity: isOutOfStock ? 0.4 : 1,
                        background: "rgba(255, 255, 255, 0.01)" 
                      }}
                    >
                      <div style={{ fontWeight: "600", color: "#ffffff", fontSize: "0.95rem", marginBottom: "4px" }}>{item.itemName}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                        <span style={{ color: "var(--accent)" }}>₹{item.price}</span>
                        <span style={{ color: "var(--text-muted)" }}>Qty: {item.availableQuantity}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* POS Cart Details & Guest details */}
          <div className="glass-panel" style={{ padding: "24px", textAlign: "left" }}>
            <h2 style={{ fontFamily: "var(--display)", fontSize: "1.4rem", marginBottom: "20px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "10px" }}>Walk-in Guest Cart</h2>
            
            <form onSubmit={submitPosOrder}>
              <div className="grid-2col-responsive" style={{ gap: "12px", marginBottom: "20px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Guest Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Table 4"
                    value={walkinName} 
                    onChange={e => setWalkinName(e.target.value)} 
                    disabled={posLoading}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Accompanying People</label>
                  <input 
                    type="number" 
                    min="0"
                    placeholder="0"
                    value={walkinGuests} 
                    onChange={e => setWalkinGuests(e.target.value)} 
                    disabled={posLoading}
                  />
                </div>
              </div>

              {/* POS Cart list */}
              <h3 style={{ fontSize: "1rem", marginBottom: "10px", fontFamily: "var(--display)" }}>POS Cart Items</h3>
              <div style={{ background: "rgba(0, 0, 0, 0.2)", borderRadius: "8px", padding: "10px 16px", marginBottom: "20px", minHeight: "150px", maxHeight: "250px", overflowY: "auto" }}>
                {posCart.length === 0 ? (
                  <div style={{ padding: "40px 0", color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center" }}>
                    Cart is empty. Click dishes on the left to add them.
                  </div>
                ) : (
                  posCart.map(item => (
                    <div key={item.itemId} className="flex-between" style={{ padding: "6px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <div>
                        <span style={{ color: "#ffffff", fontSize: "0.9rem" }}>{item.itemName}</span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginLeft: "6px" }}>₹{item.price}</span>
                      </div>
                      <div className="qty-control">
                        <button type="button" onClick={() => removeFromPosCart(item.itemId)} className="qty-btn" style={{ width: "20px", height: "20px" }}>-</button>
                        <span style={{ fontSize: "0.85rem", fontWeight: "600", width: "16px", textAlign: "center" }}>{item.quantity}</span>
                        <button type="button" onClick={() => addToPosCart(item)} className="qty-btn" style={{ width: "20px", height: "20px" }}>+</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals */}
              {posCart.length > 0 && (
                <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "12px", marginBottom: "20px" }}>
                  <div className="flex-between" style={{ fontSize: "0.85rem", marginBottom: "4px" }}>
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex-between" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    <span>GST (18%):</span>
                    <span>₹{gst.toFixed(2)}</span>
                  </div>
                  <div className="flex-between" style={{ fontSize: "1.1rem", fontWeight: "700", paddingTop: "8px", borderTop: "1px dotted var(--border-glass)" }}>
                    <span style={{ color: "#ffffff" }}>Total:</span>
                    <span style={{ color: "var(--accent)" }}>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: "100%", padding: "12px" }}
                disabled={posLoading || posCart.length === 0}
              >
                {posLoading ? "Submitting Order..." : "🔔 Submit POS Order"}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "stock" && (
        <div className="split-layout animate-fade">
          {/* Left Side: Menu Items List */}
          <div className="glass-panel" style={{ padding: "24px", textAlign: "left" }}>
            <div className="flex-between" style={{ marginBottom: "20px" }}>
              <h2 style={{ fontFamily: "var(--display)", fontSize: "1.4rem" }}>Menu Items</h2>
              <button onClick={loadMenu} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>🔄 Reload Menu</button>
            </div>

            {loadingMenu ? (
              <div className="flex-center" style={{ padding: "40px 0" }}>
                <div className="spinner"></div>
              </div>
            ) : (
              <div style={{ maxHeight: "600px", overflow: "auto", paddingRight: "4px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--border-glass)" }}>Dish</th>
                      <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--border-glass)" }}>Price</th>
                      <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--border-glass)", textAlign: "center" }}>Stock Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuItems.map(item => (
                      <tr key={item.itemId} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                        <td style={{ padding: "12px 8px" }}>
                          <div style={{ fontWeight: "600", color: "#ffffff" }}>{item.itemName}</div>
                          <span className="role-badge customer" style={{ fontSize: "0.75rem", background: "none", padding: 0 }}>{item.category}</span>
                        </td>
                        <td style={{ padding: "12px 8px", color: "var(--accent)" }}>₹{item.price.toFixed(2)}</td>
                        <td style={{ padding: "12px 8px", textAlign: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                            <button 
                              type="button"
                              onClick={() => handleDownstock(item)} 
                              className="btn btn-glass" 
                              style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, minWidth: "auto", borderRadius: "4px" }}
                              disabled={item.availableQuantity <= 0}
                            >
                              -
                            </button>
                            <span style={{ 
                              color: item.availableQuantity <= 5 ? "var(--danger)" : 
                                     item.availableQuantity <= 15 ? "var(--warning)" : "var(--success)",
                              fontWeight: "700",
                              minWidth: "20px",
                              textAlign: "center"
                            }}>
                              {item.availableQuantity}
                            </span>
                            <button 
                              type="button"
                              onClick={() => handleUpstock(item)} 
                              className="btn btn-glass" 
                              style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, minWidth: "auto", borderRadius: "4px" }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Side: Add New Dish Form */}
          <div className="glass-panel" style={{ padding: "24px", textAlign: "left", height: "fit-content" }}>
            <h2 style={{ fontFamily: "var(--display)", fontSize: "1.3rem", marginBottom: "20px" }}>Add New Dish</h2>
            
            <form onSubmit={handleAddMenuItem} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label style={{ color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Dish Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Garlic Bread"
                  value={addName} 
                  onChange={e => setAddName(e.target.value)} 
                  required
                  style={{ width: "100%" }}
                />
              </div>

              <div className="form-group">
                <label style={{ color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Category *</label>
                <select value={addCategory} onChange={e => setAddCategory(e.target.value)} style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-glass)", borderRadius: "8px", color: "white" }}>
                  <option value="Starters">Starters</option>
                  <option value="Mains">Mains</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Drinks">Drinks</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Description</label>
                <textarea 
                  rows="3" 
                  placeholder="Describe ingredients, allergen warnings..."
                  value={addDescription} 
                  onChange={e => setAddDescription(e.target.value)}
                  style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-glass)", borderRadius: "8px", color: "white", fontFamily: "inherit" }}
                />
              </div>

              <div className="grid-2col-responsive" style={{ gap: "16px" }}>
                <div className="form-group">
                  <label style={{ color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Price (₹) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="199.00"
                    value={addPrice} 
                    onChange={e => setAddPrice(e.target.value)} 
                    required
                    style={{ width: "100%" }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Initial Stock *</label>
                  <input 
                    type="number" 
                    placeholder="50"
                    value={addQuantity} 
                    onChange={e => setAddQuantity(e.target.value)} 
                    required
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px", marginTop: "10px" }}>
                ➕ Create Menu Item
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Walk-in Customer Online Payment Modal */}
      {showPayModal && payOrder && (
        <div className="modal-overlay" style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div className="glass-panel animate-fade" style={{
            maxWidth: "450px",
            width: "100%",
            padding: "30px",
            textAlign: "center",
            border: "1px solid var(--accent)",
            background: "linear-gradient(135deg, #0a192f 0%, #020d17 100%)",
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)"
          }}>
            <h2 style={{ fontFamily: "var(--display)", color: "var(--accent)", marginBottom: "10px" }}>Dine & Desk</h2>
            <h3 style={{ color: "white", marginBottom: "20px", fontSize: "1.2rem" }}>Scan to Pay Online</h3>
            
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "15px" }}>
              Order ID: <strong style={{ color: "white" }}>{payOrder.orderId}</strong>
            </p>

            {/* Real UPI QR Code Container */}
            <div style={{
              background: "white",
              padding: "16px",
              borderRadius: "12px",
              display: "inline-block",
              marginBottom: "20px",
              boxShadow: "0 8px 16px rgba(0,0,0,0.15)"
            }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=030d17&data=${encodeURIComponent(`upi://pay?pa=dinedesk@upi&pn=Dine%20And%20Desk&am=${payOrder.totalAmount.toFixed(2)}&cu=INR&tn=Bill%20Order%20${payOrder.orderId}`)}`} 
                alt="UPI Payment QR Code" 
                style={{ width: "180px", height: "180px", display: "block" }}
              />
            </div>

            {/* Bill Summary inside Modal */}
            <div style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-glass)",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "24px",
              textAlign: "left",
              fontSize: "0.9rem"
            }}>
              <div className="flex-between" style={{ marginBottom: "6px" }}>
                <span>Subtotal:</span>
                <span>₹{payOrder.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex-between" style={{ color: "var(--text-muted)", marginBottom: "6px" }}>
                <span>GST (18%):</span>
                <span>₹{payOrder.gst?.toFixed(2)}</span>
              </div>
              <div className="flex-between" style={{ fontSize: "1.1rem", fontWeight: "700", borderTop: "1px dotted var(--border-glass)", paddingTop: "8px", marginTop: "4px" }}>
                <span style={{ color: "white" }}>Total Amount:</span>
                <span style={{ color: "var(--accent)" }}>₹{payOrder.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button type="button" onClick={handleClosePayModal} className="btn btn-secondary" style={{ flex: 1, padding: "12px" }}>
                Cancel
              </button>
              <button type="button" onClick={handleSimulateOnlinePay} className="btn btn-primary" style={{ flex: 2, padding: "12px" }}>
                💳 Simulate Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}