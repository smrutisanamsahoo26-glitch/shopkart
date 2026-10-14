import { useCallback, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../services/api";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==============================================
  // FETCH ORDERS
  // ==============================================

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const response = await api.get("/orders");

      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Orders error:", error);

      if (error.response?.status === 401) {
        navigate("/login");

        return;
      }

      setError("Unable to load your orders.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ==============================================
  // LOADING
  // ==============================================

  if (loading) {
    return (
      <div className="state-message">
        <h2>Loading your orders...</h2>
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

        <p>{error}</p>

        <button className="details-btn" onClick={fetchOrders}>
          Try Again
        </button>
      </div>
    );
  }

  // ==============================================
  // EMPTY
  // ==============================================

  if (orders.length === 0) {
    return (
      <div className="empty-orders">
        <div className="empty-orders-icon">📦</div>

        <h1>You have not placed any orders yet.</h1>

        <p>Your completed orders will appear here.</p>

        <button className="details-btn" onClick={() => navigate("/products")}>
          Start Shopping
        </button>
      </div>
    );
  }

  // ==============================================
  // ORDERS
  // ==============================================

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>My Orders 📦</h1>

        <p>
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </p>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <div className="order-card" key={order._id}>
            <div className="order-card-header">
              <div>
                <h2>Order #{order._id.slice(-8)}</h2>

                <p>
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <span
                className={`order-status ${order.status
                  .toLowerCase()
                  .replace("_", "-")}`}
              >
                {order.status}
              </span>
            </div>

            <div className="order-items">
              {order.items.map((item, index) => (
                <div className="order-item" key={index}>
                  <span>
                    {item.name}
                    {" × "}
                    {item.quantity}
                  </span>

                  <span>
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="order-card-footer">
              <strong>
                Total: ₹{order.totalAmount.toLocaleString("en-IN")}
              </strong>

              <button
                className="details-btn"
                onClick={() => navigate(`/orders/${order._id}`)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;
