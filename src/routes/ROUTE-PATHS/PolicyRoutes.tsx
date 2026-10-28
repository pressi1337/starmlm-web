import { lazy } from "react";
import Loadable from "@/components/ui/Loadable";

// Public policy documents. Mounted for EVERY role (see AllRoutes) because a
// payment gateway reviewer reads them logged out, while a signed-in user
// should still be able to open them from the app.
const PolicyPage = Loadable(lazy(() => import("@/app/Policies/PolicyPage")));

const PolicyRoutes = [
  { path: "privacy-policy", element: <PolicyPage /> },
  { path: "refund-policy", element: <PolicyPage /> },
  { path: "shipping-policy", element: <PolicyPage /> },
  { path: "contact-us", element: <PolicyPage /> },
  { path: "terms-and-conditions", element: <PolicyPage /> },
];

export default PolicyRoutes;
