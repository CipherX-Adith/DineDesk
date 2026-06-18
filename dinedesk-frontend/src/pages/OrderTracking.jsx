import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import "../App.css";

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [sessionOrders, setSessionOrders] = useState([]);
  const [customerName, setCustomerName] = useState("Table Guest");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const loadOrder = async () => {
    try {
      const [ordersRes, customersRes] = await Promise.all([
        api.get("/orders"),
        api.get("/customers")
      ]);
      const matchedOrder = ordersRes.data.find(o => o.orderId === orderId);
      
      if (matchedOrder) {
        setOrder(matchedOrder);
        // Find all orders in this session
        const filtered = ordersRes.data.filter(o => o.customerId === matchedOrder.customerId);
        setSessionOrders(filtered);

        // Find customer name
        const cust = customersRes.data.find(c => c.customerId === matchedOrder.customerId);
        if (cust) {
          setCustomerName(cust.customerName);
        }
      } else {
        setErrorMsg("Order not found on server.");
      }
    } catch (error) {
      console.error("Failed to load order status", error);
      setErrorMsg("Unable to retrieve order status from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Load order status immediately
    loadOrder();

    // 2. Poll order status every 5 seconds
    const interval = setInterval(loadOrder, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  const [paying, setPaying] = useState(false);

  const handlePayBill = async () => {
    const unpaidOrders = sessionOrders.filter(o => o.orderStatus !== "Paid");
    if (unpaidOrders.length === 0) return;
    setPaying(true);
    try {
      for (const ord of unpaidOrders) {
        await api.put(`/orders/${ord.orderId}/Paid`);
      }
      alert("💳 Combined bill paid successfully! Thank you for dining with us.");
      await loadOrder();
    } catch (e) {
      console.error("Failed to process payment", e);
      alert("Payment failed. Please try again or ask cashier/staff for assistance.");
    } finally {
      setPaying(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: "60vh" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="container" style={{ padding: "60px 20px" }}>
        <div className="glass-panel" style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ fontSize: "3rem", marginBottom: "15px" }}>⚠️</div>
          <h2>Oops! Something went wrong</h2>
          <p style={{ margin: "10px 0 24px 0", color: "var(--text-secondary)" }}>{errorMsg || "Order details could not be found."}</p>
          <Link to="/customer/dashboard" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Aggregate items across all session orders
  const getCombinedItems = () => {
    const itemMap = {};
    sessionOrders.forEach(ord => {
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

  const combinedSubtotal = sessionOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const combinedGst = sessionOrders.reduce((sum, o) => sum + (o.gst || 0), 0);
  const combinedTotal = sessionOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const hasUnpaidOrders = sessionOrders.some(o => o.orderStatus !== "Paid");
  const isPaid = !hasUnpaidOrders;
  const allUnpaidServed = sessionOrders.filter(o => o.orderStatus !== "Paid").every(o => o.orderStatus === "Served");
  const isServed = allUnpaidServed || isPaid;
  const combinedItems = getCombinedItems();

  return (
    <div className="container animate-fade">
      {/* Back navigation - Hidden during printing */}
      <div className="no-print" style={{ textAlign: "left", marginBottom: "24px" }}>
        <Link to="/customer/dashboard" className="btn btn-secondary" style={{ padding: "8px 16px" }}>
          ⬅️ Back to Table Dashboard
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "40px", flexWrap: "wrap" }}>
        
        {/* Left Card: Bill Receipt */}
        <div style={{ flex: "1 1 290px", maxWidth: "480px" }}>
          <div className="receipt animate-slide" id="receipt-print-area" style={{ 
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.05)"
          }}>
            <div className="receipt-header">
              <span style={{ fontSize: "1.8rem", color: "#1e293b", display: "block", marginBottom: "4px" }}>⚜️</span>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", fontWeight: "700", letterSpacing: "0.04em", color: "#000000" }}>DINE & DESK</h2>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "4px 0" }}>123 Culinary Boulevard, Food City</p>
              <p style={{ fontSize: "0.85rem", color: "#64748b" }}>Kochi, Kerala &middot; Tel: +91 484 234 5678</p>
            </div>

            <div className="receipt-row">
              <strong>Session ID:</strong>
              <span>{order.customerId.substring(0, 8)}... (Combined Bill)</span>
            </div>
            <div className="receipt-row">
              <strong>Date/Time:</strong>
              <span>{order.orderTime ? new Date(order.orderTime).toLocaleString() : new Date().toLocaleString()}</span>
            </div>
            <div className="receipt-row">
              <strong>Table Guest:</strong>
              <span>{customerName}</span>
            </div>
            <div className="receipt-row">
              <strong>Orders Placed:</strong>
              <span>{sessionOrders.length} order(s)</span>
            </div>
            <div className="receipt-row">
              <strong>Bill Settlement:</strong>
              <span style={{ fontWeight: "700", color: isPaid ? "#10b981" : "var(--warning)" }}>
                {isPaid ? "Paid & Settled" : "Pending Payment"}
              </span>
            </div>

            <div className="receipt-divider"></div>

            {/* Itemized List */}
            {combinedItems && combinedItems.length > 0 ? (
              <div style={{ margin: "10px 0" }}>
                <div className="receipt-row" style={{ fontWeight: "700", fontSize: "0.85rem", color: "#64748b", marginBottom: "8px" }}>
                  <span style={{ flexGrow: 1, textAlign: "left" }}>Item</span>
                  <span style={{ width: "60px", textAlign: "center" }}>Qty</span>
                  <span style={{ width: "80px", textAlign: "right" }}>Amount</span>
                </div>
                {combinedItems.map((item, idx) => (
                  <div key={idx} className="receipt-row" style={{ margin: "8px 0" }}>
                    <span style={{ flexGrow: 1, textAlign: "left" }}>{item.name}</span>
                    <span style={{ width: "60px", textAlign: "center" }}>x{item.quantity}</span>
                    <span style={{ width: "80px", textAlign: "right" }}>₹{item.total?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "16px 0", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
                No itemized details found in this dining session.
              </div>
            )}

            <div className="receipt-divider"></div>

            <div className="receipt-row">
              <span>Subtotal:</span>
              <span>₹{combinedSubtotal.toFixed(2)}</span>
            </div>
            <div className="receipt-row">
              <span>GST (18%):</span>
              <span>₹{combinedGst.toFixed(2)}</span>
            </div>
            <div className="receipt-divider"></div>
            <div className="receipt-row receipt-total">
              <span>Grand Total:</span>
              <span>₹{combinedTotal.toFixed(2)}</span>
            </div>

            <div className="receipt-divider" style={{ borderStyle: "solid", borderColor: "#e2e8f0", margin: "20px 0 10px 0" }}></div>
            <div style={{ textAlign: "center", fontSize: "0.8rem", color: "#64748b", marginTop: "10px" }}>
              <p>Thank you for dining with us!</p>
              <p>Please visit again.</p>
            </div>
          </div>

          {/* Action buttons - Hidden during printing */}
          <div className="no-print" style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
            <button onClick={handlePrint} className="btn btn-primary" style={{ flexGrow: 1 }}>
              🖨️ Print Bill / Receipt
            </button>
            <button onClick={loadOrder} className="btn btn-secondary">
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Right Card: Payment Options - Hidden during printing */}
        <div className="glass-panel no-print" style={{ flex: "1 1 290px", maxWidth: "450px", padding: "30px", textAlign: "left", alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span className="role-badge customer" style={{ marginBottom: "10px", display: "inline-block" }}>Settlement counter</span>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "15px", fontFamily: "var(--display)" }}>Payment & Settlement</h2>
          
          {isPaid ? (
            <div style={{ textAlign: "center", padding: "30px 10px" }}>
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>✅</div>
              <h3 style={{ color: "var(--success)", marginBottom: "8px" }}>Visit Settled</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.5" }}>
                Your payment was received successfully. You may print the receipt on the left for your records and checkout to end your dining session.
              </p>
              <Link to="/customer/dashboard" className="btn btn-primary" style={{ marginTop: "20px", display: "block" }}>
                🚪 Back to Table Dashboard
              </Link>
            </div>
          ) : (
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "20px", lineHeight: "1.5" }}>
                Please review your combined bill on the left. Once all items are served, you can settle the bill online.
              </p>

              {isServed ? (
                <div>
                  {/* Real UPI QR Code Panel */}
                  <div style={{ textAlign: "center", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
                    <div style={{ background: "white", padding: "12px", borderRadius: "8px", display: "inline-block", marginBottom: "12px" }}>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&color=030d17&data=${encodeURIComponent(`upi://pay?pa=dinedesk@upi&pn=Dine%20And%20Desk&am=${combinedTotal.toFixed(2)}&cu=INR&tn=Bill%20Session%20${order.customerId.substring(0, 8)}`)}`} 
                        alt="UPI Payment QR Code" 
                        style={{ width: "140px", height: "140px", display: "block" }}
                      />
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" }}>Scan QR to Pay ₹{combinedTotal.toFixed(2)} with UPI / GPay</p>
                  </div>

                  <button 
                    onClick={handlePayBill} 
                    className="btn btn-primary" 
                    style={{ width: "100%", padding: "14px", fontWeight: "700", fontSize: "1rem" }}
                    disabled={paying}
                  >
                    {paying ? "Processing Payment..." : "💳 Pay Combined Bill Online"}
                  </button>
                </div>
              ) : (
                <div style={{ background: "rgba(223, 183, 67, 0.1)", border: "1px solid var(--accent)", color: "var(--accent)", padding: "16px", borderRadius: "8px", textAlign: "center", fontWeight: "600", fontSize: "0.9rem", lineHeight: "1.4" }}>
                  ⏳ Payment will be enabled once your order is fully served by the staff.
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Add print styles specifically for receipt area */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print, header.navbar, footer {
            display: none !important;
          }
          .container {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          .receipt {
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
            padding: 0 !important;
            background: transparent !important;
            color: #000000 !important;
          }
        }
      `}</style>
    </div>
  );
}
