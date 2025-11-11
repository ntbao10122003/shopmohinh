import React from "react";
import type { Order as OrderType } from "../services/order";

export type Order = OrderType;

function formatVND(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
    .format(n || 0)
    .replace("₫", "đ");
}
function formatDate(s: string) {
  return new Date(s).toLocaleString("vi-VN");
}

const StatusBadge: React.FC<{ status: Order["status"] }> = ({ status }) => {
  const map: Record<Order["status"], { text: string; className: string }> = {
    pending:   { text: "Chờ xử lý",   className: "status pill pending" },
    confirmed: { text: "Đã xác nhận", className: "status pill confirmed" },
    shipping:  { text: "Đang giao",   className: "status pill shipping" },
    completed: { text: "Hoàn thành",  className: "status pill completed" },
    cancelled: { text: "Đã hủy",      className: "status pill cancelled" },
  };
  const it = map[status];
  return <span className={it.className}>{it.text}</span>;
};

const OrderTable: React.FC<{
  data: Order[];
  onEdit?: (o: Order) => void;
  onDelete?: (id: string) => void;
}> = ({ data, onEdit, onDelete }) => {
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
      onDelete?.(id);
    }
  };

  return (
    <div className="table-scroller">
      <table className="orders-table">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Khách hàng</th>
            <th>Điện thoại</th>
            <th>Địa chỉ</th>
            <th>Ngày đặt</th>
            <th className="right">Tổng</th>
            <th>Trạng thái</th>
            <th>Thanh toán</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {data.map((o) => (
            <tr key={o._id}>
              <td className="mono">#{o.orderCode}</td>
              <td>{o.customer?.fullName || "N/A"}</td>
              <td className="mono">{o.customer?.phone || "N/A"}</td>
              <td className="ellipsis" title={o.customer?.address || "N/A"}>
                {o.customer?.address || "N/A"}
              </td>
              <td className="mono">{formatDate(o.createdAt)}</td>
              <td className="right strong">{formatVND(o.total)}</td>
              <td><StatusBadge status={o.status} /></td>
              <td>
                <span className={`pay pill ${o.paymentMethod === "cod" ? "cod" : "bank"}`}>
                  {o.paymentMethod === "cod" ? "COD" : "Chuyển khoản"}
                </span>
              </td>
              <td className="actions">
                <button
                  onClick={() => onEdit?.(o)}
                  className="btn btn-small btn-outline"
                  title="Cập nhật trạng thái"
                >
                  ✏️ Sửa
                </button>
                <button
                  onClick={(e) => handleDelete(e, o._id)}
                  className="btn btn-small btn-danger"
                  title="Xóa đơn hàng"
                >
                  🗑️ Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
