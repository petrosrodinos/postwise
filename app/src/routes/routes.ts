export const Routes = {
  auth: {
    sign_in: "/auth/sign-in",
    sign_up: "/auth/sign-up",
  },
  admin: {
    health: "/admin/health",
    users: "/admin/users",
    alerts: "/admin/alerts",
  },
  dashboard: {
    root: "/dashboard",
    projects: "/dashboard/projects",
    new_project: "/dashboard/projects/new",
    project_detail: (id: string) => `/dashboard/projects/${id}`,
    project_edit: (id: string) => `/dashboard/projects/${id}/edit`,
    project_generate: (id: string) => `/dashboard/projects/${id}/generate`,
    style_profiles: "/dashboard/style-profiles",
    automation: "/dashboard/automation",
    settings: "/dashboard/settings",
    profile: "/dashboard/profile",
  },
};
