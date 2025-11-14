import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import NewsDetail from './pages/NewsDetail'
import CheckoutSuccess from './pages/CheckoutSuccess'
import './assets/reset.css'
import './assets/color.css'
import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import Search from './pages/Search'

export default function App() {
  const location = useLocation();

  const noLayout = ["/login", "/"];
  const hideLayout = noLayout.includes(location.pathname);
  return (
    
    <>
      
      {!hideLayout && <Header />}
      <main className="main">
        <Routes>
          <Route path="/" element={<Register />} />

          {/*<Route path="/register" element={<Register />} />*/}
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/post/:id" element={<NewsDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
      </main>

      {!hideLayout && <Footer />}
    </>
  );
}