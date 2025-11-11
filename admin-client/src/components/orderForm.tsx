import React from "react";
import type { Order } from "../services/order";

type Props = {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onSubmit: (payload: Partial<Order>) => void;
};

const orderStatusOptions: Array<{ value: Order["status"]; label: string }> = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "shipping", label: "Đang giao hàng" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

const OrderForm: React.FC<Props> = ({ open, order, onClose, onSubmit }) => {
  const [status, setStatus] = React.useState<Order["status"]>(order?.status ?? "pending");
  const [note, setNote] = React.useState<string>("");

  React.useEffect(() => {
    setStatus(order?.status ?? "pending");
    setNote("");
  }, [order]);

  if (!open) return null;

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-card glass">
        <div className="modal-hd">
          <strong>Cập nhật đơn #{order?.orderCode}</strong>
          <button onClick={onClose} aria-label="Đóng" className="btn btn-ghost">✖</button>
        </div>
        <div className="modal-bd">
          <label className="lbl">
            Trạng thái
            <select
              className="select"
              value={status}
              onChange={(e) => setStatus(e.target.value as Order["status"])}
            >
              {orderStatusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
          <label className="lbl">
            Ghi chú (tuỳ chọn)
            <input
              className="ipt"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú nội bộ / lý do…"
            />
          </label>
        </div>
        <div className="modal-ft">
          <button onClick={onClose} className="btn btn-ghost">Huỷ</button>
          <button
            onClick={() => onSubmit({ status /*, note */ } as any)}
            className="btn btn-primary"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
