import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import WishlistCard from "../components/WishlistCard";

function Wishlist() {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  // =====================================
  // FETCH WISHLIST
  // =====================================

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/wishlist");

      console.log("Wishlist response:", response.data);

      setWishlist(response.data.wishlist || []);
    } catch (error) {
      console.error("Wishlist error:", error);

      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError("Unable to load wishlist.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // =====================================
  // INITIAL LOAD
  // =====================================

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // =====================================
  // REMOVE PRODUCT
  // =====================================

  const handleRemove = async (productId) => {
    try {
      setRemovingId(productId);

      await api.delete(`/wishlist/${productId}`);

      // Remove immediately from UI
      setWishlist((current) =>
        current.filter((product) => product._id !== productId),
      );
    } catch (error) {
      console.error("Remove wishlist error:", error);

      alert("Unable to remove product from wishlist.");
    } finally {
      setRemovingId(null);
    }
  };

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="state-message">
        <h2>Loading your wishlist...</h2>
      </div>
    );
  }

  // =====================================
  // ERROR
  // =====================================

  if (error) {
    return (
      <div className="state-message">
        <h2>Something went wrong.</h2>

        <p>We couldn't load your wishlist.</p>

        <button className="details-btn retry-btn" onClick={fetchWishlist}>
          Try Again
        </button>
      </div>
    );
  }

  // =====================================
  // EMPTY
  // =====================================

  if (wishlist.length === 0) {
    return (
      <div className="empty-wishlist">
        <div className="empty-heart">❤️</div>

        <h1>Your wishlist is empty</h1>

        <p>Save products you love and find them here later.</p>

        <button
          className="details-btn browse-btn"
          onClick={() => navigate("/products")}
        >
          Browse Products
        </button>
      </div>
    );
  }

  // =====================================
  // WISHLIST UI
  // =====================================

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <div>
          <h1>My Wishlist ❤️</h1>

          <p>
            {wishlist.length} {wishlist.length === 1 ? "product" : "products"}{" "}
            saved
          </p>
        </div>

        <button className="continue-btn" onClick={() => navigate("/products")}>
          Continue Shopping
        </button>
      </div>

      <div className="wishlist-grid">
        {wishlist.map((product) => (
          <WishlistCard
            key={product._id}
            product={product}
            onRemove={handleRemove}
            removing={removingId === product._id}
          />
        ))}
      </div>
    </div>
  );
}

export default Wishlist;
