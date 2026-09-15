import { Routes, Route, Navigate } from "react-router-dom";
import { Routes as RoutePaths } from "@/routes/routes";
import ProtectedRoute from "@/routes/protected-route";
import SignIn from "@/pages/auth/pages/sign-in";
import SignUp from "@/pages/auth/pages/sign-up";
import AcceptInvite from "@/pages/auth/pages/accept-invite";
import AuthLayout from "@/pages/auth/layout";
import AdminLayout from "@/pages/admin/layout";
import AdminHealthPage from "@/pages/admin/pages/health";
import DashboardLayout from "@/pages/dashboard/layout";
import DashboardHomePage from "@/pages/dashboard/pages/home";
import ProjectsPage from "@/pages/dashboard/pages/projects";
import NewProjectPage from "@/pages/dashboard/pages/projects/pages/new-project";
import EditProjectPage from "@/pages/dashboard/pages/projects/pages/edit-project";
import ProjectDetailPage from "@/pages/dashboard/pages/projects/pages/project-detail";
import ProjectGeneratePage from "@/pages/dashboard/pages/projects/pages/project-generate";
import StyleProfilesPage from "@/pages/dashboard/pages/style-profiles";
import PostsPage from "@/pages/dashboard/pages/posts";
import RssFeedsPage from "@/pages/dashboard/pages/rss-feeds";
import AutomationPage from "@/pages/dashboard/pages/automation";
import SettingsPage from "@/pages/dashboard/pages/settings";
import ProfilePage from "@/pages/dashboard/pages/profile";
import { RoleTypes } from "@/features/user/interfaces/user.interface";

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <ProtectedRoute loggedIn={false}>
            <AuthLayout />
          </ProtectedRoute>
        }
      >
        <Route path="sign-up" element={<SignUp />} />
        <Route path="sign-in" element={<SignIn />} />
        <Route path="accept-invite" element={<AcceptInvite />} />
        <Route index element={<Navigate to="/auth/sign-in" replace />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute loggedIn={true} requiredRoles={[RoleTypes.ADMIN, RoleTypes.SUPER_ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="health" element={<AdminHealthPage />} />
        <Route index element={<Navigate to={RoutePaths.admin.health} replace />} />
      </Route>

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute loggedIn={true}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHomePage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/new" element={<NewProjectPage />} />
        <Route path="projects/:id/edit" element={<EditProjectPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="projects/:id/generate" element={<ProjectGeneratePage />} />
        <Route path="style-profiles" element={<StyleProfilesPage />} />
        <Route path="posts" element={<PostsPage />} />
        <Route path="rss-feeds" element={<RssFeedsPage />} />
        <Route path="automation" element={<AutomationPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="/" element={<Navigate to={RoutePaths.dashboard.root} replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
