import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ErrorPage } from "./components/ErrorPage";
import { LoginPage, RegisterPage, ProtectedRoute } from "./features/auth";
import { AboutPage } from "./pages/AboutPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { LandingPage } from "./pages/LandingPage";
import { lazyImport } from "./utils/lazyImport";
import { NavigationProgress } from "./components/NavigationProgress";

const DashboardPage = lazyImport(
  () => import("./features/dashboard"),
  "DashboardPage",
);
const DocumentsPage = lazyImport(
  () => import("./features/document"),
  "DocumentsPage",
);
const DocumentPage = lazyImport(
  () => import("./features/document"),
  "DocumentPage",
);
const SettingsPage = lazyImport(
  () => import("./features/user"),
  "SettingsPage",
);
const UserPage = lazyImport(() => import("./features/user"), "UserPage");
const JoinPage = lazyImport(() => import("./features/sharedLink"), "JoinPage");
const AccessRequestPage = lazyImport(
  () => import("./features/accessRequest"),
  "AccessRequestPage",
);

function RootLayout() {
  return (
    <>
      <NavigationProgress />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/join/:token", lazy: JoinPage },
      { path: "/document/:id/request-access", lazy: AccessRequestPage },
      {
        path: "/",
        element: <Layout />,
        errorElement: <ErrorPage />,
        children: [
          { index: true, element: <LandingPage /> },
          { path: "document/:id", lazy: DocumentPage },
          { path: "u/:username", lazy: UserPage },
          { path: "about", element: <AboutPage /> },
          {
            element: <ProtectedRoute />,
            children: [
              { path: "dashboard", lazy: DashboardPage },
              { path: "documents", lazy: DocumentsPage },
              { path: "settings", lazy: SettingsPage },
            ],
          },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
