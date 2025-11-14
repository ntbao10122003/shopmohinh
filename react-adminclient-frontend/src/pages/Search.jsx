import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* ===== Helpers ===== */
const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price || 0);

export default function Search() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(
    /\/+$/,
    ""
  );
  const imagesBase = `${window.location.origin}/images/site49`;

  // debounce khi gõ search
  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      if (!query) {
        setProducts([]);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${API_BASE}/api/v1/products/search`, {
          params: { q: query },
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        const data = res?.data?.data || [];
        setProducts(
          data.map((p) => ({
            ...p,
            images: Array.isArray(p.images) && p.images.length ? p.images : ["/placeholder-product.jpg"],
            priceDisplay: p.priceDisplay ?? formatPrice(p.price),
            priceOldDisplay: p.priceOldDisplay ?? (p.priceOld ? formatPrice(p.priceOld) : null),
          }))
        );
      } catch (err) {
        if (!axios.isCancel(err)) setError("Có lỗi khi tìm kiếm sản phẩm");
      } finally {
        setLoading(false);
      }
    }

    const timeout = setTimeout(fetchProducts, 300);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, API_BASE]);

  return (
    <div className="search-page" style={{ padding: "30px", minHeight: "80vh" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Tìm kiếm sản phẩm</h2>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="Nhập tên sản phẩm..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "12px 20px",
            fontSize: "16px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            outline: "none",
          }}
        />
      </div>

      {loading && <p style={{ textAlign: "center" }}>Đang tìm kiếm...</p>}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <div
        className="product-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="product-card"
            onClick={() => navigate(`/products/${p.id}`)}
            style={{
              background: "#fff",
              borderRadius: "15px",
              padding: "15px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
          >
            <div style={{ width: "100%", textAlign: "center", marginBottom: "10px" }}>
              <img
                src={p.images[0]}
                alt={p.name}
                style={{ maxWidth: "100%", borderRadius: "12px", height: "180px", objectFit: "cover" }}
              />
            </div>
            <h4 style={{ fontSize: "16px", marginBottom: "8px", fontWeight: "bold" }}>{p.name}</h4>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {p.priceOldDisplay && <span style={{ textDecoration: "line-through", color: "#888" }}>{p.priceOldDisplay} ₫</span>}
              <span style={{ color: "#336BFA", fontWeight: "bold" }}>{p.priceDisplay} ₫</span>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && query && !loading && (
        <p style={{ textAlign: "center", marginTop: "30px" }}>Không tìm thấy sản phẩm nào</p>
      )}
    </div>
  );
}