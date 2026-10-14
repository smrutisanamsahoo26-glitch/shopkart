import { useCart } from "../context/CartContext";

function CartItem({ item }) {
  const { updateQuantity, removeFromCart, actionLoading } = useCart();

  const product = item.product;

  const loading = actionLoading[product._id];

  const handleIncrease = async () => {
    if (item.quantity >= product.stock) {
      alert(`Only ${product.stock} units available`);

      return;
    }

    const result = await updateQuantity(product._id, item.quantity + 1);

    if (!result.success) {
      alert(result.message);
    }
  };

  const handleDecrease = async () => {
    if (item.quantity <= 1) {
      return;
    }

    const result = await updateQuantity(product._id, item.quantity - 1);

    if (!result.success) {
      alert(result.message);
    }
  };

  const handleRemove = async () => {
    const result = await removeFromCart(product._id);

    if (!result.success) {
      alert(result.message);
    }
  };

  return (
    <div className="cart-item">
      <img src={product.image} alt={product.name} className="cart-item-image" />

      <div className="cart-item-info">
        <h2>{product.name}</h2>

        <p className="product-category">{product.category}</p>

        <p className="cart-item-price">
          ₹{product.price.toLocaleString("en-IN")}
        </p>

        <p>Stock: {product.stock}</p>

        <div className="quantity-controls">
          <button
            onClick={handleDecrease}
            disabled={loading || item.quantity <= 1}
          >
            −
          </button>

          <span>{item.quantity}</span>

          <button
            onClick={handleIncrease}
            disabled={loading || item.quantity >= product.stock}
          >
            +
          </button>
        </div>

        <button
          className="remove-cart-btn"
          onClick={handleRemove}
          disabled={loading}
        >
          {loading ? "Updating..." : "Remove"}
        </button>
      </div>

      <div className="cart-item-total">
        ₹{(product.price * item.quantity).toLocaleString("en-IN")}
      </div>
    </div>
  );
}

export default CartItem;
