import { useState } from "react";
import api from "../services/api";
import "../App.css";

export default function CustomerPortal({ setPage }) {

  const [customerName, setCustomerName] =
    useState("");

  const [accompanyingPeople, setAccompanyingPeople] =
    useState(0);

  const [response, setResponse] =
    useState(null);

  const registerCustomer = async () => {

    try {

      const res = await api.post(
        "/customers",
        {
          customerName,
          accompanyingPeople
        }
      );

      setResponse(res.data);

localStorage.setItem(
  "customerId",
  res.data.customerId
);

setPage("menu");

    } catch(error) {

      console.log(error);

      alert("Customer Registration Failed");
    }
  };

  return (

    <div className="container">

      <h2>Customer Registration</h2>

      <input
        type="text"
        placeholder="Customer Name"
        value={customerName}
        onChange={(e) =>
          setCustomerName(e.target.value)
        }
      />

      <input
        type="number"
        placeholder="Accompanying People"
        value={accompanyingPeople}
        onChange={(e) =>
          setAccompanyingPeople(
            Number(e.target.value)
          )
        }
      />

      <button onClick={registerCustomer}>
        Register
      </button>

      <button
        onClick={() => setPage("home")}
      >
        Back
      </button>

      {
        response && (

          <div>

            <h3>
              Customer Registered
            </h3>

            <p>
              ID : {response.customerId}
            </p>

            <p>
              Name : {response.customerName}
            </p>

            <p>
              Party Size : {response.partySize}
            </p>

          </div>
        )
      }

    </div>
  );
}