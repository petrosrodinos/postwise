import { Link } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { BrandMark } from "@/components/layout/brand-mark";
import { NavGroup } from "@/components/layout/nav-group";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";
import { dashboardSidebarData } from "./data/dashboard-sidebar-data";
import { environments } from "@/config/environments";
import { useActiveOrganisationRole } from "@/features/organisations/hooks/use-organisations";
import { OrganisationRoles } from "@/features/organisations/interfaces/organisations.interfaces";
import { Routes } from "@/routes/routes";

export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { role } = useActiveOrganisationRole();
  const isOrgMember = role === OrganisationRoles.MEMBER;

  const navGroups = dashboardSidebarData.navGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => !(isOrgMember && "url" in item && item.url === Routes.dashboard.settings)),
  }));

  return (
    <Sidebar collapsible="icon" className="group-data-[side=left]:border-r-0" {...props}>
      <SidebarHeader className="gap-0 px-2 pb-0 pt-3">
        <Link
          to="/"
          className="mb-1 flex items-center gap-2.5 rounded-md px-2 pb-4 transition-opacity hover:opacity-80 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <BrandMark size={30} />
          <div className="font-display text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            {environments.APP_NAME}
            <span className="text-brass">.</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {navGroups.map((group) => (
          <NavGroup key={group.title} {...group} />
        ))}
      </SidebarContent>
      <SidebarFooter className="gap-3 border-t border-sidebar-border pt-3.5">
        <WorkspaceSwitcher />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
