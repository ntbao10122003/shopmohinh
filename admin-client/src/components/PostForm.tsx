import { useState } from 'react'

export type CreatePostPayload = {
  title: string
  content: string
  coverImage?: string
  categories: string[]
  slug?: string // optional: chỉ dùng nếu backend yêu cầu
}

export default function PostForm({
  onCreate,
  withSlug = false, // bật nếu backend yêu cầu nhập slug
}: {
  onCreate: (payload: CreatePostPayload) => Promise<void>
  withSlug?: boolean
}) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [categoriesText, setCategoriesText] = useState('NodeJS, Mongoose')
  const [slug, setSlug] = useState('') // chỉ dùng khi withSlug = true

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function parseCategories(input: string): string[] {
    // Hỗ trợ: mỗi dòng 1 category hoặc dùng dấu phẩy
    return input
      .split(/\n|,/)
      .map(s => s.trim())
      .filter(Boolean)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload: CreatePostPayload = {
      title,
      content,
      coverImage: coverImage || undefined,
      categories: parseCategories(categoriesText),
      ...(withSlug && slug ? { slug } : {}),
    }

    try {
      await onCreate(payload)
      // reset form
      setTitle('')
      setContent('')
      setCoverImage('')
      setCategoriesText('')
      setSlug('')
    } catch (err: any) {
      setError(err?.message || 'Create post failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-head-title">Add Post</div>
        <div className="card-sub">Tạo bài viết mới</div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="mb-16">
          <label>Title *</label>
          <input
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Tiêu đề bài viết"
          />
        </div>

        {withSlug && (
          <div className="mb-16">
            <label>Slug</label>
            <input
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="vd: huong-dan-nodejs"
            />
          </div>
        )}

        <div className="mb-16 row-span-all">
          <label>Content *</label>
          <textarea
            required
            rows={6}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Nội dung bài viết…"
          />
        </div>

        <div className="mb-16">
          <label>Cover Image (URL)</label>
          <input
            value={coverImage}
            onChange={e => setCoverImage(e.target.value)}
            placeholder="https://example.com/cover.jpg"
          />
        </div>

        <div className="mb-16 row-span-all">
          <label>Categories (mỗi dòng 1 tên hoặc dùng dấu phẩy)</label>
          <textarea
            rows={3}
            value={categoriesText}
            onChange={e => setCategoriesText(e.target.value)}
            placeholder={`NodeJS\nMongoose`}
          />
        </div>

        <div className="row-span-all">
          <button className="btn" disabled={saving}>
            {saving ? 'Saving...' : 'Create post'}
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
