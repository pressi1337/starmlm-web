import { Navigate, useRoutes } from "react-router-dom";
import AuthRoutes from "./ROUTE-PATHS/AuthRoutes";
import AdminRoutes from "./ROUTE-PATHS/AdminRoutes";
import NormalUserRoutes from "./ROUTE-PATHS/NormalUserRoutes";
import { useAuthRole } from "@/hooks/useAuthRole";
import { useAuth } from "@/context/AuthContext";

export default function AllRoutes(): React.ReactElement | null {
  const { isLoading } = useAuth();
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

  const routeElements = useRoutes(routes);

  // Show loading spinner while authentication is being verified
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return routeElements;
}
