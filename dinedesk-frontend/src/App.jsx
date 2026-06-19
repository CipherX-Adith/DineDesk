import { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import CustomerPortal from "./pages/CustomerPortal";
import CustomerDashboard from "./pages/CustomerDashboard";
import MenuPage from "./pages/MenuPage";
import OrderTracking from "./pages/OrderTracking";
import Login from "./pages/Login";
import StaffDashboard from "./pages/StaffDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

// Dynamic Navbar component that adapts to routes
function Navbar({ loggedInUser, handleLogout }) {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith("/staff") || location.pathname.startsWith("/admin");

  if (isDashboardRoute) {
    return (
      <header className="navbar glass-panel" style={{ padding: "16px 24px", marginBottom: "30px" }}>
        <div className="brand">
          <Link to="/" style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--serif)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "1.6rem" }}>Dine<span className="brand-accent"> & Desk</span></span>
          </Link>
        </div>
        <nav className="nav-links">
          <Link to="/" className="btn btn-glass">Home</Link>
          {loggedInUser && (
            <div className="nav-user">
              <span className="role-badge staff">{loggedInUser.fullName}</span>
              <span className={`role-badge ${loggedInUser.role.toLowerCase()}`}>{loggedInUser.role}</span>
              <button 
                onClick={handleLogout} 
                className="btn btn-danger"
                style={{ padding: "6px 12px", fontSize: "0.85rem" }}
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </header>
    );
  }

  const isHome = location.pathname === "/";

  const navItemStyle = {
    fontFamily: "var(--serif)",
    textTransform: "uppercase",
    fontSize: "0.88rem",
    letterSpacing: "0.1em",
    color: "#ffffff",
    fontWeight: "600",
    textDecoration: "none",
    padding: "8px 12px",
    transition: "color 0.2s ease"
  };

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleHomeClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const hasCustomerSession = !!localStorage.getItem("customerId");

  return (
    <header 
      className={isHome ? "navbar navbar-home" : "navbar glass-panel"}
      style={isHome ? {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 100,
        backgroundColor: "transparent",
        border: "none",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        boxShadow: "none",
        padding: "30px 60px"
      } : {
        padding: "16px 24px",
        marginBottom: "30px",
        backgroundColor: "var(--bg-glass)"
      }}
    >
      <div className="brand">
        <Link to="/" onClick={handleHomeClick} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--serif)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "700", fontSize: "1.7rem" }}>
            Dine<span style={{ color: "var(--accent)" }}>&</span>Desk
          </span>
        </Link>
      </div>

      <nav className="nav-links" style={{ gap: "20px" }}>
        <Link to="/" style={navItemStyle} onClick={handleHomeClick} onMouseOver={e => e.target.style.color = "var(--accent)"} onMouseOut={e => e.target.style.color = "#ffffff"}>Home</Link>
        
        <Link to="/menu" style={navItemStyle} onMouseOver={e => e.target.style.color = "var(--accent)"} onMouseOut={e => e.target.style.color = "#ffffff"}>Menu</Link>
        
        {!hasCustomerSession && (
          isHome ? (
            <button 
              onClick={() => handleScroll("legacy")} 
              style={{ ...navItemStyle, background: "transparent", border: "none", cursor: "pointer" }}
              onMouseOver={e => e.target.style.color = "var(--accent)"}
              onMouseOut={e => e.target.style.color = "#ffffff"}
            >
              Our Story
            </button>
          ) : (
            <Link to="/?scroll=legacy" style={navItemStyle} onMouseOver={e => e.target.style.color = "var(--accent)"} onMouseOut={e => e.target.style.color = "#ffffff"}>Our Story</Link>
          )
        )}

        {!hasCustomerSession && (
          isHome ? (
            <button 
              onClick={() => handleScroll("contact")} 
              style={{ ...navItemStyle, background: "transparent", border: "none", cursor: "pointer" }}
              onMouseOver={e => e.target.style.color = "var(--accent)"}
              onMouseOut={e => e.target.style.color = "#ffffff"}
            >
              Contact
            </button>
          ) : (
            <Link to="/?scroll=contact" style={navItemStyle} onMouseOver={e => e.target.style.color = "var(--accent)"} onMouseOut={e => e.target.style.color = "#ffffff"}>Contact</Link>
          )
        )}

        {hasCustomerSession && (
          <Link 
            to="/customer/dashboard" 
            style={{
              ...navItemStyle,
              border: "1px solid var(--accent)",
              borderRadius: "4px",
              padding: "6px 14px",
              color: "var(--accent)"
            }}
            onMouseOver={e => {
              e.target.style.backgroundColor = "var(--accent)";
              e.target.style.color = "#011220";
            }}
            onMouseOut={e => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "var(--accent)";
            }}
          >
            My Table
          </Link>
        )}
      </nav>

      <div className="nav-contact" style={{ color: "#ffffff", fontFamily: "var(--serif)", fontSize: "0.95rem", letterSpacing: "0.05em", fontWeight: "600" }}>
        <a href="tel:+914842345678" style={{ color: "#ffffff", textDecoration: "none", transition: "color 0.2s ease" }} onMouseOver={e => e.target.style.color = "var(--accent)"} onMouseOut={e => e.target.style.color = "#ffffff"}>
          📞 +91 484 234 5678
        </a>
      </div>
    </header>
  );
}

// Global footer that hides itself on the landing page (which has its own luxury footer)
function AppFooter() {
  const location = useLocation();
  if (location.pathname === "/") {
    return null;
  }
  return (
    <footer style={{ 
      padding: "30px 20px", 
      color: "var(--text-muted)", 
      fontSize: "0.85rem", 
      borderTop: "1px solid var(--border-glass)",
      textAlign: "center",
      backgroundColor: "#020a12"
    }}>
      &copy; {new Date().getFullYear()} Dine & Desk. All rights reserved. &middot; Premium Restaurant Management
    </footer>
  );
}


function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    // Restore user from local storage
    const cachedUser = localStorage.getItem("loggedInUser");
    if (cachedUser) {
      try {
        setLoggedInUser(JSON.parse(cachedUser));
      } catch (e) {
        localStorage.removeItem("loggedInUser");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setLoggedInUser(null);
  };

  // Protected Route for Admin/Staff
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!loggedInUser) {
      return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(loggedInUser.role)) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <Router>
      <ScrollToTop />
      <Navbar loggedInUser={loggedInUser} handleLogout={handleLogout} />

      <main style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/customer" element={<CustomerPortal />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/track/:orderId" element={<OrderTracking />} />
          <Route path="/login" element={<Login setLoggedInUser={setLoggedInUser} />} />
          
          <Route 
            path="/staff" 
            element={
              <ProtectedRoute allowedRoles={["STAFF", "ADMIN"]}>
                <StaffDashboard loggedInUser={loggedInUser} />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard loggedInUser={loggedInUser} />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <AppFooter />
    </Router>
  );
}

export default App;