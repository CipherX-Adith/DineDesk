import { useState } from "react";

import Home from "./pages/Home";
import CustomerPortal from "./pages/CustomerPortal";
import Login from "./pages/Login";

import MenuPage from "./pages/MenuPage";

import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";

function App() {

  const [page, setPage] =
    useState("home");

    const [userRole, setUserRole] =
      useState("");

const [loggedInUser, setLoggedInUser] =
      useState(null);

  return (
    <>
      {page === "home" &&
        <Home setPage={setPage} />
      }

      {page === "admin" &&
  <AdminDashboard />
}

{page === "menu" &&
  <MenuPage />
}

{page === "staff" &&
  <StaffDashboard />
}

      {page === "customer" &&
        <CustomerPortal setPage={setPage} />
      }

      {page === "login" &&
        <Login
  setPage={setPage}
  setUserRole={setUserRole}
  setLoggedInUser={setLoggedInUser}
/>
      }
    </>
  );
}

export default App;