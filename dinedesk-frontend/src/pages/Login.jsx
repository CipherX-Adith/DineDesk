import { useState } from "react";
import api from "../services/api";
import "../App.css";

export default function Login({
  setPage,
  setUserRole,
  setLoggedInUser
}) {

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const login = async () => {

    try {

      const res = await api.post(
        "/users/login",
        {
          username,
          password
        }
      );

      setLoggedInUser(res.data);

setUserRole(
  res.data.role
);

if(res.data.role === "ADMIN"){

  setPage("admin");
}
else{

  setPage("staff");
}

    } catch(error) {

      alert(
        "Invalid Username Or Password"
      );

      console.log(error);
    }
  };

  return (

    <div className="container">

      <h2>
        Staff / Admin Login
      </h2>

      <input
        type="text"
        placeholder="Username"
        onChange={(e) =>
          setUsername(
            e.target.value
          )
        }
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setPassword(
            e.target.value
          )
        }
      />

      <button onClick={login}>
        Login
      </button>

      <button
        onClick={() => setPage("home")}
      >
        Back
      </button>

    </div>
  );
}