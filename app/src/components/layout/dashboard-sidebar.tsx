import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { BrandMark } from "@/components/layout/brand-mark";
import { NavGroup } from "@/components/layout/nav-group";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";
import { dashboardSidebarData } from "./data/dashboard-sidebar-data";
import { environments } from "@/config/environments";
import { useActiveOrganisationRole } from "@/features/organisations/hooks/use-organisations";
import { OrganisationRoles } from "@/features/organisations/interfaces/organisations.interfaces";
import { Routes } from "@/routes/routes";

const CONNECTED_PLATFORMS = [
  { label: "LinkedIn", glyph: "in", active: true },
  { label: "X", glyph: "X", active: true },
  { label: "Blog", glyph: "B", active: true },
  { label: "Instagram — coming soon", glyph: "ig", active: false },
  { label: "Facebook — coming soon", glyph: "f", active: false },
];

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
        <div className="mb-1 flex items-center gap-2.5 px-2 pb-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <BrandMark size={30} />
          <div className="font-display text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            {environments.APP_NAME}
            <span className="text-brass">.</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {navGroups.map((group) => (
          <NavGroup key={group.title} {...group} />
        ))}
      </SidebarContent>
      <SidebarFooter className="gap-3 border-t border-sidebar-border pt-3.5">
        <div className="flex flex-wrap gap-1.5 px-2 group-data-[collapsible=icon]:hidden" title="Connected platforms">
          {CONNECTED_PLATFORMS.map((platform) => (
            <div
              key={platform.label}
              title={platform.label}
              className={
                platform.active
                  ? "flex h-[26px] w-[26px] flex-none items-center justify-center rounded-[7px] text-[10px] font-bold bg-brass-soft text-brass-ink"
                  : "flex h-[26px] w-[26px] flex-none items-center justify-center rounded-[7px] border border-sidebar-border bg-sidebar-accent text-[10px] font-bold text-sidebar-foreground/50"
              }
            >
              {platform.glyph}
            </div>
          ))}
        </div>
        <WorkspaceSwitcher />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
