import { useState } from 'react'

export type CreateProductPayload = {
  name: string
  sku: string
  price: number
  priceOld: number
  quantity: number
  description: string
  images: string[]
  category: string
}

export default function ProductForm({
  onCreate,
}: {
  onCreate: (payload: CreateProductPayload) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [priceOld, setPriceOld] = useState('')
  const [quantity, setQuantity] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [imagesText, setImagesText] = useState(
    'https://example.com/img1.jpg\nhttps://example.com/img2.jpg'
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload: CreateProductPayload = {
      name,
      sku,
      price: Number(price),
      priceOld: Number(priceOld || 0),
      quantity: Number(quantity),
      description,
      images: imagesText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean),
      category,
    }

    try {
      await onCreate(payload)
      // reset
      setName('')
      setSku('')
      setPrice('')
      setPriceOld('')
      setQuantity('')
      setCategory('')
      setDescription('')
      setImagesText('')
    } catch (err: any) {
      setError(err.message || 'Create failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-head-title">Add Product</div>
        <div className="card-sub">Tạo sản phẩm mới</div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="mb-16">
          <label>Name *</label>
          <input
            required
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div className="mb-16">
          <label>SKU *</label>
          <input
            required
            value={sku}
            onChange={e => setSku(e.target.value)}
          />
        </div>

        <div className="mb-16">
          <label>Price *</label>
          <input
            required
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
        </div>

        <div className="mb-16">
          <label>Old Price</label>
          <input
            type="number"
            value={priceOld}
            onChange={e => setPriceOld(e.target.value)}
          />
        </div>

        <div className="mb-16">
          <label>Quantity *</label>
          <input
            required
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
          />
        </div>

        <div className="mb-16 row-span-all">
          <label>Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div className="mb-16">
          <label>Category *</label>
          <input
            required
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
        </div>

        <div className="mb-16 row-span-all">
          <label>Image URLs (mỗi dòng 1 URL)</label>
          <textarea
            rows={3}
            value={imagesText}
            onChange={e => setImagesText(e.target.value)}
          />
        </div>

        <div className="row-span-all">
          <button className="btn" disabled={saving}>
            {saving ? 'Saving...' : 'Create product'}
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
