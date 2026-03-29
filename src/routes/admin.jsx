// 後台管理路由設定 
import { Navigate } from "react-router-dom"; 
import ProtectedRoute from './ProtectedRoute'

import Login from '../admin/pages/Login'
import { AdminLayout } from './AdminLayout'
import Products from '../admin/pages/Products'
// import ProductEdit from '../admin/pages/ProductEdit'
import OrderList from "../admin/pages/OrderList";
import CouponList from "../admin/pages/CouponList";


export const AdminRoutes = (isAuth, setIsAuth) => [
  {
    path: '/admin',
    element: <AdminLayout />, // 統一的後台佈局（含側邊欄、權限檢查）
    children: [
      {
        index: true,
        element: <Navigate to={isAuth ? "/admin/Products" : "/admin/Login"} replace />,
      }, 
      {
        path: 'Login',
        element: <Login setIsAuth={setIsAuth} />, 
      },
      {
        path: 'Products',
        element: (
          <ProtectedRoute isAuth={isAuth}>
            <Products /> 
          </ProtectedRoute>
        ),
      },
      // {
      //   path: 'ProductEdit',
      //   element: (
      //     <ProtectedRoute isAuth={isAuth}>
      //       <ProductEdit />  
      //     </ProtectedRoute>                    
      //   ),
      // },
      {
        path: 'OrderList',
        element: (
          <ProtectedRoute isAuth={isAuth}>
            <OrderList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'CouponList',
        element: (
          <ProtectedRoute isAuth={isAuth}>
            <CouponList />
          </ProtectedRoute>
        ),
      },
    ],
  },
];