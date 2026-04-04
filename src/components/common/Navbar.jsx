// 共用元件 導覽列
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaHome, FaList, FaInfo, FaShoppingCart, FaBook, FaCog } from "react-icons/fa";
import { DateTimeDisplay } from "../CalendarIcon";
import { selectTotalQty } from "../../slices/cartSlice";
import { showNotification } from "../../slices/notificationSlice";
import { clearAdminSession, getAdminTokenFromCookie } from "../../utils/adminSession";

import logo from "../../assets/brand-logo.png";

/** 與 Bootstrap `navbar-expand-xl` 斷點一致（px） */
const NAV_EXPAND_XL_MIN = 1200;

/** 第一列：主要選單 */
const mainMenuItems = [
  { id: "home", label: "首頁", icon: FaHome, path: "/" },
  { id: "about", label: "關於我們", icon: FaInfo, path: "/about" },
  { id: "column", label: "專欄教學", icon: FaBook, path: "/column/succulent" },
  { id: "productList", label: "產品列表", icon: FaList, path: "/productList" },
  { id: "Cart", label: "客戶購物車", icon: FaShoppingCart, path: "/cart" },
  { id: "admin", label: "後台管理", icon: FaCog, path: "/admin" },
];

/** 第二列：子選單（依 parentId 對應主選單） */
const subMenuItems = {
  about: [
    { id: "about-about", label: "關於我們", path: "/about" },
    { id: "about-sitemap", label: "網站地圖", path: "/about/sitemap" },
  ],
  column: [
    { id: "column-succulent", label: "認識多肉植物", path: "/column/succulent" },
    { id: "column-landscape", label: "多肉與花卉佈置造景", path: "/column/landscape" },
  ],
  admin: [
    { id: "admin-products", label: "產品列表管理", path: "/admin/Products" },
    { id: "admin-orders", label: "客戶訂單管理", path: "/admin/OrderList" },
    { id: "admin-coupons", label: "優惠券管理", path: "/admin/CouponList" },
    { id: "admin-logout", label: "登出", action: "logout" },
  ],
};

function getCurrentMainId(pathname) {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/column")) return "column";
  if (pathname.startsWith("/productList")) return "productList";
  if (pathname.startsWith("/cart")) return "Cart";
  if (pathname.startsWith("/admin")) return "admin";
  return null;
}

export default function Navbar({ isAuth = false, setIsAuth }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const totalQty = useSelector(selectTotalQty);
  /** 行動／平板：漢堡選單展開與否（不依賴 Bootstrap JS，避免與 bundle 雙重綁定導致無法切換） */
  const [navExpanded, setNavExpanded] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${NAV_EXPAND_XL_MIN}px)`);
    const onChange = () => {
      if (mq.matches) setNavExpanded(false);
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const currentMainId = getCurrentMainId(location.pathname);
  const rawSubItems = currentMainId ? subMenuItems[currentMainId] ?? [] : [];
  /** 未登入不顯示「登出」（登入頁不應出現登出） */
  const currentSubItems =
    currentMainId === "admin"
      ? rawSubItems.filter((sub) => sub.action !== "logout" || isAuth)
      : rawSubItems;

  const closeNav = () => setNavExpanded(false);

  const handleLogout = () => {
    const hadSession = Boolean(getAdminTokenFromCookie());
    clearAdminSession();
    setIsAuth?.(false);
    if (hadSession) {
      dispatch(showNotification({ type: "success", message: "已登出" }));
    }
    navigate("/");
    closeNav();
  };

  return (
    <nav className="navbar navbar-expand-xl navbar-light bg-light rounded mb-3" style={{ position: "static" }}>
      <div className="container-fluid flex-column align-items-stretch px-2 px-sm-3">
        <div className="d-flex w-100 flex-grow-1 align-items-center flex-wrap">
          <Link to="/" className="navbar-brand d-flex align-items-center py-0 me-2 min-w-0" onClick={closeNav}>
            <img src={logo} alt="花草的世界" className="me-2 flex-shrink-0" style={{ width: "75px", height: "75px" }} />
            <div className="min-w-0">
              <div className="fw-bold text-break">花草的世界</div>
              <small className="text-muted d-none d-sm-block">嚴選花卉 傳遞心意</small>
            </div>
          </Link>
          <button
            className="navbar-toggler ms-auto flex-shrink-0"
            type="button"
            aria-controls="navbarMain"
            aria-expanded={navExpanded}
            aria-label="切換選單"
            onClick={() => setNavExpanded((v) => !v)}
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div
            className={`collapse navbar-collapse flex-grow-1${navExpanded ? " show" : ""}`}
            id="navbarMain"
          >
            <div className="d-flex flex-column flex-xl-row flex-grow-1 w-100 align-items-stretch align-items-xl-center justify-content-xl-between gap-2 py-2 py-xl-0">
              <ul className="navbar-nav flex-grow-1 justify-content-center flex-column flex-xl-row flex-wrap gap-1 mb-0">
                {mainMenuItems.map((item) => (
                  <li key={item.id} className="nav-item d-flex align-items-center">
                    <Link
                      to={item.path}
                      className={`nav-link d-flex align-items-center rounded position-relative ${currentMainId === item.id ? "fw-bold text-primary" : "text-dark"}`}
                      onClick={closeNav}
                    >
                      <item.icon className="me-2 text-warning" size={24} />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div
                className="d-flex align-items-center justify-content-center justify-content-xl-end flex-shrink-0 pb-1 pb-xl-0"
                style={{ gap: "2ch" }}
              >
                <Link
                  to="/cart"
                  className="position-relative d-flex align-items-center justify-content-center text-dark text-decoration-none"
                  onClick={closeNav}
                  aria-label="購物車"
                >
                  <FaShoppingCart className="text-warning" size={24} />
                  {totalQty > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: "0.65rem" }}
                    >
                      {totalQty > 99 ? "99+" : totalQty}
                    </span>
                  )}
                </Link>
                <DateTimeDisplay showCalendarIcon={true} />
              </div>
            </div>
          </div>
        </div>

        {currentSubItems.length > 0 && (
          <div className="border-top pt-2 pb-2 mt-1">
            <ul className="nav justify-content-center gap-2 flex-wrap align-items-center">
              {currentSubItems.map((sub) => (
                <li key={sub.id} className="nav-item">
                  {sub.action === "logout" ? (
                    <button
                      type="button"
                      className="nav-link py-1 px-2 rounded border-0 bg-transparent text-muted"
                      onClick={handleLogout}
                    >
                      {sub.label}
                    </button>
                  ) : (
                    <Link
                      to={sub.path}
                      className={`nav-link py-1 px-2 rounded ${location.pathname === sub.path ? "bg-primary text-white fw-bold" : "text-muted"}`}
                      onClick={closeNav}
                    >
                      {sub.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
