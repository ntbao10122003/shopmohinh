import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layout/AdminLayout'
import ProductsPage from './pages/ProductsPage'
import MenusPage from './pages/MenusPage'
import LoginPage from './pages/LoginPage'
import PostPage from './pages/PostPage'
import GalleryPage from './pages/GalleryPage'
import CouponPage from './pages/CouponPage'
import OrdersPage from './pages/OrdersPage'
import type { JSX } from 'react'


function RequireAuth({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/menus" element={<MenusPage />} />
        <Route path="/posts" element={<PostPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/coupons" element={<CouponPage />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Route>

      <Route path="*" element={<div className="card">404 Not Found</div>} />
    </Routes>
  )
}
