import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Attempting login with:', { username })
      
      const res = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      
      const data = await res.json()
      console.log('Login response:', { status: res.status, data })
      
      if (!res.ok || data.status === 'error' || data.success === false) {
        throw new Error(data.message || 'Đăng nhập thất bại')
      }
      
      const token = data.token || data.data?.token
      const userData = data.data?.user || data.data
      
      if (!token) {
        throw new Error('Không nhận được token từ server')
      }
      
      // Lưu token và thông tin user vào localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      console.log('Login successful, redirecting to /products')
      
      // Chuyển hướng về trang sản phẩm
      navigate('/products')
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Có lỗi xảy ra khi đăng nhập')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>

        {error && <p className="error-text">❌ {error}</p>}

        <label>Tên đăng nhập</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />

        <label>Mật khẩu</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button className="btn" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  )
}
