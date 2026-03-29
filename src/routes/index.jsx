// 使用 useRoutes hook 管理路由表

import { useRoutes } from "react-router-dom";

import { frontendRoutes } from "./frontend";
import { AdminRoutes } from "./admin";

import NotFound from "../pages/NotFound";

const AppRouter = (isAuth, setIsAuth) => {
  const adminRoutes = AdminRoutes(isAuth, setIsAuth);

  return useRoutes([
    ...frontendRoutes,
    ...adminRoutes,
    {
      path: "*",
      element: <NotFound />,
    },
  ]);
};

export default AppRouter;