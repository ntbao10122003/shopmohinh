import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ProductGrid from "../components/ProductGrid";
import axios from "axios";

/* ===== Helpers ===== */
const is24Hex = (s) => /^[0-9a-f]{24}$/i.test(String(s || "").trim());
function getSaleBadge(p) {
  if (!p) return null;
  const isOnSale = p.priceOldDisplay && p.priceOld > p.price;
  if (!isOnSale) return null;
  const oldP = Number(p.price || 0);
  const oldOldP = Number(p.priceOld || 0);
  if (!oldOldP || !oldP || oldOldP <= oldP) return "Giảm";
  const percent = Math.round(((oldOldP - oldP) / oldOldP) * 100);
  return `- ${percent}%`;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  // Cho phép cấu hình qua .env (Vite)
  const API_BASE = (import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5000").replace(
    /\/+$/,
    ""
  );

  // Base ảnh tĩnh (icon…) nằm trong /public/images/site49
  const imagesBase = `${window.location.origin}/images/site49`;

  // Helper: ghép headers mặc định khi gọi API (nếu có cart_token thì gửi kèm)
  const buildHeaders = () => {
    const h = { Accept: "application/json", "Content-Type": "application/json" };
    const cartToken = localStorage.getItem("cart_token");
    if (cartToken) h["X-Cart-Token"] = cartToken;
    // Nếu bạn dùng đa ngôn ngữ:
    const lang = localStorage.getItem("lang") || "vi";
    h["Accept-Language"] = lang;
    return h;
  };

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProduct() {
      const cleanId = String(id || "").trim();

      if (!cleanId) {
        setError("Không tìm thấy ID sản phẩm");
        setLoading(false);
        return;
      }
      if (!is24Hex(cleanId)) {
        setError(`ID không hợp lệ: "${cleanId}"`);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(
          `${API_BASE}/api/v1/products/${encodeURIComponent(cleanId)}`,
          { signal: controller.signal, headers: buildHeaders() }
        );

        const d = res?.data?.data; // theo mẫu: { data: { ... } }
        if (!d?.id) throw new Error("Dữ liệu sản phẩm không hợp lệ");

        setProduct({
          ...d,
          priceDisplay: d.priceDisplay ?? "0",
          priceOldDisplay: d.priceOldDisplay ?? null,
          images:
            Array.isArray(d.images) && d.images.length
              ? d.images
              : ["/placeholder-product.jpg"],
        });

        // reset qty khi đổi sản phẩm
        setQty(1);
      } catch (err) {
        if (axios.isCancel?.(err)) return;
        setError(
          err?.response?.data?.message || err?.message || "Có lỗi khi tải sản phẩm"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, API_BASE]);

  // Tính toán nhẹ
  const saleBadge = getSaleBadge(product);
  const mainImg = product?.images?.[0];

  // Handlers số lượng
  const dec = () => setQty((prev) => Math.max(1, prev - 1));
  const inc = () => setQty((prev) => Math.min(product?.quantity || 10, prev + 1));

  // === GỌI API ADD TO CART ===
// === GỌI API ADD TO CART ===
const addToCart = async ({ productId, quantity }) => {
  const url = `${API_BASE}/api/v1/cart/add`;
  const payload = { productId, quantity };

  // Lấy cartToken từ localStorage (nếu có)
  const existingCartToken = localStorage.getItem("cart_token");

  // Header mặc định
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Gửi kèm cartToken nếu có
  if (existingCartToken) {
    headers["X-Cart-Token"] = existingCartToken;
  }

  // Ngôn ngữ (nếu dùng đa ngôn ngữ)
  const lang = localStorage.getItem("lang") || "vi";
  headers["Accept-Language"] = lang;

  try {
    // Gửi request
    const res = await axios.post(url, payload, {
      headers,
      withCredentials: false, // ❗ nếu server KHÔNG dùng cookie, giữ false
    });

    // Nếu server trả về cartToken mới thì lưu lại
    const newToken = res?.data?.cartToken;
    if (newToken) {
      localStorage.setItem("cart_token", newToken);
      console.log("🛒 Cart token updated:", newToken);
    }

    return res;
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    throw error;
  }
};



  async function handleAddToCart(e) {
    e.preventDefault();
    if (!product?.id) return;

    try {
      setAdding(true);
      setMessage("");

      const res = await addToCart({ productId: product.id, quantity: qty });
      setMessage(res?.data?.message || "Đã thêm vào giỏ hàng thành công!");
      console.log("Cart add response:", res.data);
      navigate("/cart");
    } catch (err) {
      console.error("Add to cart error:", err);
      setMessage(err?.response?.data?.message || "Không thể thêm vào giỏ hàng");
    } finally {
      setAdding(false);
    }
  }

  // Mua ngay: thêm vào giỏ hàng rồi điều hướng sang checkout
  async function handleBuyNow(e) {
    e.preventDefault();
    if (!product?.id) return;

    try {
      setAdding(true);
      setMessage("");

      await addToCart({ productId: product.id, quantity: qty });
      navigate("/checkout"); // điều hướng trang thanh toán
    } catch (err) {
      console.error("Buy now (add first) error:", err);
      setMessage(err?.response?.data?.message || "Không thể thực hiện mua ngay");
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Thử lại
        </button>
      </div>
    );
  }

  if (!product) {
    return <div className="not-found">Không tìm thấy thông tin sản phẩm</div>;
  }

  const breadcrumb = [
    { name: "Trang chủ", path: "/home" },
    { name: "Sản phẩm", path: "/products" },
    {
      name: product.category || "Danh mục",
      path: `/category/${(product.category || "").toLowerCase()}`,
    },
    { name: product.name, path: "#" },
  ];

  return (
    <div className="site49_prodel_col12_chitietsanpham">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          {breadcrumb.map((b, i) => (
            <a
              key={i}
              href={b.path}
              title={b.name}
              aria-current={i === breadcrumb.length - 1 ? "page" : undefined}
            >
              {b.name}
            </a>
          ))}
        </div>

        <div className="item_Information">
          <div className="column small-11 small-centered">
            <div className="slider_main_single">
              <div className="img_single video">
                <img src={mainImg} alt={product.name} loading="lazy" decoding="async" />
              </div>
              <span className="pagingInfo">
                {product.images.length}/{product.images.length}
              </span>
            </div>

            <div className="interact">
              <div className="share_sp title4">
                Chia sẻ:
                <ul>
                  <li>
                    <a href="#" title="Chia sẻ 1">
                      <img src={`${imagesBase}/tc1.png`} alt="Chia sẻ 1" />
                    </a>
                  </li>
                  <li>
                    <a href="#" title="Chia sẻ 2">
                      <img src={`${imagesBase}/tc2.png`} alt="Chia sẻ 2" />
                    </a>
                  </li>
                  <li>
                    <a href="#" title="Chia sẻ 3">
                      <img src={`${imagesBase}/tc3.png`} alt="Chia sẻ 3" />
                    </a>
                  </li>
                  <li>
                    <a href="#" title="Chia sẻ 4">
                      <img src={`${imagesBase}/tc4.png`} alt="Chia sẻ 4" />
                    </a>
                  </li>
                </ul>
              </div>
              <div className="favorite title4">
                <img src={`${imagesBase}/favorite.png`} alt="Yêu thích" />
                Đã thích (1,4k)
              </div>
            </div>
          </div>

          <div className="detail">
            <h1 className="title2_3">{product.name}</h1>

            <div className="detail_item_top">
              <div className="item-options">
                <div className="options buysty">
                  {/* icon giữ nguyên */}
                  <svg
                    className="icon"
                    width="16"
                    height="13"
                    viewBox="0 0 16 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M9.77544 12.8184C10.1991 12.8184 10.6054 12.6501 10.905 12.3505C11.2046 12.0509 11.3729 11.6446 11.3729 11.221C11.3729 10.7973 11.2046 10.391 10.905 10.0914C10.6054 9.79179 10.1991 9.62348 9.77544 9.62349C9.35177 9.62348 8.94544 9.79179 8.64586 10.0914C8.34628 10.391 8.17797 10.7973 8.17797 11.221C8.17797 11.6446 8.34628 12.0509 8.64586 12.3505C8.94544 12.6501 9.35177 12.8184 9.77544 12.8184ZM4.18431 12.8184C4.60798 12.8184 5.01431 12.6501 5.31389 12.3505C5.61347 12.0509 5.78178 11.6446 5.78178 11.221C5.78178 10.7973 5.61347 10.391 5.31389 10.0914C5.01431 9.79179 4.60798 9.62348 4.18431 9.62349C3.76064 9.62348 3.35432 9.79179 3.05473 10.0914C2.75515 10.391 2.58685 10.7973 2.58685 11.221C2.58685 11.6446 2.75515 12.0509 3.05473 12.3505C3.35432 12.6501 3.76064 12.8184 4.18431 12.8184ZM14.5982 1.57466C14.7976 1.56823 14.9867 1.4845 15.1254 1.34118C15.2642 1.19785 15.3418 1.00618 15.3418 0.806678C15.3418 0.60718 15.2642 0.415502 15.1254 0.27218C14.9867 0.128857 14.7976 0.0451275 14.5982 0.0386963H13.6788C12.9584 0.0386963 12.3354 0.538703 12.1788 1.24159L11.178 5.74804C11.0215 6.45092 10.3985 6.95093 9.67799 6.95093H3.67791L2.52614 2.34224H9.9903C10.1878 2.33323 10.3743 2.24842 10.5108 2.10546C10.6474 1.9625 10.7237 1.77238 10.7237 1.57466C10.7237 1.37694 10.6474 1.18682 10.5108 1.04386C10.3743 0.900897 10.1878 0.81609 9.9903 0.807077H2.52614C2.29265 0.807008 2.06221 0.860175 1.85234 0.962537C1.64248 1.0649 1.45872 1.21376 1.31502 1.39781C1.17133 1.58185 1.07149 1.79624 1.02309 2.02466C0.974686 2.25309 0.979003 2.48954 1.03571 2.71605L2.18748 7.32314C2.27051 7.65556 2.46231 7.95069 2.73238 8.16156C3.00245 8.37243 3.33527 8.48695 3.67791 8.48689H9.67799C10.377 8.48698 11.0552 8.24865 11.6005 7.81124C12.1458 7.37384 12.5256 6.76353 12.6772 6.08111L13.6788 1.57466H14.5982Z"
                      fill="#298CCF"
                    />
                  </svg>
                  <span className="title5">Mã SP: {product.sku || "—"}</span>
                </div>
              </div>

              <div className="item-price-sale">
                <div className="price">
                  {!!product.priceOldDisplay && (
                    <span className="cost title4">{product.priceOldDisplay} ₫</span>
                  )}
                  <h4 className="title1_4">{product.priceDisplay} ₫</h4>
                  {saleBadge && <div className="sale title5">{saleBadge}</div>}
                </div>
                <p className="title5">Giá tốt so với các sản phẩm trên thị trường</p>
              </div>

              <p className="title4 Description">
                <span>Mô tả: </span>
                <span style={{ whiteSpace: "pre-wrap" }}>{product.description}</span>
              </p>
            </div>

            <div className="item_type_select_mobile">
              <a title="Chọn loại hàng" id="btn_type_select" className="title4" href="#">
                Chọn loại hàng (màu sắc, kích cỡ...)
              </a>
            </div>

            <div className="Transport">
              <p className="title4 IW_UG">Vận Chuyển:</p>
              <ul>
                <li className="title4 freeship">Miễn phí vận chuyển</li>
                <li className="title5">
                  Miễn phí vận chuyển cho đơn hàng trên ₫50.000
                </li>
              </ul>
            </div>

            <div className="item-justify">
              <div className="quantity">
                <h4 className="title4 IW_UG">Số lượng</h4>
                <div className="custom custom-btn-numbers form-control">
                  <button
                    className="btn-minus btn-cts"
                    type="button"
                    onClick={dec}
                    aria-label="Giảm số lượng"
                  >
                    -
                  </button>
                  <div className="input">
                    <input
                      className="title4"
                      type="text"
                      id="qty"
                      name="quantity"
                      inputMode="numeric"
                      value={qty}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "");
                        const n =
                          v === ""
                            ? 1
                            : Math.max(1, Math.min(Number(v), product.quantity || 9999));
                        setQty(n);
                      }}
                    />
                  </div>
                  <button
                    className="btn-plus btn-cts"
                    type="button"
                    onClick={inc}
                    aria-label="Tăng số lượng"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="title5">{product.quantity} sản phẩm có sẵn</p>
            </div>

            <div className="item-buy">
              <a
                href="#"
                title="Thêm vào giỏ hàng"
                className={`butt add_cart title4 ${adding ? "disabled" : ""}`}
                onClick={handleAddToCart}
                aria-disabled={adding ? "true" : "false"}
              >
                {adding ? "Đang thêm..." : "Thêm vào giỏ hàng"}
              </a>

              <a
                title="Mua ngay"
                className={`butt buys title4 ${adding ? "disabled" : ""}`}
                id="btn_kiemtradonhang"
                href="#"
                onClick={handleBuyNow}
                aria-disabled={adding ? "true" : "false"}
              >
                Mua ngay
              </a>
            </div>

            {!!message && <p className="cart-message title4">{message}</p>}

            <div className="reafun title4">
              <img src={`${imagesBase}/reafun.png`} alt="Đảm bảo hoàn tiền" />
              Shoping 365 đảm bảo 3 ngày trả hàng/Hoàn tiền
            </div>
          </div>
        </div>
      </div>

      <ProductGrid category={product.category} />
    </div>
  );
}
