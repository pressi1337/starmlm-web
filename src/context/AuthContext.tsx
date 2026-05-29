import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/CustomAxios";
import { API_AUTH_USER } from "@/utils/http/apiPaths";
import Lib from "@/utils/Lib";
import { useGetCall, useQueryParams } from "@/hooks";
import { SERVICE } from "@/constants/services";
import { ROLE } from "@/constants/others";

// This frontend is the admin-only console. End users belong on the PWA.
// Both Super-Admin (0) and Sub-Admin (1) are allowed in here; per-page guards
// inside AdminRoutes restrict the sub-admin to a subset of pages.
const ALLOWED_ROLES: number[] = [ROLE.SUPER_ADMIN, ROLE.SUB_ADMIN];

export type AdminPermissions = {
  daily_videos: boolean;
  promotion_videos: boolean;
  pin_requests: boolean;
  suggestions: boolean;
};

interface User {
  id: string;
  username: string;
  role: number;
  permissions?: AdminPermissions;
  [key: string]: unknown;
}

export type JwtPayload = {
  [key: string]: any;
};
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  role?: number | null;
  permissions: AdminPermissions;
  hasPermission: (key: keyof AdminPermissions) => boolean;
  logout: () => void;
  login: (token: string | undefined | null) => void;
}

const FULL_PERMISSIONS: AdminPermissions = {
  daily_videos: true,
  promotion_videos: true,
  pin_requests: true,
  suggestions: true,
};

const NO_PERMISSIONS: AdminPermissions = {
  daily_videos: false,
  promotion_videos: false,
  pin_requests: false,
  suggestions: false,
};

// Normalize the permissions claim from the JWT into a strict boolean map.
// Sub-admin: read from token; default to all-false if missing (defensive).
// Super-admin: always full access.
// Anyone else: no admin permissions.
const derivePermissions = (decoded: JwtPayload | null): AdminPermissions => {
  if (!decoded) return NO_PERMISSIONS;
  if (decoded.role === ROLE.SUPER_ADMIN) return FULL_PERMISSIONS;
  if (decoded.role !== ROLE.SUB_ADMIN) return NO_PERMISSIONS;
  const claim = decoded.permissions ?? {};
  return {
    daily_videos: !!claim.daily_videos,
    promotion_videos: !!claim.promotion_videos,
    pin_requests: !!claim.pin_requests,
    suggestions: !!claim.suggestions,
  };
};

// Create context with initial undefined (will throw if used outside provider)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to consume the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { navigate } = useQueryParams();
  const [role, setRole] = useState<number | null>(null);
  const [permissions, setPermissions] = useState<AdminPermissions>(NO_PERMISSIONS);

  const [user, setUser] = useState<User | null>(() => {
    return null;
  });

  useEffect(() => {
    let token: string | null | undefined = Lib.getCookies("session-token");
    let decordToken: JwtPayload = token ? Lib.DecodeJwt(token) : null;
    const hasDecodedRole = !!token && decordToken?.role !== undefined;
    if (hasDecodedRole && ALLOWED_ROLES.includes(decordToken.role)) {
      setUpUserData(decordToken);
    } else {
      if (hasDecodedRole) {
        // Stale non-admin session was kicking around — surface why we're logging them out.
        toast.error("This portal is for administrators only.");
      }
      logout();
    }
  }, []);

  const setUpUserData = (decordToken: any) => {
    const perms = derivePermissions(decordToken);
    setRole(decordToken?.role);
    setPermissions(perms);
    setUser((prv) => ({
      name: decordToken?.username,
      id: decordToken?.id,
      username: decordToken?.username,
      role: decordToken?.role,
      permissions: perms,
    }));
    setIsLoading(false);
  };

  // Function to handle logout
  const logout = (redirect: boolean = false) => {
    setIsLoading(false);
    setRole(null);
    setPermissions(NO_PERMISSIONS);
    Lib.removeCookies("session-token");
  };

  const login = (token: string | undefined | null) => {
    let decordToken: JwtPayload = token ? Lib.DecodeJwt(token) : null;
    if (!token || decordToken?.role === undefined) {
      logout();
      return;
    }
    if (!ALLOWED_ROLES.includes(decordToken.role)) {
      toast.error("This portal is for administrators only.");
      logout();
      return;
    }
    Lib.setCookies({
      name: "session-token",
      value: token,
      exp: decordToken?.exp ? Lib.expiredSec(decordToken?.exp ?? 1) : 1,
    });
    setUpUserData(decordToken);
    navigate.push("/portal/admin/dashboard");
  };

  const hasPermission = (key: keyof AdminPermissions): boolean => {
    if (role === ROLE.SUPER_ADMIN) return true;
    return permissions[key] === true;
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    role,
    permissions,
    hasPermission,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
