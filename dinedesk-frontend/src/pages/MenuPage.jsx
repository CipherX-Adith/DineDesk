import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import RegistrationModal from "../components/RegistrationModal";
import "../App.css";

export default function MenuPage() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // React state for table session check-in
  const [currentCustomerId, setCurrentCustomerId] = useState(localStorage.getItem("customerId"));
  const [currentCustomerName, setCurrentCustomerName] = useState(localStorage.getItem("customerName"));
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const loadMenu = async () => {
    try {
      const res = await api.get("/menu");
      setMenuItems(res.data);
    } catch (error) {
      console.error("Failed to load menu items", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();

    // Restore cart from session storage if exists
    const savedCart = sessionStorage.getItem("dinedesk_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        sessionStorage.removeItem("dinedesk_cart");
      }
    }
  }, []);

  // Save cart to session storage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      sessionStorage.setItem("dinedesk_cart", JSON.stringify(cart));
    } else {
      sessionStorage.removeItem("dinedesk_cart");
    }
  }, [cart]);

  const handleRegisterSuccess = (customerData) => {
    setCurrentCustomerId(customerData.customerId);
    setCurrentCustomerName(customerData.customerName);
  };

  const addToCart = (item) => {
    const stockAvailable = item.availableQuantity;
    const existingItem = cart.find(cartItem => cartItem.itemId === item.itemId);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;

    if (currentQtyInCart >= stockAvailable) {
      alert(`Sorry, only ${stockAvailable} unit(s) of ${item.itemName} are available in stock.`);
      return;
    }

    if (existingItem) {
      setCart(
        cart.map(cartItem =>
          cartItem.itemId === item.itemId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([
        ...cart,
        {
          itemId: item.itemId,
          itemName: item.itemName,
          price: item.price,
          quantity: 1
        }
      ]);
    }
  };

  const increaseQuantity = (itemId) => {
    const menuItem = menuItems.find(item => item.itemId === itemId);
    const cartItem = cart.find(item => item.itemId === itemId);
    
    if (menuItem && cartItem && cartItem.quantity >= menuItem.availableQuantity) {
      alert(`Sorry, only ${menuItem.availableQuantity} unit(s) of ${menuItem.itemName} are available in stock.`);
      return;
    }

    setCart(
      cart.map(item =>
        item.itemId === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (itemId) => {
    setCart(
      cart
        .map(item =>
          item.itemId === itemId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  // Chef's Recommended Combos (bundle definition)
  const comboOffers = [
    {
      id: "combo-1",
      name: "Classic Combo Feast",
      items: ["Veg Burger", "French Fries", "Coca Cola"],
      description: "A mouthwatering combination of our Classic Veg Burger, crispy salted French Fries, and a chilled Coca Cola.",
      priceHint: "Best Seller"
    },
    {
      id: "combo-2",
      name: "Sweet Delight Combo",
      items: ["Chocolate Brownie", "Vanilla Ice Cream"],
      description: "Warm, rich Chocolate Brownie paired perfectly with a scoop of premium Vanilla Bean Ice Cream.",
      priceHint: "Perfect Dessert Duo"
    }
  ];

  const addComboToCart = (combo) => {
    let addedAny = false;
    let newCart = [...cart];

    for (const itemTitle of combo.items) {
      const menuItem = menuItems.find(
        m => m.itemName.toLowerCase() === itemTitle.toLowerCase() && m.availableQuantity > 0
      );

      if (menuItem) {
        const existingIndex = newCart.findIndex(c => c.itemId === menuItem.itemId);
        const currentQty = existingIndex !== -1 ? newCart[existingIndex].quantity : 0;

        if (currentQty < menuItem.availableQuantity) {
          if (existingIndex !== -1) {
            newCart[existingIndex].quantity += 1;
          } else {
            newCart.push({
              itemId: menuItem.itemId,
              itemName: menuItem.itemName,
              price: menuItem.price,
              quantity: 1
            });
          }
          addedAny = true;
        }
      }
    }

    if (addedAny) {
      setCart(newCart);
      alert(`Items for "${combo.name}" have been added to your cart!`);
    } else {
      alert("Sorry, all items in this combo are currently out of stock.");
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const placeOrder = async () => {
    if (cart.length === 0) return;
    
    try {
      const orderItems = cart.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity
      }));

      const res = await api.post("/orders", {
        customerId: currentCustomerId,
        items: orderItems
      });

      const orderId = res.data.orderId;

      alert(`Order placed successfully!\nOrder ID: ${orderId}`);
      
      // Clear cart
      setCart([]);
      sessionStorage.removeItem("dinedesk_cart");
      
      // Redirect to customer dashboard
      navigate("/customer/dashboard");
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || "Please check available stock quantities and try again.";
      alert(`Order Failed: ${errMsg}`);
    }
  };

  // Filter Categories dynamically
  const categories = ["All", ...new Set(menuItems.map(item => item.category))];

  // Filter items based on search and category tab
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group items by category for the printed style presentation
  const groupedItems = filteredMenuItems.reduce((groups, item) => {
    const category = item.category || "General";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  return (
    <div className="container animate-fade">
      {/* 1. Dining Banner (if not logged in) */}
      {!currentCustomerId && (
        <div className="glass-panel animate-slide" style={{ 
          padding: "20px 30px", 
          marginBottom: "30px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          border: "1px solid var(--accent-border)",
          background: "rgba(205, 162, 80, 0.04)",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", textAlign: "left" }}>
            <span style={{ fontSize: "1.8rem" }}>🍽️</span>
            <div>
              <h3 style={{ fontSize: "1.1rem", margin: 0, fontFamily: "var(--serif)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)" }}>Dining at our restaurant?</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>Start a dining table session to place orders directly from your device.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsRegisterOpen(true)}
            className="btn" 
            style={{ 
              padding: "10px 24px", 
              fontSize: "0.85rem", 
              letterSpacing: "0.08em", 
              textTransform: "uppercase",
              borderRadius: "0",
              backgroundColor: "var(--accent)",
              color: "#011220",
              fontWeight: "700",
              border: "1px solid var(--accent)",
              transition: "all 0.2s ease",
              cursor: "pointer"
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = "var(--accent-hover)"}
            onMouseOut={e => e.currentTarget.style.backgroundColor = "var(--accent)"}
          >
            Start Table Order
          </button>
        </div>
      )}

      {/* 2. Top Banner Header */}
      {!currentCustomerId ? (
        <div className="glass-panel" style={{ padding: "30px 40px", marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--accent)", fontSize: "1.2rem", margin: "0 0 6px 0" }}>Dine&Desk</p>
            <h1 style={{ fontSize: "2.8rem", fontFamily: "var(--serif)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0, fontWeight: "700" }}>Our Digital Menu</h1>
          </div>
          <div>
            <input
              type="text"
              placeholder="🔍 Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ minWidth: "280px", padding: "12px 20px", borderRadius: "0", border: "1px solid var(--border-glass)", background: "rgba(0,0,0,0.25)", color: "white" }}
            />
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: "20px 30px", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ textAlign: "left" }}>
            <h1 style={{ fontSize: "2rem", fontFamily: "var(--display)" }}>Select Your Dishes</h1>
            <p style={{ color: "var(--text-secondary)" }}>Table Guest: <strong style={{ color: "white" }}>{currentCustomerName}</strong></p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="🔍 Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ maxWidth: "300px", padding: "10px 16px" }}
            />
            <Link to="/customer/dashboard" className="btn btn-secondary">
              📋 Table Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* 3. Menu & Cart layout */}
      <div className="menu-container" style={!currentCustomerId ? { gridTemplateColumns: "1fr" } : {}}>
        {/* Left Side: Items */}
        <div style={{ width: "100%" }}>
          {loading ? (
            <div className="flex-center" style={{ padding: "80px 0" }}>
              <div className="spinner"></div>
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="glass-panel" style={{ padding: "60px 20px", color: "var(--text-muted)", fontSize: "1.1rem" }}>
              🍽️ No dishes match your search.
            </div>
          ) : !currentCustomerId ? (
            /* PRINTED STYLE MENU PRESENTATION (FOR BROWSERS) */
            <div className="glass-panel animate-fade" style={{ 
              padding: "50px 60px", 
              backgroundColor: "var(--bg-secondary)", 
              borderRadius: "12px",
              border: "1px solid rgba(205, 162, 80, 0.25)",
              position: "relative",
              boxShadow: "0 15px 40px rgba(0, 0, 0, 0.6)"
            }}>
              {/* Elegant Royal Inner Border */}
              <div style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                right: "12px",
                bottom: "12px",
                border: "1px double rgba(205, 162, 80, 0.15)",
                pointerEvents: "none",
                borderRadius: "8px"
              }}></div>

              {/* Royal Emblem Header */}
              <div style={{ textAlign: "center", marginBottom: "50px", position: "relative", zIndex: 1 }}>
                <span style={{ color: "var(--accent)", fontSize: "2rem" }}>⚜️</span>
                <h2 style={{ 
                  fontFamily: "var(--serif)", 
                  fontSize: "2.4rem", 
                  letterSpacing: "0.15em", 
                  color: "#ffffff", 
                  textTransform: "uppercase", 
                  marginTop: "8px", 
                  marginBottom: "6px",
                  fontWeight: "700"
                }}>
                  La Carte
                </h2>
                <p style={{ 
                  fontFamily: "var(--serif)", 
                  fontStyle: "italic", 
                  color: "var(--accent)", 
                  fontSize: "1.05rem", 
                  margin: 0,
                  letterSpacing: "0.03em"
                }}>
                  A curated selection of culinary masterworks
                </p>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center", 
                  gap: "15px", 
                  marginTop: "16px" 
                }}>
                  <span style={{ height: "1px", width: "60px", background: "linear-gradient(to right, transparent, var(--accent))" }}></span>
                  <span style={{ color: "var(--accent)", fontSize: "0.7rem" }}>♦</span>
                  <span style={{ height: "1px", width: "60px", background: "linear-gradient(to left, transparent, var(--accent))" }}></span>
                </div>
              </div>

              {Object.keys(groupedItems).map(category => (
                <div key={category} style={{ marginBottom: "50px", position: "relative", zIndex: 1 }}>
                  <h3 style={{ 
                    fontFamily: "var(--serif)", 
                    color: "var(--accent)", 
                    textTransform: "uppercase", 
                    fontSize: "1.4rem", 
                    letterSpacing: "0.15em", 
                    textAlign: "center",
                    fontWeight: "600",
                    marginBottom: "35px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px"
                  }}>
                    <span style={{ fontSize: "0.7rem" }}>♦</span> {category} <span style={{ fontSize: "0.7rem" }}>♦</span>
                  </h3>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "30px 50px" }}>
                    {groupedItems[category].map(item => (
                      <div key={item.itemId} style={{ textAlign: "left", marginBottom: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "5px" }}>
                          <span style={{ 
                            fontFamily: "var(--serif)", 
                            fontSize: "1.2rem", 
                            color: "#ffffff", 
                            fontWeight: "600",
                            letterSpacing: "0.02em"
                          }}>
                            {item.itemName}
                          </span>
                          <span style={{ 
                            flexGrow: 1, 
                            borderBottom: "1px dotted rgba(205, 162, 80, 0.25)", 
                            margin: "0 12px", 
                            alignSelf: "stretch", 
                            marginBottom: "6px" 
                          }}></span>
                          <span style={{ 
                            fontFamily: "var(--serif)", 
                            fontSize: "1.2rem", 
                            color: "var(--accent)", 
                            fontWeight: "600" 
                          }}>
                            ₹{item.price}
                          </span>
                        </div>
                        <p style={{ 
                          fontSize: "0.88rem", 
                          color: "var(--text-secondary)", 
                          fontStyle: "italic", 
                          margin: "0 0 12px 0", 
                          lineHeight: "1.5",
                          letterSpacing: "0.01em"
                        }}>
                          {item.description || "Prepared with fresh, premium seasonal ingredients."}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* INTERACTIVE CATEGORIES & CARD GRID (FOR ACTIVE DINING SESSION) */
            <>
              {/* Categories Tab Bar */}
              <div className="categories-bar">
                {categories.map(category => (
                  <button
                    key={category}
                    className={`category-tab ${selectedCategory === category ? "active" : ""}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="menu-items-grid">
                {filteredMenuItems.map(item => {
                  const isOutOfStock = item.availability === "Out Of Stock" || item.availableQuantity === 0;
                  const qtyInCart = cart.find(c => c.itemId === item.itemId)?.quantity || 0;
                  
                  return (
                    <div key={item.itemId} className="glass-panel menu-item-card" style={{ opacity: isOutOfStock ? 0.6 : 1 }}>
                      <div className="menu-item-info">
                        <div className="menu-item-header">
                          <span className="menu-item-name">{item.itemName}</span>
                          {isOutOfStock ? (
                            <span className="status-badge unpaid" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>Out of Stock</span>
                          ) : (
                            <span className="role-badge customer" style={{ fontSize: "0.7rem", padding: "2px 8px", background: "none" }}>{item.category}</span>
                          )}
                        </div>
                        <p className="menu-item-desc">{item.description || "Freshly prepared with premium local ingredients."}</p>
                        
                        <div className="menu-item-meta">
                          <span className="menu-item-price">₹{item.price.toFixed(2)}</span>
                          <span>Stock: {item.availableQuantity}</span>
                        </div>
                      </div>

                      <div>
                        {qtyInCart > 0 ? (
                          <div className="qty-control" style={{ justifyContent: "center", marginTop: "10px" }}>
                            <button onClick={() => decreaseQuantity(item.itemId)} className="qty-btn">-</button>
                            <span style={{ fontWeight: "600", fontSize: "1.1rem", width: "24px", textAlign: "center" }}>{qtyInCart}</span>
                            <button onClick={() => increaseQuantity(item.itemId)} className="qty-btn">+</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            className="btn btn-primary"
                            style={{ width: "100%", padding: "10px", marginTop: "10px" }}
                            disabled={isOutOfStock}
                          >
                            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Combos Section */}
              {!loading && menuItems.length > 0 && (
                <div style={{ width: "100%", marginTop: "40px" }}>
                  <h2 className="combos-title">✨ Recommended Meal Combos</h2>
                  <div className="combos-grid">
                    {comboOffers.map(combo => (
                      <div key={combo.id} className="glass-panel combo-card">
                        <div style={{ textAlign: "left", marginBottom: "16px" }}>
                          <div className="flex-between" style={{ marginBottom: "8px" }}>
                            <h3 style={{ fontSize: "1.15rem" }}>{combo.name}</h3>
                            <span className="combo-badge">{combo.priceHint}</span>
                          </div>
                          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                            {combo.description}
                          </p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {combo.items.map((ci, idx) => (
                              <span key={idx} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-glass)", borderRadius: "4px", padding: "2px 8px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                                {ci}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => addComboToCart(combo)} className="btn btn-secondary" style={{ width: "100%", borderColor: "var(--accent-border)", color: "var(--accent)", background: "rgba(245,158,11,0.03)" }}>
                          ➕ Add Combo to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Side: Floating Cart (ONLY render if customerId is active) */}
        {currentCustomerId && (
          <div className="glass-panel cart-card animate-slide">
            <h2 style={{ fontSize: "1.4rem", fontFamily: "var(--display)", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "14px" }}>
              🛒 My Cart 
              {cart.length > 0 && (
                <span className="role-badge admin" style={{ fontSize: "0.8rem", borderRadius: "50%", width: "24px", height: "24px", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </h2>

            <div className="cart-items-list">
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 10px", color: "var(--text-muted)" }}>
                  <p style={{ fontSize: "1.1rem", marginBottom: "6px" }}>Your cart is empty</p>
                  <p style={{ fontSize: "0.8rem" }}>Add dishes from the menu to build your table order.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.itemId} className="cart-item animate-fade">
                    <div className="cart-item-details">
                      <div className="cart-item-name">{item.itemName}</div>
                      <div className="cart-item-price">₹{item.price.toFixed(2)} each</div>
                    </div>
                    <div className="qty-control">
                      <button onClick={() => decreaseQuantity(item.itemId)} className="qty-btn" style={{ width: "24px", height: "24px" }}>-</button>
                      <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>{item.quantity}</span>
                      <button onClick={() => increaseQuantity(item.itemId)} className="qty-btn" style={{ width: "24px", height: "24px" }}>+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-totals">
                <div className="flex-between" style={{ fontSize: "0.95rem" }}>
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex-between" style={{ fontSize: "0.95rem", color: "var(--text-secondary)" }}>
                  <span>GST (18%):</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex-between" style={{ fontSize: "1.2rem", fontWeight: "700", borderTop: "1px solid var(--border-glass)", paddingTop: "12px", marginTop: "4px" }}>
                  <span style={{ color: "#ffffff" }}>Total Amount:</span>
                  <span style={{ color: "var(--accent)" }}>₹{total.toFixed(2)}</span>
                </div>
                <button
                  onClick={placeOrder}
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "14px", marginTop: "16px", fontSize: "1rem" }}
                >
                  🔔 Place Order
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <RegistrationModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
        onSuccess={handleRegisterSuccess} 
      />
    </div>
  );
}