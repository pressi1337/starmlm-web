import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Bounces users whose role is not in `allow` away from the wrapped page.
 * Used so that manual URL navigation (e.g. a sub-admin typing
 * `/portal/admin/users`) lands them back on their dashboard instead of
 * rendering a page they shouldn't see. The backend still 403s their API
 * calls — this is the UI half of defense-in-depth.
 */
const RoleGuard = ({
  allow,
  fallback = "/portal/admin/dashboard",
  children,
}: {
  allow: number[];
  fallback?: string;
  children: ReactNode;
}) => {
  const { role } = useAuth();
  if (role === null || role === undefined || !allow.includes(role)) {
    return <Navigate to={fallback} replace />;
  }
  return <>{children}</>;
};

export default RoleGuard;
