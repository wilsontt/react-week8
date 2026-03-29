import { Navigate } from "react-router-dom";

/** 需登入才能存取的路由，未登入則導向登入頁 */
export default function ProtectedRoute({ isAuth, children }) {
  if (!isAuth) {
    return <Navigate to="/admin/Login" replace />;
  }
  return children;
}
