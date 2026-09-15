import { Dna, FileText, FolderKanban, LayoutDashboard, Repeat2, Rss, UserCircle, Building2 } from "lucide-react";
import { type SidebarData } from "../types";
import { Routes } from "@/routes/routes";
import { environments } from "@/config/environments";

export const dashboardSidebarData: SidebarData = {
  teams: [
    {
      name: environments.APP_NAME,
      logo: LayoutDashboard,
      plan: "",
    },
  ],
  navGroups: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          url: Routes.dashboard.root,
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Intelligence",
      items: [
        {
          title: "Style Profiles",
          url: Routes.dashboard.style_profiles,
          icon: Dna,
        },
        {
          title: "RSS Feeds",
          url: Routes.dashboard.rss_feeds,
          icon: Rss,
        },
      ],
    },
    {
      title: "Create",
      items: [
        {
          title: "Projects",
          url: Routes.dashboard.projects,
          icon: FolderKanban,
        },
        {
          title: "Posts",
          url: Routes.dashboard.posts,
          icon: FileText,
        },
      ],
    },
    {
      title: "Automate",
      items: [
        {
          title: "Automation",
          url: Routes.dashboard.automation,
          icon: Repeat2,
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          title: "My profile",
          url: Routes.dashboard.profile,
          icon: UserCircle,
        },
        {
          title: "Organisation",
          url: Routes.dashboard.settings,
          icon: Building2,
        },
      ],
    },
  ],
};
