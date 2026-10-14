import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";

function ProductCard({ product }) {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistError, setWishlistError] = useState("");
  const { addToCart, cartItems, actionLoading } = useCart();

  const handleViewDetails = () => {
    navigate(`/products/${product._id}`);
  };
  const isAdding = actionLoading[product._id];

  const alreadyInCart = cartItems.some(
    (item) => item.product?._id === product._id,
  );

  const handleWishlist = async () => {
    if (saving || wishlisted) {
      return;
    }

    try {
      setSaving(true);
      setWishlistError("");

      await api.post(`/wishlist/${product._id}`);

      setWishlisted(true);
    } catch (error) {
      console.error("Wishlist error:", error);

      if (error.response?.status === 409) {
        setWishlisted(true);
      } else if (error.response?.status === 401) {
        setWishlistError("Please login to use wishlist.");
      } else {
        setWishlistError("Unable to save product. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };
  const handleAddToCart = async () => {
    if (isAdding) return;

    const result = await addToCart(product._id);

    if (!result.success) {
      alert(result.message);
    }
  };

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} className="product-image" />

      <div className="product-info">
        <h2>{product.name}</h2>

        <p className="product-category">{product.category}</p>

        <p className="product-price">
          ₹{product.price.toLocaleString("en-IN")}
        </p>

        <p className="product-stock">
          {product.stock > 0 ? `${product.stock} units left` : "Out of Stock"}
        </p>

        <div className="product-actions">
          <button className="details-btn" onClick={handleViewDetails}>
            View Details
          </button>

          <button
            className="wishlist-btn"
            onClick={handleWishlist}
            disabled={saving || wishlisted}
          >
            {saving
              ? "⏳ Saving..."
              : wishlisted
                ? "♥ Added to Wishlist"
                : "♡ Add to Wishlist"}
          </button>
          <button
            className="cart-btn"
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding
              ? "Adding..."
              : alreadyInCart
                ? "Add Another"
                : "Add to Cart"}
          </button>
        </div>

        {wishlistError && <p className="wishlist-error">{wishlistError}</p>}
      </div>
    </div>
  );
}

export default ProductCard;
