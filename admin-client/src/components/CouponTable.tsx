import React from 'react';
import type { Coupon } from './CouponForm';

type Props = {
  data: Coupon[];
  loading?: boolean;
  onEdit: (c: Coupon) => void;
  onDelete: (c: Coupon) => void;
};

function money(n?: number | null) {
  if (!n) return '0';
  return n.toLocaleString('vi-VN');
}
function statusBadge(c: Coupon) {
  const now = Date.now();
  const start = c.startsAt ? new Date(c.startsAt).getTime() : null;
  const end = c.endsAt ? new Date(c.endsAt).getTime() : null;

  const soonThreshold = 3 * 24 * 3600 * 1000; // 3 ngày

  if (!c.active) return <span className="px-2 py-1 rounded text-xs bg-gray-200 text-gray-700">Tắt</span>;
  if (start && now < start) return <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">Sắp bắt đầu</span>;
  if (end && now > end) return <span className="px-2 py-1 rounded text-xs bg-gray-300 text-gray-700">Hết hạn</span>;
  if (end && end - now <= soonThreshold) return <span className="px-2 py-1 rounded text-xs bg-amber-100 text-amber-700">Sắp hết hạn</span>;
  return <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Đang chạy</span>;
}

export default function CouponTable({ data, loading, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-auto border rounded-xl bg-white">
      <table className="min-w-[960px] w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-2">CODE</th>
            <th className="text-left p-2">Trạng thái</th>
            <th className="text-left p-2">Loại</th>
            <th className="text-right p-2">Giá trị</th>
            <th className="text-right p-2">Min Subtotal</th>
            <th className="text-right p-2">Max Discount</th>
            <th className="text-center p-2">Thời gian</th>
            <th className="text-right p-2">Lượt / Giới hạn</th>
            <th className="text-right p-2">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={9} className="p-4 text-center text-gray-500">Đang tải…</td></tr>
          )}
          {!loading && data.length === 0 && (
            <tr><td colSpan={9} className="p-4 text-center text-gray-500">Chưa có coupon</td></tr>
          )}
          {!loading && data.map(c => (
            <tr key={c._id} className="border-t">
              <td className="p-2 font-mono">{c.code}</td>
              <td className="p-2">{statusBadge(c)}</td>
              <td className="p-2">{c.discountType === 'percent' ? 'Phần trăm' : 'Số tiền'}</td>
              <td className="p-2 text-right">
                {c.discountType === 'percent' ? `${c.discountValue}%` : `${money(c.discountValue)} đ`}
              </td>
              <td className="p-2 text-right">{money(c.minSubtotal ?? 0)} đ</td>
              <td className="p-2 text-right">{money(c.maxDiscount ?? 0)} đ</td>
              <td className="p-2 text-center text-xs">
                {c.startsAt ? new Date(c.startsAt).toLocaleString('vi-VN') : '—'}<br />
                {c.endsAt ? new Date(c.endsAt).toLocaleString('vi-VN') : '—'}
              </td>
              <td className="p-2 text-right">
                {c.usedCount ?? 0} / {c.usageLimit ?? '∞'}
              </td>
              <td className="p-2 text-right">
                <button className="px-3 py-1 rounded border mr-2" onClick={() => onEdit(c)}>Sửa</button>
                <button
                  className="px-3 py-1 rounded border text-red-600"
                  onClick={() => {
                    if (confirm(`Xoá coupon ${c.code}?`)) onDelete(c);
                  }}
                >
                  Xoá
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
