// @ts-nocheck
import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import PortalLayout from "@/layout/PortalLayout";
import Loadable from "@/components/ui/Loadable";
import path from "path";
import WithDrawRequest from "@/app/Panel/ADMIN/WithDrawRequest/WithDrawRequest";
import RoleGuard from "@/routes/RoleGuard";
import { ROLE } from "@/constants/others";

const AdminDashboard = Loadable(
  lazy(() => import("@/app/Panel/ADMIN/Dashboard/Dashboard"))
);
const UserManagement = Loadable(
  lazy(() => import("@/app/Panel/ADMIN/UserManagement/UserManagement"))
);
const YoutubeChannels = Loadable(
  lazy(() => import("@/app/Panel/ADMIN/YoutubeChannels/YoutubeChannels"))
);
const TrainingVideos = Loadable(
  lazy(() => import("@/app/Panel/ADMIN/TrainingVideos/TrainingVideos"))
);
const DailyVideos = Loadable(
  lazy(() => import("@/app/Panel/ADMIN/DailyVideos/DailyVideos"))
);
const PromotionVideos = Loadable(
  lazy(() => import("@/app/Panel/ADMIN/PromotionVideos/PromotionVideos"))
);
const ReferralSettings = Loadable(
  lazy(() => import("@/app/Panel/ADMIN/ReferralSettings/ReferralSettings"))
);
const PinRequests = Loadable(
  lazy(() => import("@/app/Panel/ADMIN/PinRequests/PinRequests"))
);
const UserProfile = Loadable(
  lazy(() => import("@/app/Panel/ADMIN/ProfileSettings/Profile"))
);
const SubAdminManagement = Loadable(
  lazy(() => import("@/app/Panel/ADMIN/SubAdminManagement/SubAdminManagement"))
);

// Sub-Admin (role=1) is allowed only on these pages; the rest are wrapped in
// <RoleGuard allow={[ROLE.SUPER_ADMIN]}> so direct URL access bounces them.
const SuperOnly = ({ children }) => (
  <RoleGuard allow={[ROLE.SUPER_ADMIN]}>{children}</RoleGuard>
);

const AdminRoutes = {
  path: "portal/admin",
  element: <PortalLayout />,
  children: [
    // Shared by both Super-Admin and Sub-Admin
    {
      path: "dashboard",
      element: <AdminDashboard />,
    },
    {
      path: "daily-videos",
      element: <DailyVideos />,
    },
    {
      path: "promotion-videos",
      element: <PromotionVideos />,
    },
    {
      path: "pin-requests",
      element: <PinRequests />,
    },
    {
      path: "profile-settings",
      element: <UserProfile />,
    },

    // Super-Admin only
    {
      path: "users",
      element: <SuperOnly><UserManagement /></SuperOnly>,
    },
    {
      path: "sub-admins",
      element: <SuperOnly><SubAdminManagement /></SuperOnly>,
    },
    {
      path: "youtube-channels",
      element: <SuperOnly><YoutubeChannels /></SuperOnly>,
    },
    {
      path: "training-videos",
      element: <SuperOnly><TrainingVideos /></SuperOnly>,
    },
    {
      path: "referral-settings",
      element: <SuperOnly><ReferralSettings /></SuperOnly>,
    },
    {
      path: "withdraw-request",
      element: <SuperOnly><WithDrawRequest /></SuperOnly>,
    },
  ],
};

export default AdminRoutes;
