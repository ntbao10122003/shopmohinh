// pages/GalleryPage.tsx
import { useEffect, useCallback, useState } from 'react'
import { useApi } from '../hooks/useApi'
import {
  apiGetJson,
  apiPostJson,
  apiPatchJson,
  apiDeleteJson,
} from '../services/api'

import GalleryForm from '../components/GalleryForm'
import type { CreateGalleryItemPayload } from '../components/GalleryForm'
import GalleryTable from '../components/GalleryTable'
import type { GalleryRow } from '../components/GalleryTable'

type ApiGalleryList = {
  status: string
  data: {
    data: GalleryRow[]
  }
}

type ApiCreateGalleryItem = {
  success: boolean
  message: string
  data: GalleryRow
}

export default function GalleryPage() {
  const { data, loading, error, request } = useApi<ApiGalleryList>()
  const [isDeleting, setIsDeleting] = useState(false)

  const reload = useCallback(() => {
    return request(() => apiGetJson<ApiGalleryList>('/api/v1/gallery'))
  }, [request])

  useEffect(() => {
    reload()
  }, [reload])

  async function handleCreate(payload: CreateGalleryItemPayload) {
    try {
      const created = await apiPostJson<ApiCreateGalleryItem>('/api/v1/gallery', payload)
      await reload()
      console.log('Tạo gallery item thành công:', created.data)
    } catch (err) {
      console.error('Lỗi khi tạo gallery item:', err)
      throw err
    }
  }

  async function handleQuickUpdate(
    id: string,
    patchData: {
      title: string
      altText?: string
      imageUrl: string
      order: number
      isActive: boolean
    }
  ) {
    try {
      await apiPatchJson(`/api/v1/gallery/${id}`, patchData)
      await reload()
    } catch (err) {
      console.error('Lỗi khi cập nhật gallery item:', err)
      throw err
    }
  }

  async function handleDelete(id: string) {
    try {
      if (!window.confirm('Bạn có chắc chắn muốn xoá ảnh này?')) return
      
      setIsDeleting(true)
      
      // Lưu lại danh sách cũ để rollback nếu có lỗi
      const oldData = data?.data?.data || []
      
      // Cập nhật UI ngay lập tức
      if (data?.data?.data) {
        const updatedItems = data.data.data.filter(item => item.id !== id)
        request(() => Promise.resolve({
          ...data,
          data: {
            ...data.data,
            data: updatedItems
          }
        }))
      }
      
      // Gọi API xoá
      await apiDeleteJson(`/api/v1/gallery/${id}`)
      
      // Gọi lại API để đồng bộ dữ liệu mới nhất
      await reload()
    } catch (err) {
      console.error('Lỗi khi xoá gallery item:', err)
      // Nếu có lỗi, thông báo cho người dùng
      alert('Có lỗi xảy ra khi xoá ảnh. Vui lòng thử lại.')
      // Tải lại dữ liệu để đồng bộ
      await reload()
    } finally {
      setIsDeleting(false)
    }
  }

  const items = data?.data?.data || []

  return (
    <>
      <div className="card">
        <div className="card-head">
          <div className="card-head-title">Gallery Admin</div>
          <div className="card-sub">
            Thêm ảnh, chỉnh nhanh title/alt/url/order/active, xoá ảnh.
          </div>
        </div>

        {error && (
          <div style={{ color: '#dc2626', fontSize: 13 }}>
            ❌ {error}
          </div>
        )}

        <GalleryForm onCreate={handleCreate} />
      </div>

      <div>
        {(loading || isDeleting) && !data ? (
          <div className="card">
            <div className="muted">Đang tải...</div>
          </div>
        ) : (
          <GalleryTable
            items={items}
            onQuickUpdate={handleQuickUpdate}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </>
  )
}
