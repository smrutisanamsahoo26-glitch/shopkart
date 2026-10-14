import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";

function OrderDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/orders/${id}`);

        setOrder(response.data.order);
      } catch (error) {
        console.error("Order details error:", error);

        if (error.response?.status === 401) {
          navigate("/login");

          return;
        }

        setError(error.response?.data?.message || "Unable to load order.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="state-message">
        <h2>Loading order...</h2>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="state-message">
        <h2>Unable to load order</h2>

        <p>{error}</p>

        <button className="details-btn" onClick={() => navigate("/orders")}>
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="order-details-page">
      <div className="order-details-card">
        <div className="order-details-header">
          <div>
            <h1>Order Details</h1>

            <p>Order ID: {order._id}</p>
          </div>

          <span
            className={`order-status ${order.status
              .toLowerCase()
              .replace("_", "-")}`}
          >
            {order.status}
          </span>
        </div>

        <hr />

        <h2>Items</h2>

        {order.items.map((item, index) => (
          <div className="order-detail-item" key={index}>
            <div>
              <strong>{item.name}</strong>

              <p>
                ₹{item.price.toLocaleString("en-IN")}
                {" × "}
                {item.quantity}
              </p>
            </div>

            <strong>
              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
            </strong>
          </div>
        ))}

        <hr />

        <h2>Shipping Address</h2>

        <div className="shipping-details">
          <p>
            <strong>{order.shippingAddress.fullName}</strong>
          </p>

          <p>{order.shippingAddress.phone}</p>

          <p>{order.shippingAddress.addressLine1}</p>

          <p>
            {order.shippingAddress.city}, {order.shippingAddress.state}
          </p>

          <p>{order.shippingAddress.pincode}</p>
        </div>

        <hr />

        <div className="order-final-total">
          <span>Total</span>

          <strong>₹{order.totalAmount.toLocaleString("en-IN")}</strong>
        </div>

        <div className="payment-info">
          <p>Payment: {order.paymentStatus}</p>

          {order.razorpayPaymentId && (
            <p>Payment ID: {order.razorpayPaymentId}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
