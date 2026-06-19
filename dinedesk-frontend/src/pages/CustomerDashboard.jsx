import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "../App.css";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const customerId = localStorage.getItem("customerId");
  const customerName = localStorage.getItem("customerName");
  const partySize = localStorage.getItem("partySize");

  const loadCustomerOrders = async () => {
    if (!customerId) return;
    try {
      const res = await api.get(`/orders/customer/${customerId}`);
      // Sort orders: newest first
      const sortedOrders = res.data.sort((a, b) => {
        return new Date(b.orderTime || 0) - new Date(a.orderTime || 0);
      });
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Failed to load customer orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!customerId) {
      navigate("/customer");
      return;
    }

    loadCustomerOrders();
    // Poll orders every 8 seconds to track real-time status updates
    const interval = setInterval(loadCustomerOrders, 8000);
    return () => clearInterval(interval);
  }, [customerId, navigate]);

  // Enforce paying bill before checking out
  const handleCheckout = () => {
    if (orders.length === 0) {
      if (window.confirm("Would you like to cancel your visit, release this table, and exit to the home page?")) {
        localStorage.removeItem("customerId");
        localStorage.removeItem("customerName");
        localStorage.removeItem("partySize");
        navigate("/");
      }
      return;
    }

    const hasUnpaid = orders.some(order => order.orderStatus !== "Paid");
    
    if (hasUnpaid) {
      alert("❌ Checkout Blocked: Please pay your combined table bill before checking out and ending your dining session.");
      return;
    }

    if (window.confirm("Are you sure you want to end your dining session? This will clear your table data.")) {
      localStorage.removeItem("customerId");
      localStorage.removeItem("customerName");
      localStorage.removeItem("partySize");
      navigate("/");
    }
  };

  // Pay all active orders in this session
  const handlePayCombinedBill = async () => {
    const unpaidOrders = orders.filter(order => order.orderStatus !== "Paid");
    if (unpaidOrders.length === 0) return;

    setPaying(true);
    try {
      for (const order of unpaidOrders) {
        await api.put(`/orders/${order.orderId}/Paid`);
      }
      alert("💳 Combined bill paid successfully! Thank you for dining with us.");
      await loadCustomerOrders();
    } catch (e) {
      console.error("Failed to complete payment", e);
      alert("Payment failed. Please try again or ask staff for assistance.");
    } finally {
      setPaying(false);
    }
  };

  if (!customerId) return null;

  // Aggregate items across all orders for session receipt
  const getCombinedItems = () => {
    const itemMap = {};
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
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

  // Aggregated financials
  const combinedSubtotal = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const combinedGst = orders.reduce((sum, o) => sum + (o.gst || 0), 0);
  const combinedTotal = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  
  const hasUnpaidOrders = orders.some(o => o.orderStatus !== "Paid");
  const allUnpaidServed = orders.filter(o => o.orderStatus !== "Paid").every(o => o.orderStatus === "Served");
  const combinedItems = getCombinedItems();

  return (
    <div className="container animate-fade">
      {/* Welcome & Session Card */}
      <div className="royal-panel no-print" style={{ padding: "30px", marginBottom: "30px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <span className="role-badge customer" style={{ marginBottom: "10px", display: "inline-block", borderColor: "var(--accent)" }}>Taste Royale Guest</span>
          <h1 className="royal-title" style={{ fontSize: "2rem", marginBottom: "6px" }}>Welcome, {customerName}!</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Session ID: <strong style={{ color: "var(--accent)" }}>{customerId.substring(0, 8)}...</strong> &middot; Guests: <strong style={{ color: "#ffffff" }}>{partySize}</strong>
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link to="/menu" className="royal-btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            🍽️ Order Food
          </Link>
          <button onClick={handleCheckout} className="royal-btn-outline" style={{ borderColor: "rgba(239, 68, 68, 0.4)", color: "#f87171" }}>
            {orders.length === 0 ? "🚪 Cancel Visit & Exit" : "🚪 Checkout / End"}
          </button>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="no-print" style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <Link to="/menu" className="royal-btn" style={{ textDecoration: "none" }}>
          🍽️ Order More Food
        </Link>
        <button onClick={loadCustomerOrders} className="royal-btn-outline">
          🔄 Refresh List
        </button>
      </div>

      <div className="split-layout">
        {/* Left Panel: Active / Past Orders */}
        <div className="royal-panel no-print" style={{ padding: "30px", textAlign: "left" }}>
          <h2 className="royal-title" style={{ marginBottom: "20px", fontSize: "1.4rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Your Visit Orders</span>
            {orders.length > 0 && (
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "normal", letterSpacing: "normal", textTransform: "none" }}>
                Total Placed: {orders.length}
              </span>
            )}
          </h2>
          
          {loading ? (
            <div className="flex-center" style={{ padding: "40px 0" }}>
              <div className="spinner"></div>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🛒</div>
              <p style={{ fontSize: "1.1rem", marginBottom: "20px" }}>You haven't placed any orders yet.</p>
              <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                <Link to="/menu" className="royal-btn" style={{ textDecoration: "none" }}>
                  🍽️ Open Menu
                </Link>
                <button 
                  onClick={handleCheckout} 
                  className="royal-btn-outline" 
                  style={{ borderColor: "rgba(239, 68, 68, 0.4)", color: "#f87171" }}
                >
                  🚪 Cancel Visit / Exit
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {orders.map((order) => (
                <div 
                  key={order.orderId} 
                  className="royal-panel" 
                  style={{ 
                    padding: "20px", 
                    background: "rgba(205, 162, 80, 0.03)", 
                    borderColor: order.orderStatus === "Pending" ? "rgba(245, 158, 11, 0.4)" : "rgba(205, 162, 80, 0.18)",
                    position: "relative"
                  }}
                >
                  <div style={{ width: "100%" }}>
                    <div className="flex-center" style={{ justifyContent: "flex-start", gap: "10px", marginBottom: "8px" }}>
                      <strong className="royal-subtitle" style={{ color: "#ffffff", fontStyle: "normal" }}>Order: {order.orderId}</strong>
                      <span className={`status-badge ${order.orderStatus.toLowerCase()}`} style={{ border: "1px solid rgba(205, 162, 80, 0.2)" }}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                      Time: {order.orderTime ? new Date(order.orderTime).toLocaleTimeString() : "N/A"}
                    </p>
                    <p style={{ fontSize: "0.95rem", marginBottom: "12px" }}>
                      Order Total: <strong style={{ color: "var(--accent)" }}>₹{order.totalAmount?.toFixed(2)}</strong>
                    </p>

                    {/* Friendly conversational order tracking block */}
                    <div style={{ 
                      padding: "10px 14px", 
                      borderRadius: "0px", 
                      background: "rgba(0,0,0,0.2)", 
                      border: "1px solid rgba(205, 162, 80, 0.12)",
                      display: "flex", 
                      alignItems: "center", 
                      gap: "10px" 
                    }}>
                      <span className="status-dot" style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: 
                          order.orderStatus === "Pending" ? "var(--warning)" :
                          order.orderStatus === "Confirmed" ? "#06b6d4" :
                          order.orderStatus === "Preparing" ? "#a855f7" :
                          order.orderStatus === "Ready" ? "#10b981" :
                          order.orderStatus === "Served" ? "var(--accent)" : "#64748b",
                        animation: order.orderStatus === "Confirmed" || order.orderStatus === "Preparing" || order.orderStatus === "Pending" ? "pulseStatus 1.5s infinite" : "none"
                      }} />
                      <span style={{ fontSize: "0.88rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                        {order.orderStatus === "Pending" && "⏳ Awaiting chef confirmation. Any new items you just added will be approved shortly."}
                        {(order.orderStatus === "Confirmed" || order.orderStatus === "Preparing" || order.orderStatus === "Ready") && "✅ Order confirmed! Your food is being prepared and will be served shortly."}
                        {order.orderStatus === "Served" && "🍽️ All items served. Bon appétit!"}
                        {order.orderStatus === "Paid" && "💳 Bill settled. Thank you for dining with us!"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel: Combined Billing Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          {orders.length > 0 && (
            <div className="royal-panel" style={{ padding: "30px", textAlign: "left", border: "1px solid var(--accent-border)" }}>
              <div className="flex-between" style={{ marginBottom: "16px", borderBottom: "1px solid rgba(205, 162, 80, 0.2)", paddingBottom: "12px" }}>
                <h3 className="royal-title" style={{ fontSize: "1.1rem" }}>⚜️ Combined Bill</h3>
                <span className={`status-badge ${hasUnpaidOrders ? "unpaid" : "paid"}`} style={{ border: "1px solid rgba(205, 162, 80, 0.2)" }}>
                  {hasUnpaidOrders ? "Pending Payment" : "Visit Settled"}
                </span>
              </div>

              {/* Totals */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.9rem", marginBottom: "24px" }}>
                <div className="flex-between">
                  <span>Subtotal:</span>
                  <span style={{ color: "#ffffff" }}>₹{combinedSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex-between" style={{ color: "var(--text-muted)" }}>
                  <span>GST (18%):</span>
                  <span>₹{combinedGst.toFixed(2)}</span>
                </div>
                
                <div className="royal-divider-gold"><span>♦</span></div>
                
                <div className="flex-between" style={{ fontSize: "1.25rem", fontWeight: "700", paddingTop: "4px", marginTop: "4px" }}>
                  <span style={{ color: "#ffffff" }}>Grand Total:</span>
                  <span style={{ color: "var(--accent)" }}>₹{combinedTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Link to view bill and pay */}
              <Link 
                to={`/track/${orders[0].orderId}`} 
                className="royal-btn" 
                style={{ 
                  width: "100%", 
                  display: "block", 
                  textAlign: "center",
                  textDecoration: "none",
                  boxSizing: "border-box"
                }}
              >
                📄 View Combined Bill
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
