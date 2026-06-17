import { useEffect, useState } from "react";
import api from "../services/api";
import "../App.css";

export default function MenuPage({ setPage }) {

  const [menuItems, setMenuItems] =
    useState([]);

  const [cart, setCart] =
    useState([]);

  const loadMenu = async () => {

    try {

      const res =
        await api.get("/menu");

      setMenuItems(
        res.data
      );

    } catch(error) {

      console.log(error);
    }
  };

  useEffect(() => {

    loadMenu();

  }, []);

  const addToCart = (item) => {

    const existingItem =
      cart.find(
        cartItem =>
          cartItem.itemId === item.itemId
      );

    if(existingItem){

      setCart(

        cart.map(

          cartItem =>

            cartItem.itemId === item.itemId

              ? {
                  ...cartItem,
                  quantity:
                    cartItem.quantity + 1
                }

              : cartItem
        )
      );
    }
    else{

      setCart([

        ...cart,

        {
          itemId:
            item.itemId,

          itemName:
            item.itemName,

          price:
            item.price,

          quantity:
            1
        }
      ]);
    }
  };

  const increaseQuantity =
    (itemId) => {

      setCart(

        cart.map(

          item =>

            item.itemId === itemId

              ? {
                  ...item,
                  quantity:
                    item.quantity + 1
                }

              : item
        )
      );
    };

  const decreaseQuantity =
    (itemId) => {

      setCart(

        cart

          .map(

            item =>

              item.itemId === itemId

                ? {
                    ...item,
                    quantity:
                      item.quantity - 1
                  }

                : item
          )

          .filter(

            item =>
              item.quantity > 0
          )
      );
    };

  const subtotal =

    cart.reduce(

      (sum, item) =>

        sum +
        item.price *
        item.quantity,

      0
    );

  const gst =
    subtotal * 0.18;

  const total =
    subtotal + gst;

  const placeOrder =
    async () => {

      try {

        const customerId =
          localStorage.getItem(
            "customerId"
          );

        const orderItems =

          cart.map(

            item => ({

              itemId:
                item.itemId,

              quantity:
                item.quantity
            })
          );

        const res =
          await api.post(

            "/orders",

            {
              customerId,
              items:
                orderItems
            }
          );

        alert(
          "Order Placed Successfully\n" +
          res.data.orderId
        );

        setCart([]);

        loadMenu();

      } catch(error) {

        console.log(error);

        alert(
          "Order Failed"
        );
      }
    };

  return (

    <div className="container">

      <h1>
        DineDesk Menu
      </h1>

      <button
        onClick={() =>
          setPage("home")
        }
      >
        Home
      </button>

      <div className="menu-layout">

        <div className="menu-section">

          <h2>
            Menu Items
          </h2>

          {

            menuItems.map(

              item => (

                <div
                  className="menu-card"
                  key={item.itemId}
                >

                  <h3>
                    {item.itemName}
                  </h3>

                  <p>
                    {item.category}
                  </p>

                  <p>
                    {item.description}
                  </p>

                  <h3>
                    ₹{item.price}
                  </h3>

                  <p>
                    Available :
                    {item.availableQuantity}
                  </p>

                  <button
                    onClick={() =>
                      addToCart(item)
                    }
                  >
                    Add To Cart
                  </button>

                </div>
              )
            )
          }

        </div>

        <div className="cart-section">

          <div className="cart-card">

            <h2>
              My Cart
            </h2>

            {

              cart.length === 0 &&

              <p>
                Cart Empty
              </p>
            }

            {

              cart.map(

                item => (

                  <div
                    key={item.itemId}
                  >

                    <h4>
                      {item.itemName}
                    </h4>

                    <p>
                      ₹{item.price}
                    </p>

                    <button
                      onClick={() =>
                        decreaseQuantity(
                          item.itemId
                        )
                      }
                    >
                      -
                    </button>

                    {item.quantity}

                    <button
                      onClick={() =>
                        increaseQuantity(
                          item.itemId
                        )
                      }
                    >
                      +
                    </button>

                    <hr />

                  </div>
                )
              )
            }

            <h3>
              Subtotal :
              ₹{subtotal.toFixed(2)}
            </h3>

            <h3>
              GST :
              ₹{gst.toFixed(2)}
            </h3>

            <h2>
              Total :
              ₹{total.toFixed(2)}
            </h2>

            {

              cart.length > 0 &&

              <button
                onClick={
                  placeOrder
                }
              >
                Place Order
              </button>
            }

          </div>

        </div>

      </div>

    </div>
  );
}