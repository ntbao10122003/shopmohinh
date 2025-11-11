import { useState } from 'react'

export type CreateGalleryItemPayload = {
  title: string
  altText?: string
  imageUrl: string
  order: number
  isActive: boolean
}

export type GalleryRow = {
  id: string
  title: string
  altText?: string
  imageUrl: string
  order: number
  isActive: boolean
  createdAt?: string
}

export default function GalleryForm({
  onCreate,
}: {
  onCreate: (payload: CreateGalleryItemPayload) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [altText, setAltText] = useState('A beautiful image')
  const [imageUrl, setImageUrl] = useState('')
  const [order, setOrder] = useState('1')
  const [isActive, setIsActive] = useState(true)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function isValidUrlLike(u: string) {
    // chấp nhận cả URL tuyệt đối và path tương đối /public/...
    return typeof u === 'string' && u.trim().length > 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    // validate cơ bản
    if (!title.trim()) {
      setSaving(false)
      setError('Title is required')
      return
    }
    if (!isValidUrlLike(imageUrl)) {
      setSaving(false)
      setError('Image URL is required')
      return
    }
    const nOrder = Number(order)
    if (Number.isNaN(nOrder) || nOrder < 0) {
      setSaving(false)
      setError('Order must be a number >= 0')
      return
    }

    const payload: CreateGalleryItemPayload = {
      title: title.trim(),
      altText: altText?.trim() || undefined,
      imageUrl: imageUrl.trim(),
      order: nOrder,
      isActive,
    }

    try {
      await onCreate(payload)
      // reset
      setTitle('')
      setAltText('')
      setImageUrl('')
      setOrder('1')
      setIsActive(true)
    } catch (err: any) {
      setError(err?.message || 'Create gallery item failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-head-title">Add Gallery Item</div>
        <div className="card-sub">Tạo ảnh gallery mới</div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="mb-16">
          <label>Title *</label>
          <input
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="My Image"
          />
        </div>

        <div className="mb-16">
          <label>Alt Text</label>
          <input
            value={altText}
            onChange={e => setAltText(e.target.value)}
            placeholder="A beautiful image"
          />
        </div>

        <div className="mb-16">
          <label>Image URL *</label>
          <input
            required
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="/public/uploads/image-xxx.jpg hoặc https://..."
          />
        </div>

        <div className="mb-16">
          <label>Order</label>
          <input
            type="number"
            min={0}
            value={order}
            onChange={e => setOrder(e.target.value)}
          />
        </div>

        <div className="mb-16">
          <label className="row">
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            <span>Active</span>
          </label>
        </div>

        {/* Preview */}
        <div className="mb-16 row-span-all">
          <label>Preview</label>
          <div
            style={{
              border: '1px solid #1f2937',
              borderRadius: 8,
              padding: 12,
              minHeight: 60,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {isValidUrlLike(imageUrl) ? (
              <>
                <img
                  src={imageUrl}
                  alt={altText || title || 'preview'}
                  style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <div className="muted" style={{ fontSize: 12, wordBreak: 'break-all' }}>
                  {imageUrl}
                </div>
              </>
            ) : (
              <div className="muted" style={{ fontSize: 12 }}>Chưa có URL — nhập để xem preview</div>
            )}
          </div>
        </div>

        <div className="row-span-all">
          <button className="btn" disabled={saving}>
            {saving ? 'Saving...' : 'Create gallery'}
          </button>
        </div>

        {error && (
          <div className="row-span-all" style={{ color: '#dc2626', fontSize: 13 }}>
            ❌ {error}
          </div>
        )}
      </form>
    </div>
  )
}
