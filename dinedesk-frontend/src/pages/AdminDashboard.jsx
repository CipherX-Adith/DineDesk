import { useEffect, useState } from "react";
import api from "../services/api";
import "../App.css";

export default function AdminDashboard({ loggedInUser }) {
  const [activeTab, setActiveTab] = useState("analytics"); // analytics, menu, users, cashier
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cashier State
  const [cashierSearch, setCashierSearch] = useState("");
  const [cashierSelectedCustomerId, setCashierSelectedCustomerId] = useState("");
  const [showPayModal, setShowPayModal] = useState(false);
  const [payCustomer, setPayCustomer] = useState(null);
  const [ignoredItemIds, setIgnoredItemIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ignoredStockItemIds") || "[]");
    } catch (e) {
      return [];
    }
  });

  // New Menu Item State
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Starters");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [availableQuantity, setAvailableQuantity] = useState("");

  // Edit Menu State (Admin Only Details Editing)
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("Starters");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editQuantity, setEditQuantity] = useState("");

  // New User State
  const [userFullName, setUserFullName] = useState("");
  const [userUsername, setUserUsername] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("STAFF");
  const [editingUser, setEditingUser] = useState(null);

  // Load all admin data
  const loadAdminData = async () => {
    try {
      const [menuRes, orderRes, userRes, customerRes] = await Promise.all([
        api.get("/menu"),
        api.get("/orders"),
        api.get("/users"),
        api.get("/customers")
      ]);
      setMenuItems(menuRes.data);
      setOrders(orderRes.data);
      setUsers(userRes.data);
      setCustomers(customerRes.data);
    } catch (e) {
      console.error("Failed to load admin dashboard data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    // Poll admin data every 8 seconds for real-time order/bill updates
    const interval = setInterval(loadAdminData, 8000);
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

  // Menu Handlers
  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    if (!itemName || !price || !availableQuantity) {
      alert("Please fill in required fields.");
      return;
    }

    try {
      await api.post("/menu", {
        itemName,
        category,
        description,
        price: Number(price),
        availableQuantity: Number(availableQuantity),
        availability: "Available"
      });

      // Clear Form
      setItemName("");
      setCategory("Starters");
      setDescription("");
      setPrice("");
      setAvailableQuantity("");

      // Reload
      const res = await api.get("/menu");
      setMenuItems(res.data);
      alert("Menu item added successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to add menu item");
    }
  };

  const handleUpdateStock = async (itemId, newQty) => {
    const qtyInt = parseInt(newQty);
    if (isNaN(qtyInt) || qtyInt < 0) {
      alert("Enter a valid quantity (0 or more)");
      return;
    }

    try {
      await api.put(`/menu/${itemId}/${qtyInt}`);
      const res = await api.get("/menu");
      setMenuItems(res.data);
      alert("Stock updated successfully");
    } catch (e) {
      console.error(e);
      alert("Failed to update stock");
    }
  };

  // Edit Menu Handlers (Admin Only Details Editing)
  const startEditing = (item) => {
    setEditingItem(item);
    setEditName(item.itemName);
    setEditCategory(item.category);
    setEditPrice(item.price);
    setEditDescription(item.description || "");
    setEditQuantity(item.availableQuantity);
  };

  const handleSaveMenuItem = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await api.put(`/menu/${editingItem.itemId}`, {
        itemName: editName,
        category: editCategory,
        price: Number(editPrice),
        description: editDescription,
        availableQuantity: Number(editQuantity)
      });
      alert("Menu item updated successfully!");
      setEditingItem(null);
      
      // Reload menu
      const res = await api.get("/menu");
      setMenuItems(res.data);
    } catch (error) {
      console.error("Failed to update menu item", error);
      alert("Failed to update menu item");
    }
  };

  const handleUpstock = async (item) => {
    const newQty = item.availableQuantity + 1;
    try {
      await api.put(`/menu/${item.itemId}/${newQty}`);
      const res = await api.get("/menu");
      setMenuItems(res.data);
      if (editingItem && editingItem.itemId === item.itemId) {
        setEditQuantity(newQty);
      }
    } catch (e) {
      console.error("Failed to upstock", e);
    }
  };

  const handleDownstock = async (item) => {
    if (item.availableQuantity <= 0) return;
    const newQty = item.availableQuantity - 1;
    try {
      await api.put(`/menu/${item.itemId}/${newQty}`);
      const res = await api.get("/menu");
      setMenuItems(res.data);
      if (editingItem && editingItem.itemId === item.itemId) {
        setEditQuantity(newQty);
      }
    } catch (e) {
      console.error("Failed to downstock", e);
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      try {
        await api.delete(`/menu/${itemId}`);
        const res = await api.get("/menu");
        setMenuItems(res.data);
        alert("Item deleted successfully");
      } catch (e) {
        console.error(e);
        alert("Failed to delete item");
      }
    }
  };

  // User Handlers
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!userFullName || !userUsername || !userPassword) {
      alert("Please fill in all user fields.");
      return;
    }

    try {
      if (editingUser) {
        // Update user
        await api.put(`/users/${editingUser.userId}`, {
          fullName: userFullName,
          username: userUsername,
          password: userPassword,
          role: userRole
        });
        setEditingUser(null);
        alert("User updated successfully!");
      } else {
        // Create user
        await api.post("/users", {
          fullName: userFullName,
          username: userUsername,
          password: userPassword,
          role: userRole
        });
        alert("User account created!");
      }

      // Clear
      setUserFullName("");
      setUserUsername("");
      setUserPassword("");
      setUserRole("STAFF");

      // Reload
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to save user account");
    }
  };

  const handleStartEditUser = (user) => {
    setEditingUser(user);
    setUserFullName(user.fullName);
    setUserUsername(user.username);
    setUserPassword(user.password || "");
    setUserRole(user.role);
    setActiveTab("users"); // Switch tab to show form
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this employee account?")) {
      try {
        await api.delete(`/users/${userId}`);
        const res = await api.get("/users");
        setUsers(res.data);
        alert("User deleted successfully");
      } catch (e) {
        console.error(e);
        alert("Failed to delete user");
      }
    }
  };

  // Cashier Counter Handlers
  const getCustomerName = (customerId) => {
    const c = customers.find(cust => cust.customerId === customerId);
    return c ? c.customerName : customerId;
  };

  const getCustomerPartySize = (customerId) => {
    const c = customers.find(cust => cust.customerId === customerId);
    return c ? c.partySize : "N/A";
  };

  const getUnpaidCustomers = () => {
    // Group orders by customerId
    const customerOrdersMap = {};
    orders.forEach(order => {
      if (order.orderStatus !== "Paid") {
        if (!customerOrdersMap[order.customerId]) {
          customerOrdersMap[order.customerId] = [];
        }
        customerOrdersMap[order.customerId].push(order);
      }
    });

    const list = [];
    Object.entries(customerOrdersMap).forEach(([customerId, custOrders]) => {
      const customer = customers.find(c => c.customerId === customerId);
      const customerName = customer ? customer.customerName : customerId;
      const partySize = customer ? customer.partySize : "N/A";
      
      const subtotal = custOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
      const gst = custOrders.reduce((sum, o) => sum + (o.gst || 0), 0);
      const totalAmount = custOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      // Determine overall status
      let status = "Served";
      if (custOrders.some(o => o.orderStatus === "Pending")) status = "Pending";
      else if (custOrders.some(o => o.orderStatus === "Confirmed" || o.orderStatus === "Preparing" || o.orderStatus === "Ready")) status = "Confirmed";

      list.push({
        customerId,
        customerName,
        partySize,
        orders: custOrders,
        subtotal,
        gst,
        totalAmount,
        status
      });
    });

    return list;
  };

  const handleCashierSettleCustomer = async (cust, newStatus) => {
    try {
      for (const ord of cust.orders) {
        await api.put(`/orders/${ord.orderId}/${newStatus}`);
      }
      loadAdminData();
      alert(`All orders for customer ${cust.customerName} are now marked as ${newStatus}`);
      setCashierSelectedCustomerId("");
    } catch (e) {
      console.error("Failed to update status", e);
      alert("Failed to update order status");
    }
  };

  const handleOpenPayModal = (cust) => {
    setPayCustomer(cust);
    setShowPayModal(true);
  };

  const handleClosePayModal = () => {
    setShowPayModal(false);
    setPayCustomer(null);
  };

  const handleSimulateOnlinePay = async () => {
    if (!payCustomer) return;
    try {
      for (const ord of payCustomer.orders) {
        await api.put(`/orders/${ord.orderId}/Paid`);
      }
      loadAdminData();
      alert("💳 Mock Online Payment Success! Customer's combined bill is marked as Paid.");
      handleClosePayModal();
      setCashierSelectedCustomerId("");
    } catch (e) {
      console.error(e);
      alert("Failed to process payment");
    }
  };

  // Advanced Analytics Calculations
  const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const paidSales = orders.filter(o => o.orderStatus === "Paid").reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrdersCount = orders.length;
  const averageOrderVal = totalOrdersCount > 0 ? totalSales / totalOrdersCount : 0;
  
  // Low Stock Level warning
  const lowStockItems = menuItems.filter(item => item.availableQuantity <= 10 && !ignoredItemIds.includes(item.itemId));
  const lowStockCount = lowStockItems.length;
  const activeStaffCount = users.filter(u => u.status === "Active" && u.role === "STAFF").length;

  // 1. Daily Revenue (today's sales)
  const getDailyRevenue = () => {
    const todayStr = new Date().toDateString();
    return orders
      .filter(o => o.orderTime && new Date(o.orderTime).toDateString() === todayStr)
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  };

  // 2. Most Ordered Dishes
  const getMostOrderedDishes = () => {
    const counts = {};
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const name = item.menuItem?.itemName || `Dish #${item.itemId}`;
          counts[name] = (counts[name] || 0) + item.quantity;
        });
      }
    });
    return Object.entries(counts)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  };

  // 3. Peak Ordering Hours
  const getPeakHourRange = () => {
    const hourBuckets = Array(24).fill(0);
    orders.forEach(order => {
      if (order.orderTime) {
        const hour = new Date(order.orderTime).getHours();
        hourBuckets[hour]++;
      }
    });

    let maxHour = -1;
    let maxCount = 0;
    hourBuckets.forEach((count, hour) => {
      if (count > maxCount) {
        maxCount = count;
        maxHour = hour;
      }
    });

    if (maxHour === -1) return "N/A (No orders yet)";

    const formatHour = (h) => {
      const ampm = h >= 12 ? "PM" : "AM";
      const hour12 = h % 12 || 12;
      return `${hour12}:00 ${ampm}`;
    };

    return `${formatHour(maxHour)} - ${formatHour((maxHour + 1) % 24)}`;
  };

  // Category Counts
  const categoryCounts = menuItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const totalMenuItemsCount = menuItems.length;

  const dailyRevenue = getDailyRevenue();
  const topDishes = getMostOrderedDishes();
  const peakHours = getPeakHourRange();

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: "60vh" }}>
        <div className="spinner"></div>
      </div>
    );
  }

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
              onClick={() => setActiveTab("menu")}
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

      {/* Dashboard Top Header */}
      <div className="glass-panel" style={{ padding: "20px 30px", marginBottom: "30px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontFamily: "var(--display)" }}>Admin Dashboard</h1>
          <p style={{ color: "var(--text-secondary)" }}>Superuser Portal &middot; Manager: <strong style={{ color: "white" }}>{loggedInUser?.fullName}</strong></p>
        </div>
        <div className="tab-headers" style={{ marginBottom: 0 }}>
          <button className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`} onClick={() => setActiveTab("analytics")}>📈 Reports & Analytics</button>
          <button className={`tab-btn ${activeTab === "menu" ? "active" : ""}`} onClick={() => setActiveTab("menu")}>🍔 Menu Management</button>
          <button className={`tab-btn ${activeTab === "cashier" ? "active" : ""}`} onClick={() => setActiveTab("cashier")}>🛎️ Cash Counter</button>
          <button className={`tab-btn ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>👥 Staff Directory</button>
        </div>
      </div>

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="animate-fade">
          {/* Stat metrics cards */}
          <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <div className="glass-panel stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">₹{totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <p style={{ fontSize: "0.85rem", color: "var(--success)" }}>Completed Sales: ₹{paidSales.toFixed(2)}</p>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-label">Daily Revenue</div>
              <div className="stat-value">₹{dailyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Sales placed today</p>
            </div>
            
            <div className="glass-panel stat-card">
              <div className="stat-icon">📥</div>
              <div className="stat-label">Total Orders</div>
              <div className="stat-value">{totalOrdersCount}</div>
              <p style={{ fontSize: "0.85rem" }}>Avg. order size: ₹{averageOrderVal.toFixed(2)}</p>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon">⏰</div>
              <div className="stat-label">Peak Dining Hours</div>
              <div className="stat-value" style={{ fontSize: "1.35rem", padding: "10px 0" }}>{peakHours}</div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Based on order volume</p>
            </div>
          </div>

          {/* Sub layouts: Low stock list and Category graph */}
          <div className="split-layout" style={{ marginTop: "30px" }}>
            {/* Sales/Menu Category Share Progress Bars */}
            <div className="glass-panel" style={{ padding: "30px", textAlign: "left" }}>
              <h3 style={{ marginBottom: "20px", fontFamily: "var(--display)" }}>Menu Distribution by Category</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {Object.entries(categoryCounts).map(([cat, count]) => {
                  const percentage = totalMenuItemsCount > 0 ? (count / totalMenuItemsCount) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="flex-between" style={{ fontSize: "0.9rem", marginBottom: "6px" }}>
                        <strong>{cat}</strong>
                        <span>{count} item(s) ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div style={{ background: "var(--bg-secondary)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ background: "var(--accent)", width: `${percentage}%`, height: "100%", borderRadius: "4px" }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Most Ordered Dishes Panel */}
            <div className="glass-panel" style={{ padding: "30px", textAlign: "left" }}>
              <h3 style={{ marginBottom: "15px", fontFamily: "var(--display)", color: "var(--accent)" }}>🔥 Top 5 Best Selling Dishes</h3>
              {topDishes.length === 0 ? (
                <div style={{ padding: "40px 0", color: "var(--text-muted)", fontSize: "0.95rem", textAlign: "center" }}>
                  📊 No dishes ordered yet. Analytics will populate once customers place table orders.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {topDishes.map((item, idx) => (
                    <div key={idx} className="flex-between" style={{ padding: "10px 14px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-glass)", borderRadius: "8px" }}>
                      <div>
                        <span style={{ fontSize: "1.1rem", marginRight: "8px" }}>{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "✨"}</span>
                        <strong style={{ color: "#ffffff" }}>{item.name}</strong>
                      </div>
                      <span style={{ color: "var(--accent)", fontWeight: "700" }}>{item.qty} units sold</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Menu Management Tab */}
      {activeTab === "menu" && (
        <div className="split-layout animate-fade">
          {/* Left Side: Digital Menu & Inventory listing table */}
          <div className="glass-panel" style={{ padding: "24px", textAlign: "left" }}>
            <h2 style={{ fontFamily: "var(--display)", fontSize: "1.3rem", marginBottom: "16px" }}>Digital Menu & Inventory</h2>
            
            <div style={{ overflowX: "auto", maxHeight: "600px" }}>
              <table style={{ width: "100%", fontSize: "0.9rem", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-glass)" }}>
                    <th style={{ padding: "10px 8px" }}>Dish</th>
                    <th style={{ padding: "10px 8px" }}>Price</th>
                    <th style={{ padding: "10px 8px" }}>Stock Level</th>
                    <th style={{ padding: "10px 8px", textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map(item => (
                    <tr key={item.itemId} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <td style={{ padding: "12px 8px" }}>
                        <strong style={{ color: "white" }}>{item.itemName}</strong>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.category}</div>
                      </td>
                      <td style={{ padding: "12px 8px", color: "var(--accent)" }}>₹{item.price.toFixed(2)}</td>
                      <td style={{ padding: "12px 8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button 
                            type="button"
                            onClick={() => startEditing(item)} 
                            className="btn btn-glass"
                            style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                          >
                            Edit
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDeleteMenuItem(item.itemId)} 
                            className="btn btn-danger" 
                            style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Side: Form (Edit if selected, otherwise Add) */}
          <div className="glass-panel" style={{ padding: "24px", textAlign: "left", height: "fit-content" }}>
            {editingItem ? (
              <div>
                <div className="flex-between" style={{ borderBottom: "1px solid var(--border-glass)", paddingBottom: "14px", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ fontFamily: "var(--display)", fontSize: "1.3rem" }}>Edit Menu Item</h2>
                    <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>ID: <strong style={{ color: "white" }}>{editingItem.itemId}</strong></span>
                  </div>
                  <button type="button" onClick={() => setEditingItem(null)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleSaveMenuItem} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="form-group">
                    <label style={{ color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Dish Name *</label>
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={e => setEditName(e.target.value)} 
                      required 
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div className="grid-2col-responsive" style={{ gap: "16px" }}>
                    <div className="form-group">
                      <label style={{ color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Category *</label>
                      <input 
                        type="text" 
                        value={editCategory} 
                        onChange={e => setEditCategory(e.target.value)} 
                        required 
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Price (₹) *</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={editPrice} 
                        onChange={e => setEditPrice(e.target.value)} 
                        required 
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Available Quantity</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <button 
                        type="button" 
                        onClick={() => setEditQuantity(q => Math.max(0, Number(q) - 1))} 
                        className="btn btn-secondary" 
                        style={{ padding: "8px 16px", fontSize: "1rem" }}
                      >
                        - Downstock
                      </button>
                      <input 
                        type="number" 
                        min="0" 
                        value={editQuantity} 
                        onChange={e => setEditQuantity(e.target.value)} 
                        required 
                        style={{ width: "80px", textAlign: "center", margin: 0 }}
                      />
                      <button 
                        type="button" 
                        onClick={() => setEditQuantity(q => Number(q) + 1)} 
                        className="btn btn-primary" 
                        style={{ padding: "8px 16px", fontSize: "1rem" }}
                      >
                        + Upstock
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Description</label>
                    <textarea 
                      value={editDescription} 
                      onChange={e => setEditDescription(e.target.value)} 
                      rows="3" 
                      style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-glass)", borderRadius: "8px", color: "white", fontFamily: "inherit" }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: "100%", padding: "12px", marginTop: "10px" }}
                  >
                    💾 Save Changes
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <h2 style={{ fontFamily: "var(--display)", fontSize: "1.3rem", marginBottom: "20px" }}>Add New Dish</h2>
                
                <form onSubmit={handleAddMenuItem}>
                  <div className="form-group">
                    <label>Dish Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Garlic Bread"
                      value={itemName} 
                      onChange={e => setItemName(e.target.value)} 
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Category *</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="Starters">Starters</option>
                      <option value="Mains">Mains</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Drinks">Drinks</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea 
                      rows="3" 
                      placeholder="Describe ingredients, allergen warnings..."
                      value={description} 
                      onChange={e => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid-2col-responsive" style={{ gap: "12px" }}>
                    <div className="form-group">
                      <label>Price (₹) *</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        placeholder="199.00"
                        value={price} 
                        onChange={e => setPrice(e.target.value)} 
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Initial Stock *</label>
                      <input 
                        type="number" 
                        placeholder="50"
                        value={availableQuantity} 
                        onChange={e => setAvailableQuantity(e.target.value)} 
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px", marginTop: "10px" }}>
                    ➕ Create Menu Item
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cash Counter Tab */}
      {activeTab === "cashier" && (
        <div className="split-layout animate-fade">
          {/* Left Side: Search & Results */}
          <div className="glass-panel" style={{ padding: "24px", textAlign: "left" }}>
            <h2 style={{ fontFamily: "var(--display)", fontSize: "1.4rem", marginBottom: "16px" }}>🛎️ Cash Counter Queue</h2>
            
            {/* Search Input */}
            <div style={{ marginBottom: "20px" }}>
              <input 
                type="text"
                placeholder="🔎 Search customer name, order ID, or customer ID..."
                value={cashierSearch}
                onChange={e => setCashierSearch(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--border-glass)", background: "rgba(0,0,0,0.2)", color: "white" }}
              />
            </div>

            {/* List of active customers with unpaid orders */}
            {loading ? (
              <div className="flex-center" style={{ padding: "40px 0" }}>
                <div className="spinner"></div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "550px", overflowY: "auto", paddingRight: "4px" }}>
                {getUnpaidCustomers()
                  .filter(c => {
                    const searchVal = cashierSearch.toLowerCase();
                    return c.customerName.toLowerCase().includes(searchVal) || 
                           c.customerId.toLowerCase().includes(searchVal) || 
                           c.orders.some(o => o.orderId.toLowerCase().includes(searchVal));
                  })
                  .map(c => {
                    const isSelected = cashierSelectedCustomerId === c.customerId;
                    return (
                      <div
                        key={c.customerId}
                        className="glass-panel"
                        onClick={() => setCashierSelectedCustomerId(c.customerId)}
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
                            <strong style={{ color: "#ffffff", marginRight: "8px" }}>{c.customerName}</strong>
                            <span className={`status-badge ${c.status.toLowerCase()}`}>
                              {c.status}
                            </span>
                          </div>
                          <span style={{ fontSize: "0.9rem", color: "var(--accent)", fontWeight: "700" }}>
                            ₹{c.totalAmount.toFixed(2)}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                          Cust ID: <span style={{ color: "var(--text-secondary)" }}>{c.customerId}</span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                          Orders Count: {c.orders.length} &middot; Party Size: {c.partySize}
                        </div>
                      </div>
                    );
                  })}
                {getUnpaidCustomers().length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                    📭 No active bills to settle.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side: Order details & settlement options */}
          <div className="glass-panel" style={{ padding: "24px", textAlign: "left" }}>
            {(() => {
              const selectedCustomer = getUnpaidCustomers().find(c => c.customerId === cashierSelectedCustomerId);
              if (!selectedCustomer) {
                return (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "350px", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🛎️</div>
                    <p>Search and select an active customer from the queue to verify details and process payment.</p>
                  </div>
                );
              }

              // Helper to get aggregated items
              const getCombinedItems = (custOrders) => {
                const itemMap = {};
                custOrders.forEach(ord => {
                  if (ord.items) {
                    ord.items.forEach(item => {
                      const itemId = item.itemId;
                      const qty = item.quantity || 0;
                      const name = item.menuItem?.itemName || `Dish #${itemId}`;
                      const price = item.sellingPrice || item.menuItem?.price || 0;
                      const total = item.itemTotal || (price * qty);

                      if (itemMap[itemId]) {
                        itemMap[itemId].quantity += qty;
                        itemMap[itemId].total += total;
                      } else {
                        itemMap[itemId] = {
                          name,
                          price,
                          quantity: qty,
                          total
                        };
                      }
                    });
                  }
                });
                return Object.values(itemMap);
              };

              const combinedItems = getCombinedItems(selectedCustomer.orders);

              return (
                <div>
                  <div style={{ borderBottom: "1px solid var(--border-glass)", paddingBottom: "14px", marginBottom: "20px" }}>
                    <h2 style={{ fontFamily: "var(--display)", fontSize: "1.4rem", margin: 0 }}>Bill Settle & Details</h2>
                    <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Verify Walk-in/Table guest using Customer ID</span>
                  </div>

                  {/* Guest Profile Card */}
                  <div className="grid-2col-responsive" style={{ gap: "16px", marginBottom: "20px" }}>
                    <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Guest Name</span>
                      <div style={{ fontWeight: "600", color: "#ffffff", marginTop: "4px" }}>
                        {selectedCustomer.customerName}
                      </div>
                    </div>
                    <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Customer ID (Cross-check)</span>
                      <div style={{ fontWeight: "500", color: "var(--accent)", fontSize: "0.85rem", marginTop: "4px", overflowWrap: "anywhere" }}>
                        {selectedCustomer.customerId}
                      </div>
                    </div>
                  </div>

                  {/* Itemized Order list */}
                  <h3 style={{ fontSize: "1.1rem", marginBottom: "10px", fontFamily: "var(--display)" }}>Aggregated Ordered Items</h3>
                  <div style={{ background: "rgba(0, 0, 0, 0.2)", borderRadius: "8px", padding: "10px 16px", marginBottom: "24px", maxHeight: "200px", overflowY: "auto" }}>
                    {combinedItems.length > 0 ? (
                      combinedItems.map((item, idx) => (
                        <div key={idx} className="flex-between" style={{ padding: "8px 0", borderBottom: idx < combinedItems.length - 1 ? "1px solid rgba(255, 255, 255, 0.05)" : "none" }}>
                          <div>
                            <span style={{ color: "#ffffff", fontWeight: "500" }}>{item.name}</span>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginLeft: "8px" }}>₹{item.price?.toFixed(2)} each</span>
                          </div>
                          <strong style={{ color: "var(--accent)" }}>x{item.quantity}</strong>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: "10px 0", color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center" }}>
                        No items found for this dining session.
                      </div>
                    )}
                  </div>

                  {/* Financial Summary */}
                  <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "14px", marginBottom: "24px", fontSize: "0.95rem" }}>
                    <div className="flex-between" style={{ marginBottom: "6px" }}>
                      <span>Subtotal:</span>
                      <span>₹{selectedCustomer.subtotal?.toFixed(2)}</span>
                    </div>
                    <div className="flex-between" style={{ marginBottom: "6px" }}>
                      <span>GST (18%):</span>
                      <span>₹{selectedCustomer.gst?.toFixed(2)}</span>
                    </div>
                    <div className="flex-between" style={{ fontSize: "1.2rem", fontWeight: "700", borderTop: "1px dotted var(--border-glass)", paddingTop: "10px", marginTop: "4px" }}>
                      <span style={{ color: "#ffffff" }}>Grand Total:</span>
                      <span style={{ color: "var(--accent)" }}>₹{selectedCustomer.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Settle Action Buttons */}
                  <div style={{ background: "rgba(223, 183, 67, 0.05)", border: "1px solid rgba(223, 183, 67, 0.2)", padding: "20px", borderRadius: "12px" }}>
                    <h4 style={{ color: "white", marginTop: 0, marginBottom: "12px", textAlign: "center", fontSize: "0.95rem" }}>💳 Settle Combined Bill</h4>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button 
                        type="button"
                        onClick={() => handleCashierSettleCustomer(selectedCustomer, "Paid")} 
                        className="btn btn-primary" 
                        style={{ flex: 1, background: "var(--success)", color: "#011220", fontWeight: "700" }}
                      >
                        💵 Cash Paid
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleOpenPayModal(selectedCustomer)} 
                        className="btn btn-primary" 
                        style={{ flex: 1, background: "var(--accent)", color: "#011220", fontWeight: "700" }}
                      >
                        📱 QR Code Settle
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Staff Directory Tab */}
      {activeTab === "users" && (
        <div className="split-layout animate-fade">
          {/* Add User form */}
          <div className="glass-panel" style={{ padding: "24px", textAlign: "left", height: "fit-content" }}>
            <h2 style={{ fontFamily: "var(--display)", fontSize: "1.3rem", marginBottom: "20px" }}>
              {editingUser ? "Edit Account" : "Register Employee"}
            </h2>
            
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Employee Full Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Waiter Jack"
                  value={userFullName} 
                  onChange={e => setUserFullName(e.target.value)} 
                  required
                />
              </div>

              <div className="form-group">
                <label>Username *</label>
                <input 
                  type="text" 
                  placeholder="e.g. jack_waiter"
                  value={userUsername} 
                  onChange={e => setUserUsername(e.target.value)} 
                  required
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={userPassword} 
                  onChange={e => setUserPassword(e.target.value)} 
                  required
                />
              </div>

              <div className="form-group">
                <label>Role Privilege *</label>
                <select value={userRole} onChange={e => setUserRole(e.target.value)}>
                  <option value="STAFF">STAFF (Waiters / Chefs)</option>
                  <option value="ADMIN">ADMIN (Managers)</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1, padding: "12px" }}>
                  {editingUser ? "Save Updates" : "➕ Create Account"}
                </button>
                {editingUser && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingUser(null);
                      setUserFullName("");
                      setUserUsername("");
                      setUserPassword("");
                      setUserRole("STAFF");
                    }}
                    className="btn btn-secondary"
                    style={{ padding: "12px" }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* User Directory listing table */}
          <div className="glass-panel" style={{ padding: "24px", textAlign: "left" }}>
            <h2 style={{ fontFamily: "var(--display)", fontSize: "1.3rem", marginBottom: "16px" }}>Staff List Directory</h2>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", fontSize: "0.9rem" }}>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.userId}>
                      <td>{user.userId}</td>
                      <td><strong style={{ color: "white" }}>{user.fullName}</strong></td>
                      <td>{user.username}</td>
                      <td>
                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button 
                            onClick={() => handleStartEditUser(user)}
                            className="btn btn-glass"
                            style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.userId)}
                            className="btn btn-danger"
                            style={{ padding: "4px 8px", fontSize: "0.75rem", background: "none", border: "1px solid var(--danger-border)", color: "var(--danger)" }}
                            disabled={user.username === loggedInUser?.username} // Cannot delete oneself
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Walk-in Customer Online Payment Modal */}
      {showPayModal && payCustomer && (
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
          zIndex: 2000,
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
              Customer: <strong style={{ color: "white" }}>{payCustomer.customerName}</strong>
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
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=030d17&data=${encodeURIComponent(`upi://pay?pa=dinedesk@upi&pn=Dine%20And%20Desk&am=${payCustomer.totalAmount.toFixed(2)}&cu=INR&tn=Bill%20Session%20${payCustomer.customerId.substring(0, 8)}`)}`} 
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
                <span>₹{payCustomer.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex-between" style={{ color: "var(--text-muted)", marginBottom: "6px" }}>
                <span>GST (18%):</span>
                <span>₹{payCustomer.gst?.toFixed(2)}</span>
              </div>
              <div className="flex-between" style={{ fontSize: "1.1rem", fontWeight: "700", borderTop: "1px dotted var(--border-glass)", paddingTop: "8px", marginTop: "4px" }}>
                <span style={{ color: "white" }}>Total Amount:</span>
                <span style={{ color: "var(--accent)" }}>₹{payCustomer.totalAmount?.toFixed(2)}</span>
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