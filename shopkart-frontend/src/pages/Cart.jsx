import { useNavigate } from "react-router-dom";

import CartItem from "../components/CartItem";

import { useCart } from "../context/CartContext";

function Cart() {
  const navigate = useNavigate();

  const { cartItems, loading, error, subtotal, totalItems, fetchCart } =
    useCart();

  // ==============================================
  // LOADING
  // ==============================================

  if (loading) {
    return (
      <div className="state-message">
        <h2>Loading your cart...</h2>
      </div>
    );
  }

  // ==============================================
  // ERROR
  // ==============================================

  if (error) {
    return (
      <div className="state-message">
        <h2>Something went wrong.</h2>

        <p>Unable to load your cart.</p>

        <button className="details-btn" onClick={fetchCart}>
          Try Again
        </button>
      </div>
    );
  }

  // ==============================================
  // EMPTY CART
  // ==============================================

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-cart-icon">🛒</div>

        <h1>Your cart is empty 🛒</h1>

        <p>Looks like you haven't added anything yet.</p>

        <button className="details-btn" onClick={() => navigate("/products")}>
          Browse Products
        </button>
      </div>
    );
  }

  // ==============================================
  // CART
  // ==============================================

  return (
    <div className="cart-page">
      <div className="cart-header">
        <div>
          <h1>My Cart 🛒</h1>

          <p>
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </p>
        </div>

        <button className="continue-btn" onClick={() => navigate("/products")}>
          Continue Shopping
        </button>
      </div>

      <div className="cart-layout">
        {/* Cart Items */}

        <div className="cart-items">
          {cartItems.map((item) => (
            <CartItem key={item.product._id} item={item} />
          ))}
        </div>

        {/* Order Summary */}

        <div className="order-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Items</span>

            <span>{totalItems}</span>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>

            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>

          <hr />

          <div className="summary-total">
            <span>Total</span>

            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>

          <button
            className="checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
