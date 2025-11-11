import { useEffect, useCallback, useState, useMemo } from 'react'
import { useApi } from '../hooks/useApi'
import {
  apiGetJson,
  apiPostJson,
  apiPatchJson,
  apiDeleteJson,
} from '../services/api'
import ProductForm from '../components/ProductForm'
import type { CreateProductPayload } from '../components/ProductForm'
import ProductTable from '../components/ProductTable'
import type { ProductRow } from '../components/ProductTable'

type ApiProductsList = {
  success: boolean
  message: string
  data: ProductRow[]
}

type ApiCreateProduct = {
  success: boolean
  message: string
  data: ProductRow
}

export default function ProductsPage() {
  const { data, loading, error, request, setData } = useApi<ApiProductsList>()
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const reload = useCallback(() => {
    return request(() =>
      apiGetJson<ApiProductsList>('/api/v1/products')
    )
  }, [request])

  // Get unique categories
  const categories = useMemo(() => {
    if (!data?.data) return []
    const cats = new Set(data.data.map(p => p.category).filter(Boolean))
    return Array.from(cats).sort()
  }, [data])

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (!data?.data) return []
    if (selectedCategory === 'all') return data.data
    return data.data.filter(p => p.category === selectedCategory)
  }, [data, selectedCategory])

  // Group products by category
  const productsByCategory = useMemo(() => {
    if (!data?.data) return {}
    return data.data.reduce((acc, product) => {
      const category = product.category || 'Chưa phân loại'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(product)
      return acc
    }, {} as Record<string, ProductRow[]>)
  }, [data])

  useEffect(() => {
    reload()
  }, [reload])

  async function handleCreate(payload: CreateProductPayload) {
    // POST tạo sản phẩm
    const created = await apiPostJson<ApiCreateProduct>(
      '/api/v1/products',
      payload
    )

    // cập nhật state local để thấy item mới ngay
    setData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        data: [...prev.data, created.data],
      }
    })
  }

  async function handleQuickUpdate(
    id: string,
    patchData: {
      price: number
      priceOld?: number
      quantity: number
      category: string
      sku: string
      name: string
      description: string
      visible?: boolean
    }
  ): Promise<void> {
    try {
      // Gọi API cập nhật
      const updated = await apiPatchJson<{ success: boolean; data: ProductRow }>(
        `/api/v1/products/${id}`,
        patchData
      )

      // cập nhật state local
      setData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          data: prev.data.map(p =>
            p.id === id ? { ...p, ...patchData } : p
          ),
        }
      })
    } catch (error) {
      console.error('Update failed:', error)
      throw error
    }
  }

  async function handleDelete(id: string) {
    await apiDeleteJson(`/api/v1/products/${id}`)

    // xoá khỏi state local
    setData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        data: prev.data.filter(p => p.id !== id),
      }
    })
  }

  return (
    <div className="min-vh-100 bg-light p-3 p-md-4">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h2 text-dark mb-1">Quản lý sản phẩm</h1>
            <p className="text-muted small mb-0">Quản lý và tổ chức sản phẩm theo danh mục</p>
          </div>
        </div>
        
        <div className="card border-0 shadow-sm mb-4 bg-gradient-primary bg-opacity-10">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 mb-0 text-dark">
                <i className="fas fa-plus-circle me-2 text-primary"></i>
                Thêm sản phẩm mới
              </h2>
            </div>
            <div className="bg-white p-3 rounded border">
              <ProductForm onCreate={handleCreate} />
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h2 className="h5 mb-1 text-dark">
                  <i className="fas fa-boxes me-2 text-primary"></i>
                  Danh sách sản phẩm
                </h2>
                <p className="small text-muted mb-0">
                  {data?.data.length || 0} sản phẩm đang hiển thị
                </p>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="small fw-medium text-muted">Lọc theo danh mục:</span>
                <div className="input-group input-group-sm" style={{ width: '200px' }}>
                  <select 
                    className="form-select form-select-sm"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">Tất cả danh mục</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="d-flex flex-column align-items-center justify-content-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted">Đang tải sản phẩm...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger m-4" role="alert">
              <div className="d-flex align-items-center">
                <i className="fas fa-exclamation-circle me-2"></i>
                <div>
                  Lỗi: {typeof error === 'string' ? error : 'Có lỗi xảy ra khi tải dữ liệu'}
                </div>
              </div>
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center p-5">
              <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
              <h5 className="mb-2">Không có sản phẩm nào</h5>
              <p className="text-muted mb-4">Bắt đầu bằng cách thêm sản phẩm mới.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <i className="fas fa-plus me-2"></i>
                Thêm sản phẩm mới
              </button>
            </div>
          ) : selectedCategory === 'all' ? (
            // Show all categories in collapsible sections
            <div className="list-group list-group-flush">
              {Object.entries(productsByCategory).map(([category, products]) => (
                <div key={category} className="list-group-item p-0 border-0">
                  <div className="card mb-3 border-0 shadow-sm">
                    <div 
                      className="card-header bg-light d-flex justify-content-between align-items-center cursor-pointer"
                      onClick={() => toggleCategory(category)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                          <i className="fas fa-folder text-primary"></i>
                        </div>
                        <div>
                          <span className="fw-medium">{category}</span>
                          <span className="badge bg-primary bg-opacity-10 text-primary ms-2">
                            {products.length} sản phẩm
                          </span>
                        </div>
                      </div>
                      <i className={`fas fa-chevron-${expandedCategories[category] ? 'up' : 'down'} text-muted`}></i>
                    </div>
                    
                    {expandedCategories[category] !== false && (
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <ProductTable
                            products={products}
                            onQuickUpdate={handleQuickUpdate}
                            onDelete={handleDelete}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Show only selected category
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light">
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                    <i className="fas fa-folder text-primary"></i>
                  </div>
                  <h3 className="h5 mb-0">
                    {selectedCategory}
                    <span className="text-muted ms-2 small fw-normal">
                      ({filteredProducts.length} sản phẩm)
                    </span>
                  </h3>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <ProductTable
                    products={filteredProducts}
                    onQuickUpdate={handleQuickUpdate}
                    onDelete={handleDelete}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  )
}
