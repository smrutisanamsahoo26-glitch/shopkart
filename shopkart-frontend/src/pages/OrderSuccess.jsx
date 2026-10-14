import { useNavigate, useParams } from "react-router-dom";

function OrderSuccess() {
  const navigate = useNavigate();

  const { id } = useParams();

  return (
    <div className="order-success">
      <div className="success-card">
        <div className="success-icon">✅</div>

        <h1>Order Placed Successfully!</h1>

        <p>Your payment has been verified and your order has been placed.</p>

        <div className="success-details">
          <p>
            <strong>Order ID:</strong>
          </p>

          <p>{id}</p>
        </div>

        <div className="success-actions">
          <button className="details-btn" onClick={() => navigate("/orders")}>
            View My Orders
          </button>

          <button
            className="continue-btn"
            onClick={() => navigate("/products")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
