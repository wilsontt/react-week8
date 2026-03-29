// 前台路由設定
import { Navigate } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/about/About";
import Sitemap from "../pages/about/Sitemap";
import ProductList from "../pages/ProductList";
import Cart from "../pages/Cart";
import Succulent from "../pages/column/Succulent";
import Landscape from "../pages/column/Landscape";

export const frontendRoutes = [
  {
    path: '/',
    element: <Home />, // 首頁
  },
  {
    path: '/column',
    element: <Navigate to="/column/succulent" replace />, // 專欄教學預設顯示第一個子選項
  },
  {
    path: '/about',
    element: <About />, // 關於我們
  },
  {
    path: '/about/sitemap',
    element: <Sitemap />, // 網站地圖
  },
  {
    path: '/productList',
    element: <ProductList />, // 產品列表
  },
  {
    path: '/cart',
    element: <Cart />, // 客戶購物車
  },
  {
    path: '/column/succulent',
    element: <Succulent />, // 認識多肉植物
  },
  {
    path: '/column/landscape',
    element: <Landscape />, // 多肉與花卉佈置造景
  },
];