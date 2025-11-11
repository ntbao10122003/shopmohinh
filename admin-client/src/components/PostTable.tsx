import { useState } from 'react'

export type PostRow = {
  id: string
  title: string
  slug?: string
  categories: string[]
  coverImage?: string
  createdAt?: string
}

export default function PostTable({
  posts,
  onQuickUpdate,
  onDelete,
  withSlug = false, // bật nếu muốn sửa nhanh slug
}: {
  posts: PostRow[]
  onQuickUpdate: (
    id: string,
    patchData: { title: string; categories: string[]; slug?: string; coverImage?: string }
  ) => Promise<void>
  onDelete: (id: string) => Promise<void>
  withSlug?: boolean
}) {
  const [editId, setEditId] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftSlug, setDraftSlug] = useState('')
  const [draftCategories, setDraftCategories] = useState('')
  const [draftCover, setDraftCover] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function toTextCategories(cats: string[] = []) {
    return cats.join(', ')
  }
  function toArrayCategories(text: string) {
    return text
      .split(/\n|,/)
      .map(s => s.trim())
      .filter(Boolean)
  }

  function startEdit(p: PostRow) {
    setEditId(p.id)
    setDraftTitle(p.title ?? '')
    setDraftSlug(p.slug ?? '')
    setDraftCategories(toTextCategories(p.categories))
    setDraftCover(p.coverImage ?? '')
    setErr(null)
  }

  async function saveEdit(id: string) {
    try {
      setSavingId(id)
      setErr(null)
      await onQuickUpdate(id, {
        title: draftTitle,
        categories: toArrayCategories(draftCategories),
        ...(withSlug ? { slug: draftSlug || undefined } : {}),
        coverImage: draftCover || undefined,
      })
      setEditId(null)
    } catch (e: any) {
      setErr(e.message || 'Update failed')
    } finally {
      setSavingId(null)
    }
  }

  async function confirmDelete(id: string) {
    if (!window.confirm('Delete this post?')) return
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
          <div className="card-head-title">Posts List</div>
          <div className="card-sub">{posts.length} total</div>
        </div>
        {err && <div style={{ color: '#dc2626', fontSize: 13 }}>❌ {err}</div>}
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Title / Slug</th>
              <th>Categories</th>
              <th>Cover</th>
              <th>Created</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">Empty</td>
              </tr>
            )}

            {posts.map(p => (
              <tr key={p.id}>
                {/* Title / Slug */}
                <td>
                  {editId === p.id ? (
                    <>
                      <input
                        value={draftTitle}
                        onChange={e => setDraftTitle(e.target.value)}
                        placeholder="Title"
                      />
                      {withSlug && (
                        <input
                          style={{ marginTop: 6 }}
                          value={draftSlug}
                          onChange={e => setDraftSlug(e.target.value)}
                          placeholder="Slug (optional)"
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.title}</div>
                      <div className="muted">{p.slug || '—'}</div>
                    </>
                  )}
                </td>

                {/* Categories */}
                <td>
                  {editId === p.id ? (
                    <textarea
                      rows={2}
                      value={draftCategories}
                      onChange={e => setDraftCategories(e.target.value)}
                      placeholder="NodeJS, Mongoose"
                    />
                  ) : (
                    <span>{(p.categories || []).join(', ')}</span>
                  )}
                </td>

                {/* Cover */}
                <td>
                  {editId === p.id ? (
                    <input
                      value={draftCover}
                      onChange={e => setDraftCover(e.target.value)}
                      placeholder="https://…"
                    />
                  ) : p.coverImage ? (
                    <img
                      src={p.coverImage}
                      alt={p.title}
                      style={{ width: 64, height: 40, objectFit: 'cover', borderRadius: 6 }}
                    />
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>

                {/* CreatedAt */}
                <td>
                  {p.createdAt ? new Date(p.createdAt).toLocaleString() : <span className="muted">—</span>}
                </td>

                {/* Actions */}
                <td>
                  {editId === p.id ? (
                    <div className="actions-row">
                      <button
                        className="btn"
                        disabled={savingId === p.id}
                        onClick={() => saveEdit(p.id)}
                      >
                        {savingId === p.id ? 'Saving...' : 'Save'}
                      </button>
                      <button className="btn btn-danger" onClick={() => setEditId(null)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="actions-row">
                      <button className="btn" onClick={() => startEdit(p)}>Edit</button>
                      <button
                        className="btn btn-danger"
                        disabled={deletingId === p.id}
                        onClick={() => confirmDelete(p.id)}
                      >
                        {deletingId === p.id ? '...' : 'Del'}
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
