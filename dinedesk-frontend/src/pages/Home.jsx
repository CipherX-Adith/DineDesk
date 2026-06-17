import "../App.css";

export default function Home({ setPage }) {
  return (
    <div className="container">
      <h1>DineDesk</h1>

      <p>Restaurant Ordering System</p>

      <button
        onClick={() => setPage("customer")}
      >
        Customer
      </button>

      <button
        onClick={() => setPage("login")}
      >
        Staff / Admin
      </button>
    </div>
  );
}