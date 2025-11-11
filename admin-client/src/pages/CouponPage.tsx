import React, { useEffect, useMemo, useState } from 'react';

import CouponTable from '../components/CouponTable';
import CouponForm from '../components/CouponForm';
import type { Coupon } from '../components/CouponForm';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1';

export default function CouponPage() {
  const [list, setList] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'true' | 'false'>('all');
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryParams = useMemo(() => {
    const p = new URLSearchParams();
    if (query.trim()) p.set('q', query.trim());
    if (activeFilter !== 'all') p.set('active', activeFilter);
    return p.toString();
  }, [query, activeFilter]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/coupons?${queryParams}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Không tải được danh sách');
      setList(json.data);
    } catch (err: any) {
      setError(err.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  async function handleDelete(c: Coupon) {
    try {
      const res = await fetch(`${API_BASE}/admin/coupons/${c._id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Xoá thất bại');
      await load();
    } catch (err: any) {
      alert(err.message || 'Lỗi xoá');
    }
  }

  function handleSaved(_: Coupon) {
    setEditing(null);
    load();
  }

  function exportCSV() {
    const headers = [
      'code',
      'discountType',
      'discountValue',
      'minSubtotal',
      'maxDiscount',
      'startsAt',
      'endsAt',
      'usageLimit',
      'usedCount',
      'active',
      'note',
    ];
    const rows = list.map(c => [
      c.code,
      c.discountType,
      c.discountValue,
      c.minSubtotal ?? '',
      c.maxDiscount ?? '',
      c.startsAt ?? '',
      c.endsAt ?? '',
      c.usageLimit ?? '',
      c.usedCount ?? '',
      c.active ? 'true' : 'false',
      (c.note ?? '').replace(/\n/g, ' '),
    ]);

    const csv = [headers, ...rows].map(r =>
      r.map(v => {
        const s = String(v ?? '');
        // CSV escape
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      }).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coupons_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Quản lý mã giảm giá</h2>
        <div className="flex gap-2">
          {!editing && (
            <button
              className="px-4 py-2 rounded bg-black text-white"
              onClick={() => setEditing({ code: '', discountType: 'percent', discountValue: 10, minSubtotal: 200000, active: true })}
            >
              + Tạo mã
            </button>
          )}
          <button className="px-4 py-2 rounded border" onClick={exportCSV}>Export CSV</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          className="border rounded p-2 w-64"
          placeholder="Tìm CODE…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <select
          className="border rounded p-2"
          value={activeFilter}
          onChange={e => setActiveFilter(e.target.value as any)}
        >
          <option value="all">Tất cả</option>
          <option value="true">Đang bật</option>
          <option value="false">Đang tắt</option>
        </select>
        <button className="px-3 py-2 rounded border" onClick={load}>Làm mới</button>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {editing && (
        <CouponForm
          initial={editing?._id ? editing : null}
          onSaved={handleSaved}
          onCancel={() => setEditing(null)}
        />
      )}

      <CouponTable
        data={list}
        loading={loading}
        onEdit={setEditing}
        onDelete={handleDelete}
      />
    </div>
  );
}
