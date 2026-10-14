import { useNavigate } from "react-router-dom";

function WishlistCard({ product, onRemove, removing }) {
  const navigate = useNavigate();

  return (
    <div className="wishlist-card">
      <img src={product.image} alt={product.name} className="wishlist-image" />

      <div className="wishlist-info">
        <h2>{product.name}</h2>

        <p className="product-category">{product.category}</p>

        <p className="product-price">
          ₹{product.price.toLocaleString("en-IN")}
        </p>

        <p className="product-stock">
          {product.stock > 0 ? `${product.stock} units left` : "Out of Stock"}
        </p>

        <div className="wishlist-actions">
          <button
            className="details-btn"
            onClick={() => navigate(`/products/${product._id}`)}
          >
            View Details
          </button>

          <button
            className="remove-btn"
            onClick={() => onRemove(product._id)}
            disabled={removing}
          >
            {removing ? "Removing..." : "Remove ♥"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WishlistCard;
