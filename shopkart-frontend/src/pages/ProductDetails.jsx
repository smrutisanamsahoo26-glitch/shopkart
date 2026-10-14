import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/products/${id}`);

        console.log("Product details:", response.data);

        setProduct(response.data.product);
      } catch (error) {
        console.error("Product details error:", error);

        setError("Something went wrong while loading the product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="state-message">
        <h2>Loading product...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-message error">
        <h2>{error}</h2>

        <button onClick={() => navigate("/products")}>Back to Products</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="state-message">
        <h2>Product not found.</h2>

        <button onClick={() => navigate("/products")}>Back to Products</button>
      </div>
    );
  }

  return (
    <div className="product-details">
      <button className="back-btn" onClick={() => navigate("/products")}>
        ← Back to Products
      </button>

      <div className="details-card">
        <img src={product.image} alt={product.name} className="details-image" />

        <div className="details-info">
          <p className="product-category">{product.category}</p>

          <h1>{product.name}</h1>

          <p className="details-description">{product.description}</p>

          <h2 className="details-price">
            ₹{product.price.toLocaleString("en-IN")}
          </h2>

          <p>
            <strong>Stock:</strong>{" "}
            {product.stock > 0
              ? `${product.stock} units available`
              : "Out of Stock"}
          </p>

          <button
            className="cart-btn"
            disabled={product.stock === 0}
            onClick={() => alert("Cart functionality coming in Lab 04!")}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
