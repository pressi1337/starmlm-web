import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, AdminPermissions } from "@/context/AuthContext";

/**
 * Permission-based route gate. Super-admin auto-passes (handled by
 * AuthContext.hasPermission). Sub-admin must have the named permission
 * flag set on their user row.
 *
 * Defense-in-depth alongside the backend `subadmin.permission` middleware —
 * direct URL typing or stale tabs both get bounced to a safe page.
 */
const PermissionGuard = ({
  need,
  fallback = "/portal/admin/dashboard",
  children,
}: {
  need: keyof AdminPermissions;
  fallback?: string;
  children: ReactNode;
}) => {
  const { hasPermission } = useAuth();
  if (!hasPermission(need)) {
    return <Navigate to={fallback} replace />;
  }
  return <>{children}</>;
};

export default PermissionGuard;
