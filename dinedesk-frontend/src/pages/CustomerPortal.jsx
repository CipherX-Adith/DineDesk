import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../App.css";

export default function CustomerPortal() {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState("");
  const [accompanyingPeople, setAccompanyingPeople] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [registeredCustomer, setRegisteredCustomer] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // If customer is already checked in, redirect to dashboard
    const customerId = localStorage.getItem("customerId");
    if (customerId) {
      navigate("/customer/dashboard");
    }
  }, [navigate]);

  const registerCustomer = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg("Please enter your name");
      return;
    }
    
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await api.post("/customers", {
        customerName: customerName.trim(),
        accompanyingPeople: Number(accompanyingPeople)
      });

      localStorage.setItem("customerId", res.data.customerId);
      localStorage.setItem("customerName", res.data.customerName);
      localStorage.setItem("partySize", res.data.partySize);
      
      setRegisteredCustomer(res.data);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = () => {
    if (registeredCustomer) {
      navigator.clipboard.writeText(registeredCustomer.customerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (registeredCustomer) {
    return (
      <div className="container animate-fade" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
        <div className="glass-panel" style={{ width: "100%", maxWidth: "450px", padding: "40px 30px", textAlign: "center", border: "1px solid var(--success-border)" }}>
          <div style={{ fontSize: "3rem", color: "var(--success)", marginBottom: "15px", animation: "pulseStatus 1.5s infinite" }}>✓</div>
          <h2 style={{ marginBottom: "8px", fontFamily: "var(--display)" }}>Check-in Confirmed</h2>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "24px" }}>
            Welcome! Your dining session has been initialized.
          </p>

          <div style={{ background: "rgba(0, 0, 0, 0.2)", borderRadius: "12px", padding: "20px", marginBottom: "24px", textAlign: "left", border: "1px solid var(--border-glass)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Guest Name:</span>
              <strong style={{ color: "#ffffff", fontSize: "0.95rem" }}>{registeredCustomer.customerName}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Party Size:</span>
              <strong style={{ color: "#ffffff", fontSize: "0.95rem" }}>{registeredCustomer.partySize} {registeredCustomer.partySize === 1 ? "person" : "people"}</strong>
            </div>

            <div style={{ borderTop: "1px dashed var(--border-glass)", paddingTop: "14px" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", display: "block", marginBottom: "8px" }}>Your Unique Customer ID:</span>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <div style={{ 
                  flexGrow: 1, 
                  background: "rgba(245, 158, 11, 0.05)", 
                  border: "1px solid var(--accent-border)", 
                  padding: "10px 14px", 
                  borderRadius: "8px", 
                  fontFamily: "var(--mono)", 
                  fontSize: "0.9rem", 
                  color: "var(--accent)", 
                  wordBreak: "break-all" 
                }}>
                  {registeredCustomer.customerId}
                </div>
                <button 
                  onClick={handleCopyId} 
                  className="btn btn-secondary" 
                  style={{ padding: "10px 14px", whiteSpace: "nowrap" }}
                  title="Copy ID to Clipboard"
                >
                  {copied ? "✓ Copied" : "📋 Copy"}
                </button>
              </div>
            </div>
          </div>

          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "20px" }}>
            💡 Save this ID if you want to access your orders from another device.
          </p>

          <button 
            onClick={() => navigate("/customer/dashboard")} 
            className="btn btn-primary" 
            style={{ width: "100%", padding: "14px", fontWeight: "700" }}
          >
            Proceed to Dashboard 🍽️
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "450px", padding: "40px 30px", textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "15px" }}>🍽️</div>
        <h2 style={{ marginBottom: "8px", fontFamily: "var(--display)" }}>Customer Check-in</h2>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "30px" }}>
          Welcome! Please check in to start browsing and ordering.
        </p>

        {errorMsg && (
          <div style={{ padding: "10px", background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid var(--danger-border)", borderRadius: "8px", marginBottom: "20px", fontSize: "0.9rem" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={registerCustomer}>
          <div className="form-group">
            <label htmlFor="customerName">Your Name</label>
            <input
              id="customerName"
              type="text"
              placeholder="e.g. Adith"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="accompanying">Accompanying Guests</label>
            <input
              id="accompanying"
              type="number"
              min="0"
              max="20"
              placeholder="0"
              value={accompanyingPeople}
              onChange={(e) => setAccompanyingPeople(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px", marginTop: "10px" }} disabled={loading}>
            {loading ? "Registering..." : "Start Dining"}
          </button>
        </form>

        <button 
          onClick={() => navigate("/")} 
          className="btn btn-glass" 
          style={{ width: "100%", padding: "12px", marginTop: "12px" }}
          disabled={loading}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}