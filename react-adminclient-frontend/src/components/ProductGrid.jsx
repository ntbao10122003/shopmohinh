import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

export default function ProductGrid({ category }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = category 
          ? `http://localhost:5000/api/v1/products/category/${encodeURIComponent(category)}`
          : "http://localhost:5000/api/v1/products";
        const res = await fetch(url);
        const data = await res.json();
        setProducts(data.data || []);
      } catch (err) {
        console.log("❌ Error:", err);
      }
    };

    fetchProducts();
  }, [category]);

  return (
    <div className="site49_pro_col12_sanpham">
      <div className="container">
        <div className="item-title">
          <h2 className="title1">{category ? category : 'Sản phẩm tiêu biểu'}</h2>
        </div>

        <div className="item-list-sp">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              href={`/products/${p.id}`}
              image={p.images?.[0] || "/images/no-img.png"}
              title={p.name}
              price={p.price}
              priceDisplay={p.priceDisplay}
              priceOld={p.priceOld}
              priceOldDisplay={p.priceOldDisplay}
              category={p.category}
            />
          ))}

          {products.length === 0 && <p>Đang tải sản phẩm...</p>}
        </div>

        <a href="/products" className="butt butt_more butt_cl1">Xem thêm</a>
      </div>
    </div>
  );
}
