import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Home() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await api.get("/customers/me");

        console.log("Customer response:", response.data);

        // Adjust according to your backend response
        setCustomer(response.data.customer || response.data);
      } catch (error) {
        console.error("Home error:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [navigate]);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!customer) {
    return null;
  }

  return (
    <>
      <div className="home-container">
        <div className="welcome-card">
          <h1>Welcome to ShopKart 🛒</h1>

          <h2>Hello, {customer.fullName || customer.name}!</h2>

          <div className="customer-details">
            <p>
              <strong>Email:</strong> {customer.email}
            </p>

            <p>
              <strong>Phone:</strong> {customer.phone}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
