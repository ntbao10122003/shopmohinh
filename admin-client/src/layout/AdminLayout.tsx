import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from 'react';

export default function AdminLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate('/login');
  }

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);
  return (
    <div className="layout-shell">
      <div className="container">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button className="btn" onClick={handleLogout}>
          Đăng xuất
        </button>
      </header>

      <div className="box-main">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div>
            <div>Shop Admin</div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-dim)",
                fontWeight: 400,
              }}
            >
              v1 dashboard
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/products"
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            Products
          </NavLink>

          <NavLink
            to="/menus"
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            Menus
          </NavLink>

          <NavLink
            to="/posts"
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            Posts
          </NavLink>

          <NavLink
            to="/gallery"
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            Gallery
          </NavLink>

          <NavLink
            to="/coupons"
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            Coupons
          </NavLink>

        </nav>

        <NavLink
            to="/orders"
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            Orders
          </NavLink>

        <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
          © {new Date().getFullYear()} Shop Mô Hình
        </div>
      </aside>

      {/* Main */}
      <main className="main-area">
        <header className="header-bar">
          <div className="header-left">Admin Panel</div>
          <div className="header-right">/api/v1 connected</div>
        </header>

        <div className="page-wrapper">
          <Outlet />
        </div>
      </main>
      </div>
      </div>
    </div>
  );
}
