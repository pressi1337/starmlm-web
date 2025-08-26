// @ts-nocheck
import { Navigate, useRoutes } from "react-router-dom";
import AuthRoutes from "./ROUTE-PATHS/AuthRoutes";
import AdminRoutes from "./ROUTE-PATHS/AdminRoutes";
import NormalUserRoutes from "./ROUTE-PATHS/NormalUserRoutes";
import { useAuthRole } from "@/hooks/useAuthRole";

export default function AllRoutes(): React.ReactElement | null {
  const is_admin: boolean = useAuthRole(0);
  const is_normal_user: boolean = useAuthRole(2);

  const routes = [];
  if (is_admin) {
    routes.push(AdminRoutes);
  } else if (is_normal_user) {
    routes.push(NormalUserRoutes);
  } else {
    routes.push(AuthRoutes);
  }

  routes.push({
    path: "*",
    element: (
      <Navigate
        to={
          is_admin
            ? "/portal/admin/dashboard"
            : is_normal_user
            ? "/portal/user/dashboard"
            : "/"
        }
        replace
      />
    ),
  });

  return useRoutes(routes);
}
