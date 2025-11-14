import React, { useEffect, useMemo, useState } from 'react';
import { Link} from "react-router-dom"; // ✅ THÊM DÒNG NÀY
import cartIcon from '../assets/images/site49/cart.png';

const SubMenu = ({ children }) => <div className="sub-menu-1">{children}</div>;

const buildHref = (url) => {
  if (!url) return "/home";
  if (/^https?:\/\//i.test(url)) return url; // external
  return `/${url}`;
};

const Header = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('http://localhost:5000/api/v1/menus');
        const json = await res.json();
        setMenus(json.data || []);
      } catch (e) {
        setErr("Lỗi tải menu");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const menuLevel1 = useMemo(() => menus, [menus]);
  const toggleMenu = (id) => setOpenId(prev => prev === id ? null : id);

  return (
    <header className="site49_head_col0_online365">
      <div className="container">
        <div className="header">

          {/* LOGO */}
          <div className="logo wow flipInX" data-wow-delay="0.3s">
            <Link to="/">
              <img src="/images/site49/logo.png" alt="Logo" />
            </Link>
          </div>

          {/* MENU */}
          <div className="menu-top wow fadeIn" data-wow-delay="0.3s">
            <div className="menu-wrapper">
              <div className="hamburger">
                <span></span><span></span><span></span><span></span>
              </div>
            </div>

            <ul className="main-menu accordion">
              <li className="logo-menu">
                <Link to="/">
                  <img src="/images/site49/logo.png" alt="Logo" />
                </Link>
              </li>

              {loading && <li className="menu-link">Đang tải menu...</li>}
              {err && <li className="menu-link">{err}</li>}

              {!loading && !err && menuLevel1.map((m) => {
                const hasChildren = m.items?.length > 0;
                const isOpen = openId === m._id;

                return (
                  <li className={`menu-link ${isOpen ? "open" : ""}`} key={m._id}>
                    
                    {/* CẤP 1: MENU CHA (dùng button, không Link) */}
                    <button
                      className="link title5 menu-toggle-btn"
                      onClick={() => toggleMenu(m._id)}
                      type="button"
                    >
                      {m.title}
                    </button>

                    {hasChildren && isOpen && (
                      <>
                        <SubMenu>
                          {m.items.map((it) => (
                            <div className={`a-lv-1 ${it.css_class || ""}`} key={it.id}>

                              {/* CẤP 2 */}
                              {/^https?:\/\//i.test(it.url) ? (
                                <a
                                  className="title5 lv-1"
                                  href={it.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {it.title}
                                </a>
                              ) : (
                                <Link className="title5 lv-1" to={buildHref(it.url)}>
                                  {it.title}
                                </Link>
                              )}

                              {/* CẤP 3 */}
                              {it.children?.length > 0 && (
                                <div className="menu2">
                                  {it.children.map((c) => (
                                    <div key={c.id}>
                                      {/^https?:\/\//i.test(c.url) ? (
                                        <a
                                          className="title5"
                                          href={c.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {c.title}
                                        </a>
                                      ) : (
                                        <Link className="title5" to={buildHref(c.url)}>
                                          {c.title}
                                        </Link>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </SubMenu>

                        <span className="fa fa-angle-down rotate-lv-1"></span>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* CART + USER + SEARCH */}
          <div className="search-user-cart">
            <div className="mini-search">
              <Link to="/search">
                <div className="search-head">
                  <img src="/images/site49/icon/search.png" alt="Search" />
                  <div className="search-items"><span>0</span></div>
                </div>
              </Link>
            </div>
            <div className="mini-cart">
              <Link to="/cart">
                <div className="cart-head">
                  <img src={cartIcon} alt="Cart" />
                  <div className="cart-items"><span>0</span></div>
                </div>
              </Link>
            </div>

            <div className="item-user">
              <Link className="sicon-box" to="/login">
                <img src="/images/site49/user.png" alt="User" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
