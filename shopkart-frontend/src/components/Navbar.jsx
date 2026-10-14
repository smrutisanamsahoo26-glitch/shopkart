import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  const handleLogout = async () => {
    try {
      await api.post("/customers/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }

    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">🛒 ShopKart</div>

      <div className="navbar-links">
        <Link to="/home">Home</Link>

        <Link to="/products">Products</Link>

        <Link to="/wishlist">Wishlist</Link>
        <Link to="/cart">Cart ({totalItems})</Link>
        <Link to="/orders">My Orders</Link>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
