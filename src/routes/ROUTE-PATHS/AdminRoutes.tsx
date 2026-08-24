// @ts-nocheck
import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import PortalLayout from "@/layout/PortalLayout";
import Loadable from "@/components/ui/Loadable";
import path from "path";
import WithDrawRequest from "@/app/Panel/ADMIN/WithDrawRequest/WithDrawRequest";
import RoleGuard from "@/routes/RoleGuard";
import PermissionGuard from "@/routes/PermissionGuard";
import { ROLE } from "@/constants/others";

const AdminDashboard = Loadable(
  lazy(() => import("@/app/Panel/ADMIN/Dashboard/Dashboard"))
);
const UserManagement = Loadable(
  lazy(() => import("@/app/Panel/ADMIN/UserManagement/UserManagement"))
);
const ReferralTreePage = Loadable(
  lazy(() => import("@/app/Panel/ADMIN/UserManagement/ReferralTreePage"))
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
const PromotionLogs = Loadable(
  lazy(() => import("@/app/Panel/ADMIN/PromotionLogs/PromotionLogs"))
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
const Offers = Loadable(lazy(() => import("@/app/Panel/ADMIN/Offers/Offers")));
const CompanyDocuments = Loadable(
  lazy(() => import("@/app/Panel/ADMIN/CompanyDocuments/CompanyDocuments"))
);
const SupportHelp = Loadable(
  lazy(() => import("@/app/Panel/ADMIN/SupportHelp/SupportHelp"))
);
const TermsAndConditions = Loadable(
  lazy(() => import("@/app/Panel/ADMIN/TermsAndConditions/TermsAndConditions"))
);
const Suggestions = Loadable(
  lazy(() => import("@/app/Panel/ADMIN/Suggestions/Suggestions"))
);
const BoxRequests = Loadable(
  lazy(() => import("@/app/Panel/ADMIN/BoxRequests/BoxRequests"))
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
    // Shared by both Super-Admin and Sub-Admin. The three per-feature pages
    // are wrapped in <PermissionGuard> so sub-admins without that specific
    // permission get bounced to the dashboard (backend also 403s their API).
    {
      path: "dashboard",
      element: <AdminDashboard />,
    },
    {
      path: "daily-videos",
      element: (
        <PermissionGuard need="daily_videos">
          <DailyVideos />
        </PermissionGuard>
      ),
    },
    {
      path: "promotion-videos",
      element: (
        <PermissionGuard need="promotion_videos">
          <PromotionVideos />
        </PermissionGuard>
      ),
    },
    {
      path: "promotion-logs",
      element: (
        <PermissionGuard need="promotion_videos">
          <PromotionLogs />
        </PermissionGuard>
      ),
    },
    {
      path: "pin-requests",
      element: (
        <PermissionGuard need="pin_requests">
          <PinRequests />
        </PermissionGuard>
      ),
    },
    {
      // Box fulfilment shares the pin_requests permission (same promoter team).
      path: "box-requests",
      element: (
        <PermissionGuard need="pin_requests">
          <BoxRequests />
        </PermissionGuard>
      ),
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
      // Drilldown from the User Management tree icon. Standalone page (not a
      // modal) since deep referral trees can render hundreds of nodes.
      path: "users/referral-tree/:userId",
      element: <SuperOnly><ReferralTreePage /></SuperOnly>,
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
    {
      path: "offers",
      element: <SuperOnly><Offers /></SuperOnly>,
    },
    {
      path: "company-documents",
      element: <SuperOnly><CompanyDocuments /></SuperOnly>,
    },
    {
      path: "support-help",
      element: <SuperOnly><SupportHelp /></SuperOnly>,
    },
    {
      path: "terms-and-conditions",
      element: <SuperOnly><TermsAndConditions /></SuperOnly>,
    },
    {
      path: "suggestions",
      element: (
        <PermissionGuard need="suggestions">
          <Suggestions />
        </PermissionGuard>
      ),
    },
  ],
};

export default AdminRoutes;
