import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import api from "../services/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        let url = "/products";

        const params = new URLSearchParams();

        if (search.trim() !== "") {
          params.append("search", search);
        }

        if (category !== "") {
          params.append("category", category);
        }

        if (params.toString() !== "") {
          url += `?${params.toString()}`;
        }

        console.log("Fetching:", url);

        const response = await api.get(url);

        console.log("Products response:", response.data);

        setProducts(response.data.products || []);
      } catch (error) {
        console.error("Products error:", error);

        setError("Something went wrong while loading products.");

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category]);

  return (
    <div className="products-page">
      <h1>ShopKart Products 🛒</h1>

      <SearchBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
      />

      {loading && (
        <div className="state-message">
          <h2>Loading products...</h2>
        </div>
      )}

      {!loading && error && (
        <div className="state-message error">
          <h2>{error}</h2>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="state-message">
          <h2>No products found.</h2>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;
