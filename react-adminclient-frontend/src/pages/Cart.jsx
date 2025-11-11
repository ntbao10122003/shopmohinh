import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* ===== Helpers ===== */
const formatVND = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
    .format(n || 0)
    .replace("₫", "đ"); // theo thói quen hiển thị "đ"

function QuantityControl({ value, onChange, inputId }) {
  const dec = () => onChange(Math.max(1, Number(value) - 1));
  const inc = () => onChange(Number(value) + 1);
  const onInput = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    onChange(Math.max(1, Number(v || 1)));
  };
  return (
    <div className="custom custom-btn-numbers form-control">
      <button className="btn-minus btn-cts" type="button" onClick={dec}>-</button>
      <div className="input">
        <input
          className="title4"
          type="text"
          id={inputId}
          name="Quantity-item"
          size="4"
          value={value}
          onChange={onInput}
          inputMode="numeric"
        />
      </div>
      <button className="btn-plus btn-cts" type="button" onClick={inc}>+</button>
    </div>
  );
}

function CartItem({ item, onQtyChange, onRemove }) {
  const lineTotal = (item.price || 0) * (item.qty || 0);
  return (
    <div className="item-sp-cart wow fadeInLeft" data-wow-delay="0.3s">
      <div className="cart-sp">
        <div className="left">
          <div className="image">
            <img src={item.image} alt={item.name} />
          </div>
          <button
            type="button"
            className="item-close"
            aria-label={`Xoá ${item.name}`}
            onClick={() => onRemove(item.id)}
            title="Xoá"
            style={{ background: "transparent", border: 0, cursor: "pointer" }}
          >
            <span className="close">×</span>
          </button>
        </div>

        <div className="right">
          <a href="#" title={item.name} className="title4" onClick={(e)=>e.preventDefault()}>
            {item.name}
          </a>

          <QuantityControl
            value={item.qty}
            onChange={(v) => onQtyChange(item.id, v)}
            inputId={`qty-${item.id}`}
          />

          <div className="giaban">
            {item.compareAtPrice ? (
              <p className="title5 normal">{formatVND(item.compareAtPrice)}</p>
            ) : (
              <p className="title5 normal" style={{ opacity: 0 }}>&nbsp;</p>
            )}
            <p className="title3 sale" data-price={item.price}>{formatVND(item.price)}</p>
          </div>

          <div className="giaban" style={{ marginTop: 6 }}>
            <p className="title5">Tạm tính: {formatVND(lineTotal)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  // Cho phép cấu hình qua .env (Vite)
  const API_BASE = (import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/+$/, "");

  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({ items: [] });
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [msg, setMsg] = useState('');
  
  const navigate = useNavigate();

  // ====== Dữ liệu giỏ hàng ======
  const [items, setItems] = useState([]); // {id, name, image, price, compareAtPrice, qty}
  const [subTotal, setSubTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  // ====== Coupon ======
  const [couponMsg, setCouponMsg] = useState("");
  const [coupon, setCoupon] = useState("");
  const [clearing, setClearing] = useState(false);

  // ====== Thông tin KH & địa chỉ ======
  const [customer, setCustomer] = useState({
    gender: "male",
    fullName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    address: "",
    note: "",
    paymentMethod: 'cod'
  });
  
  // Hàm xử lý thay đổi input
  const setField = (field, value) => {
    setCustomer(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const provinces = [
    { value: "hn", label: "Hà Nội" },
    { value: "hcm", label: "TP.HCM" },
  ];
  const districts = [
    { value: "q1", label: "Quận 1" },
    { value: "qbd", label: "Quận Ba Đình" },
  ];
  const wards = [
    { value: "p1", label: "Phường 1" },
    { value: "p2", label: "Phường 2" },
  ];

  // ====== Headers builder (gửi kèm X-Cart-Token & Accept-Language) ======
  const buildHeaders = useCallback(() => {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    const cartToken = localStorage.getItem("cart_token");
    if (cartToken) headers["X-Cart-Token"] = cartToken;
    const lang = localStorage.getItem("lang") || "vi";
    headers["Accept-Language"] = lang;
    return headers;
  }, []);

  // ====== Map API cart -> UI state ======
  const inflateFromApi = useCallback((cartData) => {
    if (!cartData) return;
    
    console.log('API Cart data:', cartData); // Log dữ liệu từ API

    // Lưu cartToken mới (nếu có)
    if (cartData.cartToken) {
      localStorage.setItem("cart_token", cartData.cartToken);
    }

    // Map items
    const mapped = Array.isArray(cartData.items)
      ? cartData.items.map((it) => ({
          id: it.product,           // product id
          name: it.name,
          image: it.image,
          price: it.price,
          compareAtPrice: it.compareAtPrice || null,
          qty: it.quantity,
        }))
      : [];

    console.log('Mapped items:', mapped); // Log dữ liệu đã map

    // Cập nhật state items
    setItems(mapped);
    
    // Cập nhật state cart
    setCart({
      ...cartData,
      items: mapped
    });
    
    // Cập nhật các giá trị tính toán
    setSubTotal(cartData.subtotal ?? mapped.reduce((s, it) => s + it.price * it.qty, 0));
    setDiscount(cartData.discount ?? 0);
    setCartTotal(cartData.totalPayable ?? cartData.total ?? 0);
  }, []);

  // ====== Fetch cart khi vào trang ======
  const refetchCart = useCallback(async () => {
    const res = await axios.get(`${API_BASE}/api/v1/cart`, {
      headers: buildHeaders(),
      withCredentials: false, // dùng header token, KHÔNG dùng cookie
    });
    const cart = res?.data?.data;
    inflateFromApi(cart);
  }, [API_BASE, buildHeaders, inflateFromApi]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setMsg("");
        await refetchCart();
      } catch (err) {
        console.error("GET /cart error:", err);
        if (!mounted) return;
        setMsg(err?.response?.data?.message || "Không tải được giỏ hàng");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [refetchCart]);

  // ====== Update qty ======
  const onQtyChange = async (productId, qty) => {
    // Optimistic UI trước
    setItems((prev) => prev.map((it) => (it.id === productId ? { ...it, qty } : it)));
    try {
      const res = await axios.patch(
        `${API_BASE}/api/v1/cart/item`,
        { productId, quantity: qty },
        { headers: buildHeaders(), withCredentials: false }
      );
      const cart = res?.data?.data;
      inflateFromApi(cart);
    } catch (err) {
      console.error("PATCH /cart/item error:", err);
      setMsg(err?.response?.data?.message || "Không cập nhật được số lượng");
      // Revert nếu cần: refetch
      try { await refetchCart(); } catch {}
    }
  };

  // ====== Remove item ======
  const onRemove = async (productId) => {
    // Optimistic UI
    setItems((prev) => prev.filter((it) => it.id !== productId));
    try {
      const res = await axios.delete(
        `${API_BASE}/api/v1/cart/item`,
        {
          headers: buildHeaders(),
          data: { productId },       // axios DELETE muốn gửi body phải để trong 'data'
          withCredentials: false,
        }
      );
      const cart = res?.data?.data;
      inflateFromApi(cart);
    } catch (err) {
      console.error("DELETE /cart/item error:", err);
      setMsg(err?.response?.data?.message || "Không xoá được sản phẩm");
      // Revert nếu cần: refetch
      try { await refetchCart(); } catch {}
    }
  };

  /* ====== Coupon logic ====== */

  // Áp mã: kiểm tra chặn local
  const doApplyCoupon = useCallback(async (code) => {
    if (coupon) {
      setCouponMsg("Bạn đã áp dụng mã giảm giá. Vui lòng huỷ mã hiện tại trước khi áp dụng mã mới.");
      return;
    }
    const clean = (code || "").trim();
    if (!clean) {
      setCouponMsg("Vui lòng nhập mã.");
      return;
    }
    try {
      const res = await axios.post(
        `${API_BASE}/api/v1/cart/apply-coupon`,
        { code: clean },
        { headers: buildHeaders(), withCredentials: false }
      );
      inflateFromApi(res?.data?.data);
      setCoupon(clean);
      setCouponMsg(res?.data?.message || "Áp dụng mã thành công");
    } catch (err) {
      console.error("POST /cart/apply-coupon error:", err);
      setCouponMsg(err?.response?.data?.message || "Mã không hợp lệ.");
    }
  }, [API_BASE, buildHeaders, inflateFromApi]);

  const applyCoupon = async (e) => {
    e.preventDefault();
    await doApplyCoupon(coupon);
  };

  // Huỷ mã: Gọi API để xoá mã giảm giá
  const clearCoupon = async () => {
    if (!coupon) {
      setCouponMsg("Không có mã giảm giá nào để huỷ");
      return;
    }
    
    setClearing(true);
    try {
      // Gọi API để xoá mã giảm giá bằng cách gửi một mã không tồn tại
      // Điều này sẽ khiến server trả về lỗi và xoá mã khỏi giỏ hàng
      await axios.post(
        `${API_BASE}/api/v1/cart/apply-coupon`,
        { code: 'REMOVE_ME_' + Date.now() }, // Gửi một mã không tồn tại
        { headers: buildHeaders(), withCredentials: false }
      );
      
      // Nếu không có lỗi (điều này không nên xảy ra), chúng ta vẫn cần cập nhật lại giỏ hàng
      await refetchCart();
      
    } catch (error) {
      // Nếu lỗi là do mã không tồn tại (đúng như mong đợi), cập nhật lại giỏ hàng
      if (error.response?.status === 400) {
        await refetchCart();
        setCoupon("");
        setDiscount(0);
        setCouponMsg("Đã huỷ áp dụng mã giảm giá");
      } else {
        console.error("Lỗi khi huỷ mã giảm giá:", error);
        setCouponMsg(error?.response?.data?.message || "Có lỗi xảy ra khi huỷ mã giảm giá");
      }
    } finally {
      setClearing(false);
    }
  };

  const itemsCount = useMemo(() => items.reduce((s, it) => s + (it.qty || 0), 0), [items]);

  /* =========== FETCH & LIST COUPONS =========== */
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [couponError, setCouponError] = useState("");

  const humanDiscount = (c) => {
    if (!c) return "";
    if (c.discountType === "percent") {
      const cap = c.maxDiscount ? `, tối đa ${formatVND(c.maxDiscount)}` : "";
      return `Giảm ${c.discountValue}%${cap}`;
    }
    if (c.discountType === "amount") {
      return `Giảm ${formatVND(c.discountValue)}`;
    }
    return "Giảm giá";
  };

  const fmtDate = (s) => (s ? new Date(s).toLocaleString("vi-VN") : "");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingCoupons(true);
        setCouponError("");
        const res = await axios.get(`${API_BASE}/api/v1/admin/coupons`, {
          headers: buildHeaders(),
          withCredentials: false,
        });
        if (!alive) return;
        setCoupons(res?.data?.data || []);
      } catch (err) {
        console.error("GET /admin/coupons error:", err);
        if (!alive) return;
        setCouponError(err?.response?.data?.message || "Không tải được danh sách mã giảm giá");
      } finally {
        if (alive) setLoadingCoupons(false);
      }
    })();
    return () => { alive = false; };
  }, [API_BASE, buildHeaders]);

  // TODO: thay bằng logic category thực từ backend nếu cần.
  const itemsHasCategory = () => true;

  const canUseCoupon = (c) => {
    const now = Date.now();
    const start = c.startsAt ? new Date(c.startsAt).getTime() : null;
    const end = c.endsAt ? new Date(c.endsAt).getTime() : null;

    if (!c.active) return false;
    if (start && now < start) return false;
    if (end && now > end) return false;
    if (c.usageLimit && c.usedCount >= c.usageLimit) return false;
    if (c.minSubtotal && subTotal < c.minSubtotal) return false;

    if (Array.isArray(c.includeCategories) && c.includeCategories.length > 0) {
      const ok = c.includeCategories.some((cat) => itemsHasCategory(cat));
      if (!ok) return false;
    }
    return true;
  };

  // Hàm tính tổng tiền
  const calculateTotal = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.price * item.qty, 0) - discount,
    [cart.items, discount]
  );
  
  // Cập nhật tổng tiền khi có thay đổi
  useEffect(() => {
    setCartTotal(calculateTotal);
  }, [calculateTotal]);

  // Hàm xử lý thanh toán
  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      toast.warning('Giỏ hàng đang trống');
      return;
    }

    // Kiểm tra thông tin bắt buộc
    const requiredFields = ['fullName', 'phone', 'province', 'district', 'address'];
    const missingFields = requiredFields.filter(field => !customer[field]?.trim());
    
    if (missingFields.length > 0) {
      toast.error(`Vui lòng điền đầy đủ thông tin: ${missingFields.join(', ')}`);
      return;
    }

    setIsCheckingOut(true);
    try {
      // Lấy thông tin giỏ hàng hiện tại
      const cartResponse = await axios.get(`${API_BASE}/api/v1/cart`, {
        headers: buildHeaders()
      });
      const cartData = cartResponse.data.data;
      
      if (!cartData || cartData.items.length === 0) {
        throw new Error('Giỏ hàng đang trống');
      }

      // Gọi API đặt hàng với dữ liệu từ form
      const orderData = {
        cartToken: cartData.cartToken,
        fullName: customer.fullName,
        phone: customer.phone,
        province: customer.province,
        district: customer.district,
        address: customer.address,
        note: customer.note,
        paymentMethod: customer.paymentMethod || 'cod'
      };

      const orderResponse = await axios.post(
        `${API_BASE}/api/v1/cart/checkout`, 
        orderData,
        { headers: buildHeaders() }
      );

      if (orderResponse.data.success) {
        // Xóa giỏ hàng khỏi localStorage
        localStorage.removeItem('cart_token');
        
        // Reset state giỏ hàng
        setCart({ items: [] });
        setItems([]);
        setSubTotal(0);
        setDiscount(0);
        setCartTotal(0);
        
        // Chuyển hướng đến trang thành công
        navigate('/checkout/success', { 
          state: { 
            order: orderResponse.data.order,
            cartItems: cart.items // Lưu thông tin giỏ hàng để hiển thị
          } 
        });
      } else {
        throw new Error(orderResponse.data.message || 'Có lỗi xảy ra khi đặt hàng');
      }
      
    } catch (error) {
      console.error('Lỗi khi xử lý thanh toán:', error);
      toast.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xử lý thanh toán');
    } finally {
      setIsCheckingOut(false);
    }
  };

  /* =================== RENDER =================== */

  if (loading) {
    return (
      <div className="site49_cart_col9_giohang"><div className="container">
        <p className="title4" style={{ padding: 12 }}>Đang tải giỏ hàng...</p>
      </div></div>
    );
  }

  return (
    <div className="site49_cart_col9_giohang">
      <div className="container container_fix">
        <div className="item_product_giohang">
          <div className="site49_breadcrumb_col0_breadin breadcrumb">
            <a href="#" title="" onClick={(e)=>e.preventDefault()}>Trang chủ</a>
            <a href="#" title="" onClick={(e)=>e.preventDefault()}>Giỏ hàng</a>
          </div>

          <div className="item-title ">
            <h2 className="title1">Giỏ hàng</h2>
            {!!msg && <p className="title4" style={{ color: "#c00", marginTop: 8 }}>{msg}</p>}
          </div>

          <div className="item-list-sp-cart">
            <div className="title-list-cart">
              <div className="item-tensp"><h5 className="title4">Tên sản phẩm</h5></div>
              <div className="item-soluong"><h5 className="title4">Số lượng</h5></div>
              <div className="item-gia"><h5 className="title4">Giá</h5></div>
            </div>

            <div className="list-cart-sp">
              {items.length === 0 ? (
                <p className="title4" style={{ padding: 12 }}>Giỏ hàng trống.</p>
              ) : (
                items.map((it) => (
                  <CartItem
                    key={it.id}
                    item={it}
                    onQtyChange={onQtyChange}
                    onRemove={onRemove}
                  />
                ))
              )}
            </div>

            <div className="item_provisional">
              <h5 className="title3">Tạm tính ({itemsCount} sản phẩm):</h5>
              <p className="title2_1 sum_order">{formatVND(subTotal)}</p>
            </div>

          </div>
        </div>

        {/* Thông tin KH */}
        <div className="item_customer_information">
          <h3 className="title2_2">Thông tin khách hàng</h3>

          <div className="item_product_information">
            <form onSubmit={(e)=>e.preventDefault()}>
              <input
                className="title4"
                type="text"
                placeholder="Họ - Tên"
                value={customer.fullName}
                onChange={(e) => setField('fullName', e.target.value)}
                required
              />
              <input
                className="title4"
                type="text"
                placeholder="Số điện thoại"
                value={customer.phone}
                onChange={(e) => setField('phone', e.target.value)}
                required
              />
            </form>
          </div>

          <div className="item_to_receive_goods">
            <div className="Choose-address">
              <form onSubmit={(e)=>e.preventDefault()}>
                <select value={customer.province} onChange={(e)=>setField("province", e.target.value)}>
                  <option value="">Tỉnh/Thành</option>
                  {provinces.map((p)=>(<option key={p.value} value={p.value}>{p.label}</option>))}
                </select>

                <select value={customer.district} onChange={(e)=>setField("district", e.target.value)}>
                  <option value="">Quận/Huyện</option>
                  {districts.map((d)=>(<option key={d.value} value={d.value}>{d.label}</option>))}
                </select>

                <select value={customer.ward} onChange={(e)=>setField("ward", e.target.value)}>
                  <option value="">Xã/Phường</option>
                  {wards.map((w)=>(<option key={w.value} value={w.value}>{w.label}</option>))}
                </select>

                <input
                  className="title4"
                  type="text"
                  placeholder="Thôn/Xóm/Số nhà"
                  value={customer.address}
                  onChange={(e)=>setField("address", e.target.value)}
                />

                <a href="#" title="" onClick={(e)=>e.preventDefault()} className="title4">
                  Miễn phí giao hàng
                </a>
              </form>
            </div>

            <input
              className="title4"
              type="text"
              placeholder="Yêu cầu khác (Không bắt buộc)"
              value={customer.note}
              onChange={(e)=>setField("note", e.target.value)}
            />
          </div>
        </div>

        {/* Tổng tiền & coupon */}
        <div className="item-total-amount">
          <div className="item-total-top ">
            <div className="deal-item title4">Dùng mã giảm giá</div>
            <form onSubmit={applyCoupon}>
              <div className="item-deal-input">
                <input
                  className="title4"
                  type="text"
                  placeholder="Nhập mã giảm giá"
                  value={coupon}
                  onChange={(e)=>setCoupon(e.target.value)}
                  disabled={!!coupon}
                />
                <button className="title4" type="submit" disabled={!!coupon}>
                  {coupon ? 'Đã áp dụng' : 'Áp dụng'}
                </button>
                {(discount > 0 || !!coupon) && (
                  <button
                    type="button"
                    className="title4"
                    onClick={clearCoupon}
                    disabled={clearing}
                    style={{ marginLeft: 8 }}
                    title="Huỷ mã giảm giá hiện tại"
                  >
                    {clearing ? "Đang huỷ..." : "Huỷ mã"}
                  </button>
                )}
              </div>
            </form>
            {!!couponMsg && <p className="title4" style={{ marginTop: 6 }}>{couponMsg}</p>}

            {/* ====== DANH SÁCH MÃ GIẢM GIÁ ====== */}
            <div style={{ marginTop: 10 }}>
              <h4 className="title4" style={{ marginBottom: 6 }}>Các mã hiện có:</h4>

              {loadingCoupons && <p className="title4">Đang tải mã…</p>}
              {!!couponError && <p className="title4" style={{ color: "#c00" }}>{couponError}</p>}

              {!loadingCoupons && !couponError && coupons.length === 0 && (
                <p className="title4">Chưa có mã nào.</p>
              )}

              {!loadingCoupons && !couponError && coupons.length > 0 && (
                <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0, display: "grid", gap: 8 }}>
                  {coupons.map((c) => {
                    const now = Date.now();
                    const start = c.startsAt ? new Date(c.startsAt).getTime() : null;
                    const end   = c.endsAt   ? new Date(c.endsAt).getTime()   : null;

                    const status = !c.active
                      ? { label: "Ngừng hoạt động", color: "#999" }
                      : (start && now < start)
                      ? { label: "Chưa bắt đầu", color: "#888" }
                      : (end && now > end)
                      ? { label: "Hết hạn", color: "#c00" }
                      : (c.usageLimit && c.usedCount >= c.usageLimit)
                      ? { label: "Hết lượt", color: "#c00" }
                      : { label: "Đang áp dụng", color: "#1a7f37" };

                    const usable = (() => {
                      if (!c.active) return false;
                      if (start && now < start) return false;
                      if (end && now > end) return false;
                      if (c.usageLimit && c.usedCount >= c.usageLimit) return false;
                      if (c.minSubtotal && subTotal < c.minSubtotal) return false;
                      if (Array.isArray(c.includeCategories) && c.includeCategories.length > 0) {
                        const ok = c.includeCategories.some((cat) => true); // demo
                        if (!ok) return false;
                      }
                      return true;
                    })();

                    const disabledByBlock = !usable;

                    return (
                      <li
                        key={c._id}
                        style={{
                          border: "1px solid #eee",
                          borderRadius: 8,
                          padding: 10,
                          display: "grid",
                          gap: 4,
                          background: !disabledByBlock ? "#f9fffa" : "#fafafa",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <strong className="title4" style={{ fontSize: 16 }}>{c.code}</strong>
                          <span
                            className="title5"
                            style={{ padding: "2px 6px", borderRadius: 6, background: "#f1f1f1" }}
                          >
                            {c.discountType === "percent"
                              ? `Giảm ${c.discountValue}%${c.maxDiscount ? `, tối đa ${formatVND(c.maxDiscount)}` : ""}`
                              : c.discountType === "amount"
                              ? `Giảm ${formatVND(c.discountValue)}`
                              : "Giảm giá"}
                          </span>
                          <span className="title5" style={{ color: status.color }}>{status.label}</span>
                        </div>

                        <div className="title5" style={{ opacity: 0.9 }}>
                          Hiệu lực: {fmtDate(c.startsAt)} → {fmtDate(c.endsAt) || "không giới hạn"}
                        </div>

                        <div className="title5" style={{ opacity: 0.9 }}>
                          Tối thiểu đơn: {c.minSubtotal ? formatVND(c.minSubtotal) : "—"} | Lượt dùng: {c.usedCount}/{c.usageLimit || "∞"}
                        </div>

                        <div style={{ marginTop: 6 }}>
                          <button
                            type="button"
                            className="title4"
                            onClick={() => doApplyCoupon(c.code)}
                            disabled={disabledByBlock}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 6,
                              background: "#f0f0f0",
                              border: "1px solid #ddd",
                              cursor: disabledByBlock ? "not-allowed" : "pointer",
                              opacity: disabledByBlock ? 0.6 : 1,
                            }}
                            title={
                              usable
                                ? "Áp dụng mã này"
                                : c.usageLimit && c.usedCount >= c.usageLimit
                                ? "Mã đã hết số lần sử dụng"
                                : c.minSubtotal > subTotal
                                ? `Đơn hàng tối thiểu ${formatVND(c.minSubtotal)}`
                                : "Không thể áp dụng mã này"
                            }
                          >
                            {usable ? "Áp dụng" : "Không thể áp dụng"}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            {/* End of coupon list */}

            {discount > 0 && (
              <p className="title4" style={{ marginTop: 6, color: '#1a7f37' }}>
                Giảm giá: <strong>{formatVND(discount)}</strong>
              </p>
            )}
          </div>

          <div className="item-total-bott ">
            <div className="total">
              <div className="total">
                <p>Tổng tiền:</p>
                <p className="price">{formatVND(cartTotal > 0 ? cartTotal : 0)}</p>
              </div>
              <button 
                className="btn-checkout" 
                onClick={handleCheckout}
                disabled={isCheckingOut || cart.items.length === 0}
                style={{
                  opacity: (isCheckingOut || cart.items.length === 0) ? 0.6 : 1,
                  cursor: (isCheckingOut || cart.items.length === 0) ? 'not-allowed' : 'pointer'
                }}
              >
                {isCheckingOut ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
              {(isCheckingOut || cart.items.length === 0) && (
                <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                  {isCheckingOut ? 'Đang xử lý...' : 'Giỏ hàng đang trống'}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* /Tổng tiền & coupon */}
      </div>
    </div>
  );
}

/* ================== helpers ================== */
function fmtDate(s) {
  if (!s) return "";
  return new Date(s).toLocaleString("vi-VN");
}
