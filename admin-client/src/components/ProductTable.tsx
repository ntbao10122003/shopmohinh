import { useState } from 'react'

export type ProductRow = {
  id: string
  name: string
  sku: string
  price: number
  priceOld?: number
  quantity: number
  category: string
  description: string
  visible: boolean
  images?: string[]
}

export default function ProductTable({
  products,
  onQuickUpdate,
  onDelete,
}: {
  products: ProductRow[]
  onQuickUpdate: (id: string, patchData: { price: number; priceOld?: number; quantity: number; category: string; sku: string; name: string; description: string; visible: boolean }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [editId, setEditId] = useState<string | null>(null)
  const [draftPrice, setDraftPrice] = useState('')
  const [draftQty, setDraftQty] = useState('')
  const [draftCategory, setDraftCategory] = useState('')
  const [draftSku, setDraftSku] = useState('')
  const [draftName, setDraftName] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [draftPriceOld, setDraftPriceOld] = useState('')
  const [draftVisible, setDraftVisible] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function startEdit(p: ProductRow) {
    setEditId(p.id)
    setDraftPrice(String(p.price ?? ''))
    setDraftQty(String(p.quantity ?? ''))
    setDraftCategory(p.category)
    setDraftSku(p.sku)
    setDraftName(p.name)
    setDraftDescription(p.description)
    setDraftPriceOld(String(p.priceOld ?? ''))
    setDraftVisible(p.visible)
    setErr(null)
  }

  async function saveEdit(id: string) {
    try {
      setSavingId(id)
      setErr(null)
      await onQuickUpdate(id, {
        price: Number(draftPrice),
        priceOld: draftPriceOld ? Number(draftPriceOld) : undefined,
        quantity: Number(draftQty),
        category: draftCategory,
        sku: draftSku,
        name: draftName,
        description: draftDescription,
        visible: draftVisible
      })
      setEditId(null)
    } catch (e: any) {
      setErr(e.message || 'Update failed')
    } finally {
      setSavingId(null)
    }
  }

  async function confirmDelete(id: string) {
    if (!window.confirm('Delete this product?')) return
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
          <div className="card-head-title">Products List</div>
          <div className="card-sub">{products.length} total</div>
        </div>
        {err && (
          <div style={{ color: '#dc2626', fontSize: 13 }}>
            ❌ {err}
          </div>
        )}
      </div>

      <div className="table-scroll">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th scope="col" className="ps-4">Tên sản phẩm</th>
              <th scope="col">SKU</th>
              <th scope="col">Giá</th>
              <th scope="col">Số lượng</th>
              <th scope="col">Danh mục</th>
              <th scope="col" className="text-end pe-4">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">Empty</td>
              </tr>
            )}

            {products.map((product) => (
              <tr key={product.id}>
                <td className="ps-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0 me-3" style={{ width: '40px', height: '40px' }}>
                      {product.images?.[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt="" 
                          className="img-fluid rounded"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="bg-light d-flex align-items-center justify-content-center rounded" style={{ width: '100%', height: '100%' }}>
                          <i className="fas fa-image text-muted"></i>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="fw-medium">{product.name}</div>
                      <div className="small text-muted text-truncate" style={{ maxWidth: '200px' }} title={product.description}>
                        {product.description}
                      </div>
                    </div>
                  </div>
                </td>

                <td>
                  {editId === product.id ? (
                    <input
                      type="text"
                      value={draftSku}
                      onChange={e => setDraftSku(e.target.value)}
                    />
                  ) : (
                    <span>{product.sku}</span>
                  )}
                </td>

                <td>
                  {editId === product.id ? (
                    <div>
                      <input
                        type="number"
                        value={draftPrice}
                        onChange={e => setDraftPrice(e.target.value)}
                        className="input-sm"
                        style={{ width: 100, marginBottom: 4 }}
                      />
                      <input
                        type="number"
                        value={draftPriceOld}
                        onChange={e => setDraftPriceOld(e.target.value)}
                        className="input-sm"
                        style={{ width: 100 }}
                        placeholder="Old price"
                      />
                    </div>
                  ) : (
                    <span>{product.price?.toLocaleString?.('vi-VN')} đ</span>
                  )}
                </td>

                <td>
                  {editId === product.id ? (
                    <input
                      type="number"
                      value={draftQty}
                      onChange={e => setDraftQty(e.target.value)}
                    />
                  ) : (
                    <span>{product.quantity}</span>
                  )}
                </td>

                <td>
                  {editId === product.id ? (
                    <input
                      type="text"
                      value={draftCategory}
                      onChange={e => setDraftCategory(e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">{product.category}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${product.visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {product.visible ? 'Hiện' : 'Ẩn'}
                      </span>
                    </div>
                  )}
                </td>

                <td className="text-end pe-4">
                  {editId === product.id ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">Hiển thị:</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={draftVisible}
                            onChange={(e) => setDraftVisible(e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                          disabled={savingId === product.id}
                          onClick={() => saveEdit(product.id)}
                        >
                          {savingId === product.id ? 'Đang lưu...' : 'Lưu'}
                        </button>
                        <button
                          className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                          onClick={() => setEditId(null)}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                        onClick={() => startEdit(product)}
                      >
                        Sửa
                      </button>
                      <button
                        className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                        disabled={deletingId === product.id}
                        onClick={() => confirmDelete(product.id)}
                      >
                        {deletingId === product.id ? 'Đang xóa...' : 'Xóa'}
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
