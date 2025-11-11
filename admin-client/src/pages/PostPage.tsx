import { useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'
import {
  apiGetJson,
  apiPostJson,
  apiPatchJson,
  apiDeleteJson,
} from '../services/api'
import PostForm from '../components/PostForm'
import type { CreatePostPayload } from '../components/PostForm'
import PostTable from '../components/PostTable'
import type { PostRow } from '../components/PostTable'

type ApiPostsList = {
  status: string
  results: number
  total: number
  data: {
    data: PostRow[]
  }
}

type ApiCreatePost = {
  success: boolean
  message: string
  data: PostRow
}

export default function PostsPage() {
  const { data, loading, error, request, setData } = useApi<ApiPostsList>()

  const reload = useCallback(() => {
    return request(() => apiGetJson<ApiPostsList>('/api/v1/posts'))
  }, [request])

  useEffect(() => {
    reload()
  }, [reload])

  async function handleCreate(payload: CreatePostPayload) {
    try {
      // POST tạo bài viết
      const created = await apiPostJson<ApiCreatePost>('/api/v1/posts', payload)
      
      // Gọi lại để cập nhật danh sách
      await reload()
      
      // Hiển thị thông báo thành công (nếu cần)
      console.log('Tạo bài viết thành công:', created.data)
    } catch (error) {
      console.error('Lỗi khi tạo bài viết:', error)
      throw error // Ném lỗi để component Form có thể hiển thị thông báo lỗi
    }
  }

  async function handleQuickUpdate(
    id: string,
    patchData: {
      title: string
      categories: string[]
      slug?: string
      coverImage?: string
    }
  ) {
    try {
      await apiPatchJson(`/api/v1/posts/${id}`, patchData)
      // Gọi lại để cập nhật danh sách
      await reload()
    } catch (error) {
      console.error('Lỗi khi cập nhật bài viết:', error)
      throw error
    }
  }

  async function handleDelete(id: string) {
    try {
      if (!window.confirm('Bạn có chắc chắn muốn xoá bài viết này?')) {
        return
      }
      await apiDeleteJson(`/api/v1/posts/${id}`)
      // Gọi lại để cập nhật danh sách
      await reload()
    } catch (error) {
      console.error('Lỗi khi xoá bài viết:', error)
      throw error
    }

  }

  return (
    <>
      <div className="card">
        <div className="card-head">
          <div className="card-head-title">Posts Admin</div>
          <div className="card-sub">
            Thêm bài viết, chỉnh nhanh tiêu đề/slug/category/cover, xoá bài viết.
          </div>
        </div>

        {error && (
          <div style={{ color: '#dc2626', fontSize: 13 }}>
            ❌ {error}
          </div>
        )}

        {/* withSlug=false nếu backend tự sinh slug */}
        <PostForm onCreate={handleCreate} withSlug={false} />
      </div>

      <div>
        {loading && !data ? (
          <div className="card">
            <div className="muted">Loading...</div>
          </div>
        ) : (
          data && (
            <PostTable
                posts={data.data.data}  // ✅ Lấy mảng thật sự
                onQuickUpdate={handleQuickUpdate}
                onDelete={handleDelete}
                />
          )
        )}
      </div>
    </>
  )
}
