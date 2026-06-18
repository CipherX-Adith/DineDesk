import { useState } from "react";
import api from "../services/api";

export default function RegistrationModal({ isOpen, onClose, onSuccess }) {
  const [customerName, setCustomerName] = useState("");
  const [accompanyingPeople, setAccompanyingPeople] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
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

      setCustomerName("");
      setAccompanyingPeople(0);
      
      if (onSuccess) {
        onSuccess(res.data);
      }
      onClose();
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to check in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(1, 18, 32, 0.8)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      zIndex: 2000,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px"
    }}>
      <div className="glass-panel animate-slide registration-modal-inner" style={{
        width: "100%",
        maxWidth: "450px",
        padding: "40px 30px",
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--accent-border)",
        borderRadius: "8px",
        textAlign: "center",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)"
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "15px" }}>🍽️</div>
        <h2 style={{ marginBottom: "8px", fontFamily: "var(--serif)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)" }}>Table Check-in</h2>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "24px" }}>
          Welcome! Please check in to start ordering directly from your table.
        </p>

        {errorMsg && (
          <div style={{ padding: "10px", background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid var(--danger-border)", borderRadius: "4px", marginBottom: "20px", fontSize: "0.9rem" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: "left", marginBottom: "20px" }}>
            <label htmlFor="modalCustomerName" style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.05em" }}>Your Name</label>
            <input
              id="modalCustomerName"
              type="text"
              placeholder="e.g. Adith"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "0",
                border: "1px solid var(--border-glass)",
                backgroundColor: "rgba(0,0,0,0.3)",
                color: "white",
                fontSize: "0.95rem"
              }}
              required
            />
          </div>

          <div className="form-group" style={{ textAlign: "left", marginBottom: "30px" }}>
            <label htmlFor="modalAccompanying" style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.05em" }}>Accompanying Guests</label>
            <input
              id="modalAccompanying"
              type="number"
              min="0"
              max="20"
              placeholder="0"
              value={accompanyingPeople}
              onChange={(e) => setAccompanyingPeople(e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "0",
                border: "1px solid var(--border-glass)",
                backgroundColor: "rgba(0,0,0,0.3)",
                color: "white",
                fontSize: "0.95rem"
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "0",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "transparent",
                color: "#ffffff",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = "#ffffff"}
              onMouseOut={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
                padding: "12px",
                borderRadius: "0",
                border: "1px solid var(--accent)",
                backgroundColor: "var(--accent)",
                color: "#011220",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = "var(--accent-hover)"}
              onMouseOut={e => e.currentTarget.style.backgroundColor = "var(--accent)"}
            >
              {loading ? "Checking in..." : "Start Dining"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
