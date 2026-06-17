import { useEffect, useState } from "react";
import api from "../services/api";
import "../App.css";

export default function AdminDashboard() {

  const [itemName, setItemName] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [availableQuantity,
          setAvailableQuantity] =
    useState("");

  const [menuItems, setMenuItems] =
    useState([]);

  const addMenuItem =
    async () => {

      try {

        await api.post(
          "/menu",
          {
            itemName,
            category,
            description,
            price,
            availableQuantity
          }
        );

        loadMenu();

        setItemName("");
        setCategory("");
        setDescription("");
        setPrice("");
        setAvailableQuantity("");

      } catch(error) {

        console.log(error);
      }
    };

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

  const updateQuantity =
    async (id, quantity) => {

      try {

        await api.put(
          `/menu/${id}/${quantity}`
        );

        loadMenu();

      } catch(error) {

        console.log(error);
      }
    };

  const deleteItem =
    async (id) => {

      try {

        await api.delete(
          `/menu/${id}`
        );

        loadMenu();

      } catch(error) {

        console.log(error);
      }
    };

  return (

    <div className="container">

      <h1>
        Admin Dashboard
      </h1>

      <h2>
        Menu Management
      </h2>

      <input
        placeholder="Item Name"
        value={itemName}
        onChange={(e) =>
          setItemName(
            e.target.value
          )
        }
      />

      <input
        placeholder="Category"
        value={category}
        onChange={(e) =>
          setCategory(
            e.target.value
          )
        }
      />

      <input
        placeholder="Description"
        value={description}
        onChange={(e) =>
          setDescription(
            e.target.value
          )
        }
      />

      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) =>
          setPrice(
            e.target.value
          )
        }
      />

      <input
        type="number"
        placeholder="Quantity"
        value={availableQuantity}
        onChange={(e) =>
          setAvailableQuantity(
            e.target.value
          )
        }
      />

      <button
        onClick={addMenuItem}
      >
        Add Menu Item
      </button>

      <hr />

      <h2>
        Inventory
      </h2>

      <table border="1">

        <thead>

          <tr>

            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          {
            menuItems.map(
              (item) => (

                <tr
                  key={item.itemId}
                >

                  <td>
                    {item.itemId}
                  </td>

                  <td>
                    {item.itemName}
                  </td>

                  <td>
                    {item.category}
                  </td>

                  <td>
                    ₹{item.price}
                  </td>

                  <td>
                    {item.availableQuantity}
                  </td>

                  <td>

                    <input
                      type="number"
                      placeholder="New Qty"
                      onChange={(e) =>
                        item.newQuantity =
                          e.target.value
                      }
                    />

                    <button
                      onClick={() =>
                        updateQuantity(
                          item.itemId,
                          item.newQuantity
                        )
                      }
                    >
                      Update
                    </button>

                    <button
                      onClick={() =>
                        deleteItem(
                          item.itemId
                        )
                      }
                    >
                      Delete
                    </button>

                  </td>

                </tr>
              )
            )
          }

        </tbody>

      </table>

    </div>
  );
}