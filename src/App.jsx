import { useState } from "react";
import { Provider } from "react-redux";
import Navbar from "./components/common/Navbar";
import AppRoutes from "./routes";
import CartInitializer from "./components/common/CartInitializer";
import NotificationToast from "./components/common/NotificationToast";
import { store } from "./store";
import { applyAdminSessionFromCookie } from "./utils/adminSession";

/** 主程式 */
function App() {
  /**
   * 登入狀態：必須與 Cookie 同步初始化。
   * 若僅在 useEffect 內 setIsAuth，第一輪 render 仍為 false，ProtectedRoute 會先導向登入頁。
   */
  const [isAuth, setIsAuth] = useState(() => applyAdminSessionFromCookie());
  const routes = AppRoutes(isAuth, setIsAuth);

  return (
    <Provider store={store}>
    <div className="App">
      <CartInitializer />
      {/* 導覽列 */}
      <Navbar isAuth={isAuth} setIsAuth={setIsAuth} />
      {/* 通知 Toast（右上方、日期下方） */}
      <NotificationToast />
      <div
        className="container-fluid min-vh-80 d-flex flex-column px-2 px-sm-3 px-md-4 px-lg-5 w-100"
        style={{ marginTop: 0, maxWidth: "100%", marginLeft: "auto", marginRight: "auto" }}
      >
        {/* <MessageToast /> */}
        {routes}
      </div>
      {/* 頁尾區塊 */}
      <footer className="bg-dark text-center text-lg-start mt-auto">
        <div className="text-center p-3">
          <small className="text-white">Copyright &copy; Wilson 威爾森 2026 | </small>
          <small className="text-white">All rights reserved | </small>
          <small className="text-white">服務信箱: <a href="mailto:wilson.tzo@gmail.com" className="text-white">wilson.tzo@gmail.com</a></small>
        </div>
      </footer>
    </div>
    </Provider>
  )
}

export default App
