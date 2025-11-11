import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import OrderForm from "../components/orderForm";
import OrderTable from "../components/orderTable";
import type { Order } from "../services/order";
import "../assets/order.css";

const API_BASE = ""; // ví dụ: 'http://localhost:5000'
const ORDERS_ENDPOINT = `${API_BASE}/api/v1/orders`;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // filter/search/pagination
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | Order["status"]>("all");
  const [page, setPage] = useState(0); // zero-based
  const [limit, setLimit] = useState(10);

  // edit form
  const [openForm, setOpenForm] = useState(false);
  const [current, setCurrent] = useState<Order | null>(null);

  const pageInfoText = useMemo(() => {
    if (!total) return "—";
    const start = page * limit + 1;
    const end = Math.min((page + 1) * limit, total);
    return `Hiển thị ${start} - ${end} trong ${total}`;
  }, [page, limit, total]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const params: Record<string, any> = {
        page: page + 1,
        limit,
        sort: "-createdAt",
      };
      if (q.trim()) params.search = q.trim();
      if (status !== "all") params.status = status;

      const res = await axios.get(ORDERS_ENDPOINT, { params });
      setOrders(res.data?.data?.orders ?? []);
      setTotal(res.data?.pagination?.total ?? res.data?.results ?? 0);
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message || "Lỗi tải danh sách đơn hàng");
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, status]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleOpenEdit = (order: Order) => {
    setCurrent(order);
    setOpenForm(true);
  };

  const handleSubmitEdit = async (payload: Partial<Order>) => {
    if (!current) return;
    try {
      await axios.patch(`${ORDERS_ENDPOINT}/${current._id}`, payload);
      setOpenForm(false);
      setCurrent(null);
      fetchOrders(); // refresh
    } catch (e: any) {
      alert(e?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await axios.delete(`${ORDERS_ENDPOINT}/${id}`);
      fetchOrders();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Xóa đơn hàng thất bại");
    }
  };

  return (
    <div className="orders-page dark-slate">
      <div className="orders-header glass">
        <div className="headline">
          <h1>Đơn hàng</h1>
          <span className="sub">Quản lý & theo dõi trạng thái theo thời gian thực</span>
        </div>

        <div className="tools">
          <form
            className="search"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(0);
              fetchOrders();
            }}
          >
            <div className="ipt-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-4.3-4.3m1.1-4.8a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo mã/khách hàng/điện thoại…"
              />
            </div>
            <button type="submit" className="btn btn-primary">Tìm</button>
          </form>

          <div className="filters">
            <select
              className="select"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as any);
                setPage(0);
              }}
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ xử lý</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="shipping">Đang giao hàng</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>

            <button type="button" className="btn btn-ghost" onClick={() => fetchOrders()} title="Làm mới">
              <span className="spinable">⟳</span> Làm mới
            </button>
          </div>
        </div>
      </div>

      <div className="table-wrap glass">
        {loading && orders.length === 0 ? (
          <div className="loading">
            <span className="dot" /><span className="dot" /><span className="dot" />
            Đang tải đơn hàng…
          </div>
        ) : errorMsg ? (
          <div className="error">{errorMsg}</div>
        ) : orders.length === 0 ? (
          <div className="empty">Không có đơn hàng</div>
        ) : (
          <OrderTable
            data={orders}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteOrder}
          />
        )}
      </div>

      <div className="pagination glass">
        <div className="info">{pageInfoText}</div>
        <div className="controls">
          <button
            className="btn btn-ghost"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            ← Trước
          </button>
          <span className="page-tag">Trang {page + 1}</span>
          <button
            className="btn btn-ghost"
            disabled={(page + 1) * limit >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau →
          </button>
        </div>
        <div className="rows">
          <span>Hiển thị</span>
          <select
            className="select compact"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(0);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
          <span>dòng</span>
        </div>
      </div>
    </div>
  );
}

