import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../App.css";

export default function Login({ setLoggedInUser }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [seedStatus, setSeedStatus] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg("Please enter username and password");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await api.post("/users/login", {
        username: username.trim(),
        password: password.trim()
      });

      if (res.data && res.data.userId && res.data.username) {
        localStorage.setItem("loggedInUser", JSON.stringify(res.data));
        setLoggedInUser(res.data);
        
        if (res.data.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/staff");
        }
      } else {
        setErrorMsg("Invalid username or password");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Login failed: Invalid credentials or network error");
    } finally {
      setLoading(false);
    }
  };

  // Seeding helper to create default admin and seed menu if database is fresh
  const handleSeedDatabase = async () => {
    setLoading(true);
    setSeedStatus("Seeding default data...");
    setErrorMsg("");

    try {
      // 1. Check/Create Admin
      let adminCreated = false;
      try {
        await api.post("/users", {
          fullName: "System Admin",
          username: "admin",
          password: "admin123",
          role: "ADMIN"
        });
        adminCreated = true;
      } catch (e) {
        // Admin might already exist, which is fine
        console.log("Admin registration skipped or already exists");
      }

      // Also create a default staff user for testing
      try {
        await api.post("/users", {
          fullName: "Waiter Jack",
          username: "staff",
          password: "staff123",
          role: "STAFF"
        });
      } catch (e) {
        console.log("Staff registration skipped or already exists");
      }

      // 2. Check and Seed Menu
      const menuRes = await api.get("/menu");
      let itemsSeeded = 0;
      
      if (menuRes.data.length === 0) {
        const sampleDishes = [
          { itemName: "Royal Feast Combo", category: "Mains", description: "Premium Butter Chicken served with Garlic Naan, Basmati Rice, and Gulab Jamun.", price: 499.0, availableQuantity: 30, availability: "Available" },
          { itemName: "Veggie Delight Combo", category: "Mains", description: "Paneer Tikka Masala served with Butter Roti, Veg Pulao, and fresh green salad.", price: 420.0, availableQuantity: 35, availability: "Available" },
          { itemName: "Happy Hour Snack Combo", category: "Starters", description: "Crispy Vegetable Spring Rolls, French Fries, and Double Chilli Garlic Dip.", price: 180.0, availableQuantity: 50, availability: "Available" },
          { itemName: "Burger & Fries Combo", category: "Starters", description: "Juicy Veg Burger served with golden crispy fries and a chilled soft beverage.", price: 220.0, availableQuantity: 60, availability: "Available" },
          { itemName: "Grand Dessert Combo", category: "Desserts", description: "A decadent combination of hot Chocolate Brownie, Warm Waffle, and a scoop of Vanilla Ice Cream.", price: 280.0, availableQuantity: 25, availability: "Available" },
          { itemName: "Double Treat Sweet Platter", category: "Desserts", description: "A platter of Premium Mango and Vanilla ice cream scoops topped with mixed fruits.", price: 160.0, availableQuantity: 30, availability: "Available" },
          { itemName: "Tropical Cooler Combo", category: "Drinks", description: "A refreshing duo of Fresh Squeezed Orange Juice and Mint Mojito mocktail.", price: 130.0, availableQuantity: 80, availability: "Available" },
          { itemName: "Table Drink Combo", category: "Drinks", description: "A set of four chilled classic cola soft drinks for the table.", price: 180.0, availableQuantity: 100, availability: "Available" }
        ];

        for (const dish of sampleDishes) {
          await api.post("/menu", dish);
          itemsSeeded++;
        }
      }

      setSeedStatus(`Database Seeded! ${adminCreated ? "Admin created (admin/admin123)." : "Admin already exists."} ${itemsSeeded > 0 ? `${itemsSeeded} menu items seeded.` : "Menu already has items."}`);
      
      // Auto-fill form
      setUsername("admin");
      setPassword("admin123");
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to seed database: " + (error.response?.data?.message || error.message));
      setSeedStatus("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "75vh" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "450px", padding: "40px 30px", textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "15px" }}>🔑</div>
        <h2 style={{ marginBottom: "8px", fontFamily: "var(--display)" }}>Staff Portal</h2>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "30px" }}>
          Log in to manage kitchen orders, tables, and system inventory.
        </p>

        {errorMsg && (
          <div style={{ padding: "10px", background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid var(--danger-border)", borderRadius: "8px", marginBottom: "20px", fontSize: "0.9rem" }}>
            {errorMsg}
          </div>
        )}

        {seedStatus && (
          <div style={{ padding: "10px", background: "var(--success-bg)", color: "var(--success)", border: "1px solid var(--success-border)", borderRadius: "8px", marginBottom: "20px", fontSize: "0.85rem" }}>
            {seedStatus}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px", marginTop: "10px" }} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={{ margin: "24px 0 16px 0", borderTop: "1px solid var(--border-glass)", paddingTop: "20px" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px" }}>
            First time running? Use this quick-seed helper to set up default accounts and menu items.
          </p>
          <button 
            onClick={handleSeedDatabase} 
            className="btn btn-secondary" 
            style={{ width: "100%", padding: "10px", fontSize: "0.85rem", color: "var(--accent)", borderColor: "var(--accent-border)", background: "rgba(245,158,11,0.03)" }}
            disabled={loading}
          >
            🌱 Seed Sample Menu & Users
          </button>
        </div>

        {/* Credentials hints */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", borderRadius: "8px", padding: "12px", fontSize: "0.8rem", textAlign: "left", color: "var(--text-secondary)" }}>
          <strong style={{ color: "#ffffff", display: "block", marginBottom: "4px" }}>🔑 Demo Login Accounts:</strong>
          <div>Admin: <strong style={{ color: "var(--accent)" }}>admin</strong> / <strong style={{ color: "var(--accent)" }}>admin123</strong></div>
          <div>Staff: <strong style={{ color: "var(--info)" }}>staff</strong> / <strong style={{ color: "var(--info)" }}>staff123</strong></div>
        </div>
      </div>
    </div>
  );
}