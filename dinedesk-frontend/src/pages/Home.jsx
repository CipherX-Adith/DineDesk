import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import RegistrationModal from "../components/RegistrationModal";
import "../App.css";

export default function Home() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleRegisterSuccess = () => {
    // Once registered successfully, go directly to menu
    navigate("/menu");
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const scrollTarget = searchParams.get("scroll");
    if (scrollTarget) {
      setTimeout(() => {
        const element = document.getElementById(scrollTarget);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    }
  }, [location]);

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "var(--bg-primary)", 
      color: "#ffffff", 
      display: "flex", 
      flexDirection: "column", 
      fontFamily: "var(--sans)" 
    }}>
      
      {/* 1. Hero Section */}
      <div style={{
        position: "relative",
        height: "100vh",
        width: "100%",
        backgroundImage: "linear-gradient(rgba(1, 18, 32, 0.55), rgba(1, 18, 32, 0.92)), url('https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=1600')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 20px"
      }}>
        <div className="animate-fade" style={{ maxWidth: "850px", marginTop: "80px" }}>
          <p style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            color: "var(--accent)",
            fontSize: "1.45rem",
            marginBottom: "16px",
            letterSpacing: "0.08em"
          }}>
            Welcome to Our Restaurant
          </p>
          <h1 className="hero-title" style={{
            fontFamily: "var(--serif)",
            fontSize: "5.8rem",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            lineHeight: "1.1",
            color: "#ffffff",
            marginBottom: "24px"
          }}>
            Dine&Desk
          </h1>
          <p className="hero-subtitle" style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            color: "rgba(255,255,255,0.9)",
            fontSize: "1.6rem",
            marginBottom: "30px",
            fontWeight: "300"
          }}>
            "Where Every Meal Becomes a Memory"
          </p>
          <p className="hero-text" style={{
            fontSize: "1.05rem",
            color: "#9ab0c5",
            maxWidth: "680px",
            margin: "0 auto 40px auto",
            lineHeight: "1.8",
            fontWeight: "300"
          }}>
            Welcome to Dine&Desk, where exceptional flavors meet elegant dining. We bring together traditional recipes, premium ingredients, and world-class hospitality to create an unforgettable culinary experience. From family dinners to special celebrations, every table tells a story.
          </p>
          
          <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link 
              className="hero-btn"
              to="/menu" 
              style={{ 
                padding: "16px 36px", 
                fontSize: "0.88rem", 
                letterSpacing: "0.15em", 
                textTransform: "uppercase",
                borderRadius: "0",
                fontWeight: "700",
                backgroundColor: "var(--accent)",
                color: "#011220",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                border: "1px solid var(--accent)",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(205, 162, 80, 0.2)"
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = "var(--accent-hover)";
                e.currentTarget.style.borderColor = "var(--accent-hover)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = "var(--accent)";
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
            >
              Explore Menu ↗
            </Link>
            <button 
              className="hero-btn"
              onClick={() => setIsRegisterOpen(true)}
              style={{ 
                padding: "16px 36px", 
                fontSize: "0.88rem", 
                letterSpacing: "0.15em", 
                textTransform: "uppercase",
                borderRadius: "0",
                fontWeight: "700",
                borderColor: "#ffffff",
                border: "1px solid #ffffff",
                background: "transparent",
                color: "#ffffff",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s ease"
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.color = "#011220";
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#ffffff";
              }}
            >
              Dine With Us ↗
            </button>
          </div>
        </div>
      </div>

      {/* 2. Highlights Banner (Minimalist 4-Column below Hero) */}
      <div className="home-section" style={{
        padding: "80px 20px",
        backgroundColor: "var(--bg-primary)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.02)"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "30px", textAlign: "center" }}>
          
          {/* Item 1 */}
          <div style={{ padding: "10px" }}>
            <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Z" />
                <path d="M9 22v-4" />
              </svg>
            </div>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px", fontWeight: "600" }}>Premium Ingredients</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6", maxWidth: "260px", margin: "0 auto" }}>Only the freshest and highest-quality ingredients.</p>
          </div>

          {/* Item 2 */}
          <div style={{ padding: "10px" }}>
            <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 18V9a6 6 0 0 1 12 0v9" />
                <path d="M18 18H6a3 3 0 0 0 0 6h12a3 3 0 0 0 0-6Z" />
                <path d="M12 3a4 4 0 0 0-4 4h8a4 4 0 0 0-4-4Z" />
              </svg>
            </div>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px", fontWeight: "600" }}>Master Chefs</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6", maxWidth: "260px", margin: "0 auto" }}>Crafted by experienced culinary experts.</p>
          </div>

          {/* Item 3 */}
          <div style={{ padding: "10px" }}>
            <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 22V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14" />
                <path d="M9 22v-4a3 3 0 0 1 6 0v4" />
                <path d="M12 2v4" />
                <path d="M9 2h6" />
              </svg>
            </div>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px", fontWeight: "600" }}>Elegant Ambience</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6", maxWidth: "260px", margin: "0 auto" }}>Luxury interiors designed for comfort and style.</p>
          </div>

          {/* Item 4 */}
          <div style={{ padding: "10px" }}>
            <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
              </svg>
            </div>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px", fontWeight: "600" }}>Fast Service</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6", maxWidth: "260px", margin: "0 auto" }}>Exceptional hospitality and efficient service.</p>
          </div>

        </div>
      </div>

      {/* Elegant Separator */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "20px auto", width: "80%", maxWidth: "1000px" }}>
        <div style={{ flexGrow: 1, height: "1px", backgroundColor: "rgba(205, 162, 80, 0.12)" }}></div>
        <span style={{ color: "var(--accent)", margin: "0 15px", fontSize: "0.8rem", letterSpacing: "0.2em" }}>♦</span>
        <div style={{ flexGrow: 1, height: "1px", backgroundColor: "rgba(205, 162, 80, 0.12)" }}></div>
      </div>

      {/* 3. Our Legacy Section */}
      <div id="legacy" className="home-section" style={{
        padding: "100px 20px",
        backgroundColor: "var(--bg-secondary)",
        textAlign: "center",
        borderTop: "1px solid rgba(255, 255, 255, 0.02)"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <p style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            color: "var(--accent)",
            fontSize: "1.3rem",
            marginBottom: "12px",
            letterSpacing: "0.05em"
          }}>
            Our Story
          </p>
          <h2 className="section-title" style={{
            fontFamily: "var(--serif)",
            fontSize: "3.2rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#ffffff",
            marginBottom: "30px",
            fontWeight: "700"
          }}>
            Our Legacy
          </h2>
          <p style={{
            fontSize: "1.12rem",
            color: "#9ab0c5",
            lineHeight: "2.1",
            marginBottom: "40px",
            fontWeight: "300"
          }}>
            Founded with a passion for fine dining, Dine&Desk has grown from a simple vision into a destination for food lovers. Our chefs combine timeless culinary traditions with modern creativity, ensuring every dish delivers both authenticity and innovation. For years, we have been serving guests with dedication, elegance, and a commitment to excellence.
          </p>
          <div style={{ width: "60px", height: "1px", backgroundColor: "var(--accent)", margin: "0 auto" }}></div>
        </div>
      </div>

      {/* Elegant Separator */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "20px auto", width: "80%", maxWidth: "1000px" }}>
        <div style={{ flexGrow: 1, height: "1px", backgroundColor: "rgba(205, 162, 80, 0.12)" }}></div>
        <span style={{ color: "var(--accent)", margin: "0 15px", fontSize: "0.8rem", letterSpacing: "0.2em" }}>♦</span>
        <div style={{ flexGrow: 1, height: "1px", backgroundColor: "rgba(205, 162, 80, 0.12)" }}></div>
      </div>

      {/* 4. Signature Menu Section */}
      <div className="home-section" style={{
        padding: "100px 20px",
        backgroundColor: "var(--bg-primary)"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <p style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            color: "var(--accent)",
            fontSize: "1.3rem",
            marginBottom: "12px",
            letterSpacing: "0.05em"
          }}>
            ✦ Why Choose Us ✦
          </p>
          <h2 className="section-title" style={{
            fontFamily: "var(--serif)",
            fontSize: "3.2rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#ffffff",
            marginBottom: "20px",
            fontWeight: "700"
          }}>
            Seasonal & Delicious Food Menus
          </h2>
          <p style={{
            fontSize: "1.05rem",
            color: "var(--text-secondary)",
            maxWidth: "600px",
            margin: "0 auto 60px auto",
            lineHeight: "1.7",
            fontWeight: "300"
          }}>
            Discover our curated recommendations, combining seasonal availability with luxury ingredients sourced directly from traditional regions.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "30px" }}>
            {/* Dish 1 */}
            <div className="glass-panel" style={{ padding: 0, overflow: "hidden", textAlign: "left", borderRadius: "8px" }}>
              <div style={{ height: "240px", overflow: "hidden" }}>
                <img 
                  src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600" 
                  alt="Royal Malabar Biryani" 
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                  onMouseOver={e => e.currentTarget.style.transform = "scale(1.06)"}
                  onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                />
              </div>
              <div style={{ padding: "24px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Main Courses</span>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", color: "white", marginTop: "8px", marginBottom: "8px" }}>Royal Malabar Biryani</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>Slow-cooked rice with premium spices</p>
              </div>
            </div>

            {/* Dish 2 */}
            <div className="glass-panel" style={{ padding: 0, overflow: "hidden", textAlign: "left", borderRadius: "8px" }}>
              <div style={{ height: "240px", overflow: "hidden" }}>
                <img 
                  src="https://images.unsplash.com/photo-1598515214211-89d3e73ae83b?auto=format&fit=crop&q=80&w=600" 
                  alt="Grilled Herb Chicken" 
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                  onMouseOver={e => e.currentTarget.style.transform = "scale(1.06)"}
                  onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                />
              </div>
              <div style={{ padding: "24px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Main Courses</span>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", color: "white", marginTop: "8px", marginBottom: "8px" }}>Grilled Herb Chicken</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>Tender chicken infused with fresh herbs</p>
              </div>
            </div>

            {/* Dish 3 */}
            <div className="glass-panel" style={{ padding: 0, overflow: "hidden", textAlign: "left", borderRadius: "8px" }}>
              <div style={{ height: "240px", overflow: "hidden" }}>
                <img 
                  src="https://images.unsplash.com/photo-1534080391025-097b03b2af8e?auto=format&fit=crop&q=80&w=600" 
                  alt="Seafood Platter" 
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                  onMouseOver={e => e.currentTarget.style.transform = "scale(1.06)"}
                  onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                />
              </div>
              <div style={{ padding: "24px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Main Courses</span>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", color: "white", marginTop: "8px", marginBottom: "8px" }}>Seafood Platter</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>Fresh catch prepared with coastal flavors</p>
              </div>
            </div>

            {/* Dish 4 */}
            <div className="glass-panel" style={{ padding: 0, overflow: "hidden", textAlign: "left", borderRadius: "8px" }}>
              <div style={{ height: "240px", overflow: "hidden" }}>
                <img 
                  src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600" 
                  alt="Paneer Maharaja" 
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                  onMouseOver={e => e.currentTarget.style.transform = "scale(1.06)"}
                  onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                />
              </div>
              <div style={{ padding: "24px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Main Courses</span>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", color: "white", marginTop: "8px", marginBottom: "8px" }}>Paneer Maharaja</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>Rich and creamy royal cottage cheese specialty</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Elegant Separator */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "20px auto", width: "80%", maxWidth: "1000px" }}>
        <div style={{ flexGrow: 1, height: "1px", backgroundColor: "rgba(205, 162, 80, 0.12)" }}></div>
        <span style={{ color: "var(--accent)", margin: "0 15px", fontSize: "0.8rem", letterSpacing: "0.2em" }}>♦</span>
        <div style={{ flexGrow: 1, height: "1px", backgroundColor: "rgba(205, 162, 80, 0.12)" }}></div>
      </div>

      {/* 5. Gallery Section */}
      <div className="home-section" style={{
        padding: "100px 20px",
        backgroundColor: "var(--bg-secondary)",
        borderTop: "1px solid rgba(255, 255, 255, 0.02)"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <p style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            color: "var(--accent)",
            fontSize: "1.3rem",
            marginBottom: "12px",
            letterSpacing: "0.05em"
          }}>
            Captured Moments
          </p>
          <h2 className="section-title" style={{
            fontFamily: "var(--serif)",
            fontSize: "3.2rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#ffffff",
            marginBottom: "60px",
            fontWeight: "700"
          }}>
            Gallery
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
            {/* Gallery 1 */}
            <div style={{ position: "relative", height: "300px", overflow: "hidden", borderRadius: "8px" }}>
              <img 
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=600" 
                alt="Fine Dining" 
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                onMouseOver={e => e.currentTarget.style.transform = "scale(1.06)"}
                onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
              />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px", background: "linear-gradient(transparent, rgba(1,18,32,0.9))", textAlign: "left" }}>
                <span style={{ fontSize: "1.1rem", fontFamily: "var(--serif)", color: "white", fontWeight: "600", letterSpacing: "0.05em" }}>Fine Dining</span>
              </div>
            </div>

            {/* Gallery 2 */}
            <div style={{ position: "relative", height: "300px", overflow: "hidden", borderRadius: "8px" }}>
              <img 
                src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600" 
                alt="Signature Dishes" 
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                onMouseOver={e => e.currentTarget.style.transform = "scale(1.06)"}
                onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
              />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px", background: "linear-gradient(transparent, rgba(1,18,32,0.9))", textAlign: "left" }}>
                <span style={{ fontSize: "1.1rem", fontFamily: "var(--serif)", color: "white", fontWeight: "600", letterSpacing: "0.05em" }}>Signature Dishes</span>
              </div>
            </div>

            {/* Gallery 3 */}
            <div style={{ position: "relative", height: "300px", overflow: "hidden", borderRadius: "8px" }}>
              <img 
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600" 
                alt="Family Gatherings" 
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                onMouseOver={e => e.currentTarget.style.transform = "scale(1.06)"}
                onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
              />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px", background: "linear-gradient(transparent, rgba(1,18,32,0.9))", textAlign: "left" }}>
                <span style={{ fontSize: "1.1rem", fontFamily: "var(--serif)", color: "white", fontWeight: "600", letterSpacing: "0.05em" }}>Family Gatherings</span>
              </div>
            </div>

            {/* Gallery 4 */}
            <div style={{ position: "relative", height: "300px", overflow: "hidden", borderRadius: "8px" }}>
              <img 
                src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600" 
                alt="Private Events" 
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                onMouseOver={e => e.currentTarget.style.transform = "scale(1.06)"}
                onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
              />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px", background: "linear-gradient(transparent, rgba(1,18,32,0.9))", textAlign: "left" }}>
                <span style={{ fontSize: "1.1rem", fontFamily: "var(--serif)", color: "white", fontWeight: "600", letterSpacing: "0.05em" }}>Private Events</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Elegant Separator */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "20px auto", width: "80%", maxWidth: "1000px" }}>
        <div style={{ flexGrow: 1, height: "1px", backgroundColor: "rgba(205, 162, 80, 0.12)" }}></div>
        <span style={{ color: "var(--accent)", margin: "0 15px", fontSize: "0.8rem", letterSpacing: "0.2em" }}>♦</span>
        <div style={{ flexGrow: 1, height: "1px", backgroundColor: "rgba(205, 162, 80, 0.12)" }}></div>
      </div>

      {/* 6. About Us Section */}
      <div className="home-section" style={{
        padding: "100px 20px",
        backgroundColor: "var(--bg-primary)",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <p style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            color: "var(--accent)",
            fontSize: "1.3rem",
            marginBottom: "12px",
            letterSpacing: "0.05em"
          }}>
            Discover Us
          </p>
          <h2 className="section-title" style={{
            fontFamily: "var(--serif)",
            fontSize: "3.2rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#ffffff",
            marginBottom: "30px",
            fontWeight: "700"
          }}>
            About Dine&Desk
          </h2>
          <p style={{
            fontSize: "1.12rem",
            color: "#9ab0c5",
            lineHeight: "2.1",
            marginBottom: "40px",
            fontWeight: "300"
          }}>
            Dine&Desk is more than a restaurant; it is an experience. We strive to bring people together through extraordinary food, warm hospitality, and a sophisticated atmosphere. Every guest is welcomed like family, and every meal is prepared with care and passion.
          </p>
          <div style={{ width: "60px", height: "1px", backgroundColor: "var(--accent)", margin: "0 auto" }}></div>
        </div>
      </div>

      {/* Elegant Separator */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "20px auto", width: "80%", maxWidth: "1000px" }}>
        <div style={{ flexGrow: 1, height: "1px", backgroundColor: "rgba(205, 162, 80, 0.12)" }}></div>
        <span style={{ color: "var(--accent)", margin: "0 15px", fontSize: "0.8rem", letterSpacing: "0.2em" }}>♦</span>
        <div style={{ flexGrow: 1, height: "1px", backgroundColor: "rgba(205, 162, 80, 0.12)" }}></div>
      </div>

      {/* 7. Contact Us Section */}
      <div id="contact" className="home-section" style={{
        padding: "100px 20px",
        backgroundColor: "var(--bg-secondary)",
        borderTop: "1px solid rgba(255, 255, 255, 0.02)",
        fontSize: "0.95rem"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "50px", textAlign: "left" }}>
          {/* Visit Us */}
          <div>
            <h3 style={{ fontFamily: "var(--serif)", color: "var(--accent)", textTransform: "uppercase", fontSize: "1.15rem", letterSpacing: "0.1em", marginBottom: "20px", fontWeight: "600" }}>Visit Us</h3>
            <p style={{ color: "white", fontWeight: "600", marginBottom: "8px", fontSize: "1.05rem" }}>Dine&Desk Restaurant</p>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>Kochi, Kerala</p>
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ fontFamily: "var(--serif)", color: "var(--accent)", textTransform: "uppercase", fontSize: "1.15rem", letterSpacing: "0.1em", marginBottom: "20px", fontWeight: "600" }}>Contact</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "8px", fontSize: "1.05rem" }}>Phone: +91 484 234 5678</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>Email: contact@dineanddesk.com</p>
          </div>

          {/* Hours */}
          <div>
            <h3 style={{ fontFamily: "var(--serif)", color: "var(--accent)", textTransform: "uppercase", fontSize: "1.15rem", letterSpacing: "0.1em", marginBottom: "20px", fontWeight: "600" }}>Hours</h3>
            <p style={{ color: "white", fontWeight: "600", marginBottom: "8px", fontSize: "1.05rem" }}>Monday – Sunday</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>11:00 AM – 11:00 PM</p>
          </div>
        </div>
      </div>

      {/* 8. Footer */}
      <footer style={{
        padding: "80px 20px 40px 20px",
        backgroundColor: "var(--bg-primary)",
        textAlign: "center",
        borderTop: "1px solid rgba(255, 255, 255, 0.04)"
      }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--serif)", color: "white", textTransform: "uppercase", fontSize: "2.2rem", letterSpacing: "0.1em", marginBottom: "8px", fontWeight: "700" }}>Dine&Desk</h2>
          <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--accent)", fontSize: "1.2rem", marginBottom: "30px" }}>
            "Where Taste Meets Tradition"
          </p>
          
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "25px" }}>
            © 2026 Dine&Desk. All Rights Reserved.
          </p>

          <Link 
            to="/login" 
            style={{ 
              fontSize: "0.85rem", 
              color: "rgba(255, 255, 255, 0.15)",
              textDecoration: "none",
              transition: "color 0.2s ease"
            }}
            onMouseOver={e => e.currentTarget.style.color = "var(--accent)"}
            onMouseOut={e => e.currentTarget.style.color = "rgba(255, 255, 255, 0.15)"}
          >
            🔑 Staff Area
          </Link>
        </div>
      </footer>

      <RegistrationModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
        onSuccess={handleRegisterSuccess} 
      />

    </div>
  );
}