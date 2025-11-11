import { useState } from 'react'

export type PostGalleryRow = {
  id: string
  title: string
  altText?: string
  imageUrl: string
  order: number
  isActive: boolean
  createdAt?: string
}

export default function PostGalleryTable({
  items,
  onQuickUpdate,
  onDelete,
  isDeleting = false
}: {
  items: PostGalleryRow[]
  onQuickUpdate: (
    id: string,
    patchData: {
      title: string
      altText?: string
      imageUrl: string
      order: number
      isActive: boolean
    }
  ) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isDeleting?: boolean
  onDelete: (id: string) => Promise<void>
}) {
  const [editId, setEditId] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftAlt, setDraftAlt] = useState('')
  const [draftUrl, setDraftUrl] = useState('')
  const [draftOrder, setDraftOrder] = useState('0')
  const [draftActive, setDraftActive] = useState(true)

  const [err, setErr] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function startEdit(row: PostGalleryRow) {
    setEditId(row.id)
    setDraftTitle(row.title ?? '')
    setDraftAlt(row.altText ?? '')
    setDraftUrl(row.imageUrl ?? '')
    setDraftOrder(String(row.order ?? 0))
    setDraftActive(!!row.isActive)
    setErr(null)
  }

  async function saveEdit(id: string) {
    try {
      setSavingId(id)
      setErr(null)

      const nOrder = Number(draftOrder)
      if (Number.isNaN(nOrder) || nOrder < 0) {
        throw new Error('Order phải là số >= 0')
      }
      if (!draftTitle.trim()) throw new Error('Title là bắt buộc')
      if (!draftUrl.trim()) throw new Error('Image URL là bắt buộc')

      await onQuickUpdate(id, {
        title: draftTitle.trim(),
        altText: draftAlt.trim() || undefined,
        imageUrl: draftUrl.trim(),
        order: nOrder,
        isActive: draftActive,
      })
      setEditId(null)
    } catch (e: any) {
      setErr(e.message || 'Update failed')
    } finally {
      setSavingId(null)
    }
  }

  async function confirmDelete(id: string) {
    if (!window.confirm('Delete this gallery item?')) return
    try {
      setDeletingId(id)
      setErr(null)
      await onDelete(id)
    } catch (e: any) {
      setErr(e.message || 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-head-title">Post Gallery</div>
          <div className="card-sub">{items.length} total</div>
        </div>
        {err && <div style={{ color: '#dc2626', fontSize: 13 }}>❌ {err}</div>}
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Preview</th>
              <th>Title / Alt</th>
              <th>Order</th>
              <th>Active</th>
              <th>Created</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">Empty</td>
              </tr>
            )}

            {items.map(row => (
              <tr key={row.id}>
                {/* Preview / URL */}
                <td>
                  {editId === row.id ? (
                    <div style={{ display: 'grid', gap: 6 }}>
                      <input
                        value={draftUrl}
                        onChange={e => setDraftUrl(e.target.value)}
                        placeholder="https://… hoặc /public/uploads/…"
                      />
                      {!!draftUrl && (
                        <img
                          src={draftUrl}
                          alt={draftAlt || draftTitle || 'preview'}
                          style={{ width: 80, height: 54, objectFit: 'cover', borderRadius: 6 }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      )}
                    </div>
                  ) : row.imageUrl ? (
                    <img
                      src={row.imageUrl}
                      alt={row.altText || row.title}
                      style={{ width: 80, height: 54, objectFit: 'cover', borderRadius: 6 }}
                    />
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>

                {/* Title / Alt */}
                <td>
                  {editId === row.id ? (
                    <div style={{ display: 'grid', gap: 6 }}>
                      <input
                        value={draftTitle}
                        onChange={e => setDraftTitle(e.target.value)}
                        placeholder="Title *"
                      />
                      <input
                        value={draftAlt}
                        onChange={e => setDraftAlt(e.target.value)}
                        placeholder="Alt text"
                      />
                    </div>
                  ) : (
                    <>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{row.title}</div>
                      <div className="muted" title={row.altText}>{row.altText || '—'}</div>
                    </>
                  )}
                </td>

                {/* Order */}
                <td>
                  {editId === row.id ? (
                    <input
                      type="number"
                      min={0}
                      value={draftOrder}
                      onChange={e => setDraftOrder(e.target.value)}
                      style={{ width: 90 }}
                    />
                  ) : (
                    <span>{row.order}</span>
                  )}
                </td>

                {/* Active */}
                <td>
                  {editId === row.id ? (
                    <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={draftActive}
                        onChange={e => setDraftActive(e.target.checked)}
                      />
                      <span>Active</span>
                    </label>
                  ) : (
                    <span
                      className="badge"
                      style={{
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: row.isActive ? '#063a28' : '#3b0a0a',
                        color: row.isActive ? '#c7f9cc' : '#fecaca',
                        border: '1px solid rgba(255,255,255,.06)',
                      }}
                    >
                      {row.isActive ? 'Yes' : 'No'}
                    </span>
                  )}
                </td>

                {/* Created */}
                <td>
                  {row.createdAt ? new Date(row.createdAt).toLocaleString() : <span className="muted">—</span>}
                </td>

                {/* Actions */}
                <td>
                  {editId === row.id ? (
                    <div className="actions-row">
                      <button
                        className="btn"
                        disabled={savingId === row.id}
                        onClick={() => saveEdit(row.id)}
                      >
                        {savingId === row.id ? 'Saving...' : 'Save'}
                      </button>
                      <button className="btn btn-danger" onClick={() => setEditId(null)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="actions-row">
                      <button className="btn" onClick={() => startEdit(row)}>Edit</button>
                      <button
                        className="btn btn-danger"
                        disabled={isDeleting || deletingId === row.id}
                        onClick={() => confirmDelete(row.id)}
                      >
                        {isDeleting || deletingId === row.id ? 'Đang xoá...' : 'Xoá'}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>
    </div>
  )
}
