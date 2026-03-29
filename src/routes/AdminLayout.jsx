import { Outlet } from "react-router-dom";

/** 後台統一佈局，僅渲染子路由 */
export function AdminLayout() {
  return <Outlet />;
}
