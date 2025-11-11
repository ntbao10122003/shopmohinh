import React, { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1';

export type Coupon = {
  _id?: string;
  code: string;
  discountType: 'percent' | 'amount';
  discountValue: number;
  minSubtotal?: number | null;
  maxSubtotal?: number | null;
  maxDiscount?: number | null;   // dùng cho % (trần giảm)
  startsAt?: string | null;      // ISO
  endsAt?: string | null;        // ISO
  usageLimit?: number | null;
  usedCount?: number | null;
  perUserLimit?: number | null;
  requireLoggedIn?: boolean;
  onlyFirstOrder?: boolean;
  active: boolean;
  note?: string;
};

type Props = {
  initial?: Coupon | null;
  onSaved: (saved: Coupon) => void;
  onCancel?: () => void;
};

function toDateTimeLocalValue(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromDateTimeLocalValue(dt: string): string | null {
  if (!dt) return null;
  const d = new Date(dt);
  return d.toISOString();
}

export default function CouponForm({ initial, onSaved, onCancel }: Props) {
  const editing = Boolean(initial?._id);

  const [form, setForm] = useState<Coupon>(() => ({
    code: initial?.code ?? '',
    discountType: (initial?.discountType as any) ?? 'percent',
    discountValue: initial?.discountValue ?? 10,
    minSubtotal: initial?.minSubtotal ?? 200000,
    maxSubtotal: initial?.maxSubtotal ?? null,
    maxDiscount: initial?.maxDiscount ?? null,
    startsAt: initial?.startsAt ?? null,
    endsAt: initial?.endsAt ?? null,
    usageLimit: initial?.usageLimit ?? null,
    usedCount: initial?.usedCount ?? 0,
    perUserLimit: initial?.perUserLimit ?? null,
    requireLoggedIn: initial?.requireLoggedIn ?? false,
    onlyFirstOrder: initial?.onlyFirstOrder ?? false,
    active: initial?.active ?? true,
    note: initial?.note ?? '',
  }));

  useEffect(() => {
    if (initial) setForm(prev => ({ ...prev, ...initial }));
  }, [initial]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!form.code.trim()) return false;
    if (!['percent', 'amount'].includes(form.discountType)) return false;
    if (!(form.discountValue > 0)) return false;
    if (form.discountType === 'percent' && form.discountValue > 100) return false;
    if (form.minSubtotal != null && form.minSubtotal < 0) return false;
    if (form.maxDiscount != null && form.maxDiscount < 0) return false;
    if (form.maxSubtotal != null && form.minSubtotal != null && form.maxSubtotal < form.minSubtotal) return false;
    return true;
  }, [form]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || saving) return;
    setSaving(true);
    setError(null);

    const payload: Coupon = {
      ...form,
      code: form.code.trim().toUpperCase(),
      startsAt: fromDateTimeLocalValue(toDateTimeLocalValue(form.startsAt ?? undefined)),
      endsAt: fromDateTimeLocalValue(toDateTimeLocalValue(form.endsAt ?? undefined)),
    };
    // Chuẩn hóa “200” => 200000
    if (payload.minSubtotal != null && payload.minSubtotal > 0 && payload.minSubtotal < 1000) {
      payload.minSubtotal = payload.minSubtotal * 1000;
    }

    try {
      const url = editing
        ? `${API_BASE}/admin/coupons/${initial?._id}`
        : `${API_BASE}/admin/coupons`;
      const method = editing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Lưu coupon thất bại');

      onSaved(json.data);
    } catch (err: any) {
      setError(err.message || 'Lỗi không xác định');
    } finally {
      setSaving(false);
    }
  }

  function set<K extends keyof Coupon>(key: K, value: Coupon[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-xl bg-white">
      <h3 className="text-xl font-semibold">{editing ? 'Sửa mã giảm giá' : 'Tạo mã giảm giá'}</h3>
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1">
          <span>Mã (CODE) *</span>
          <input className="border rounded p-2" value={form.code} onChange={e => set('code', e.target.value)} placeholder="ALL200K10" />
        </label>

        <label className="flex flex-col gap-1">
          <span>Loại giảm *</span>
          <select className="border rounded p-2" value={form.discountType} onChange={e => set('discountType', e.target.value as any)}>
            <option value="percent">Phần trăm (%)</option>
            <option value="amount">Số tiền (VND)</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span>Giá trị giảm *</span>
          <input
            type="number"
            className="border rounded p-2"
            value={form.discountValue}
            onChange={e => set('discountValue', Number(e.target.value))}
            min={1}
            max={form.discountType === 'percent' ? 100 : undefined}
            placeholder={form.discountType === 'percent' ? '10' : '50000'}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span>Đơn tối thiểu (VND)</span>
          <input type="number" className="border rounded p-2" value={form.minSubtotal ?? 0} onChange={e => set('minSubtotal', Number(e.target.value))} min={0} />
        </label>

        <label className="flex flex-col gap-1">
          <span>Giảm tối đa (VND, cho %)</span>
          <input type="number" className="border rounded p-2" value={form.maxDiscount ?? 0} onChange={e => set('maxDiscount', Number(e.target.value))} min={0} />
        </label>

        <label className="flex flex-col gap-1">
          <span>Giới hạn lượt dùng</span>
          <input type="number" className="border rounded p-2" value={form.usageLimit ?? 0} onChange={e => set('usageLimit', Number(e.target.value))} min={0} />
        </label>

        <label className="flex flex-col gap-1">
          <span>Bắt đầu</span>
          <input type="datetime-local" className="border rounded p-2" value={toDateTimeLocalValue(form.startsAt ?? undefined)} onChange={e => set('startsAt', fromDateTimeLocalValue(e.target.value))} />
        </label>

        <label className="flex flex-col gap-1">
          <span>Kết thúc</span>
          <input type="datetime-local" className="border rounded p-2" value={toDateTimeLocalValue(form.endsAt ?? undefined)} onChange={e => set('endsAt', fromDateTimeLocalValue(e.target.value))} />
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} />
          <span>Đang bật</span>
        </label>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={!canSubmit || saving} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">
          {saving ? 'Đang lưu…' : (editing ? 'Cập nhật' : 'Tạo mã')}
        </button>
        {onCancel && (
          <button type="button" className="px-4 py-2 rounded border" onClick={onCancel}>Hủy</button>
        )}
      </div>
    </form>
  );
}
