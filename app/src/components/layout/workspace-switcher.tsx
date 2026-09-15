import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Check, ChevronsUpDown, Plus, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth";
import { useWorkspaceStore } from "@/stores/workspace";
import { useOrganisations } from "@/features/organisations/hooks/use-organisations";
import { generateInitials } from "@/features/auth/utils/auth.utils";
import { Routes } from "@/routes/routes";
import { CreateOrganisationDialog } from "./create-organisation-dialog";

const MENU_ITEM_CLASSES = "gap-2.5 rounded-[7px] px-2 py-2 text-[13px] font-medium text-[#C7CAD3] focus:bg-sidebar-accent focus:text-sidebar-foreground [&>svg]:size-4";

export function WorkspaceSwitcher() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const navigate = useNavigate();
  const { full_name, logout } = useAuthStore();
  const { data: organisations = [] } = useOrganisations();
  const { active_organisation_id, active_organisation_name, setActiveWorkspace } = useWorkspaceStore();

  const activeName = active_organisation_id ? (active_organisation_name ?? "Organisation") : (full_name ?? "Personal account");
  const activeKind = active_organisation_id ? "Organisation" : "Personal account";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="gap-2.5 rounded-md p-2 text-sidebar-foreground hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-foreground"
            >
              <Avatar className="h-[30px] w-[30px] rounded-full">
                <AvatarFallback className="rounded-full bg-gradient-to-br from-violet to-brass-ink text-xs font-bold text-white">{generateInitials(activeName)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-[13px] font-semibold text-sidebar-foreground">{activeName}</span>
                <span className="truncate text-[11.5px] text-sidebar-foreground/60">{activeKind}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-3.5 text-sidebar-foreground/60" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-64 border-sidebar-border bg-sidebar p-1.5 text-sidebar-foreground shadow-[0_12px_40px_-8px_rgba(20,18,10,0.35)]" align="start" side="top" sideOffset={8}>
            <DropdownMenuLabel className="px-2 pb-1 pt-1 text-[10.5px] font-bold uppercase tracking-wide text-sidebar-foreground/50">Workspaces</DropdownMenuLabel>
            <DropdownMenuItem className={MENU_ITEM_CLASSES} onClick={() => setActiveWorkspace(null)}>
              <User />
              <span className="flex-1 truncate">{full_name ?? "Personal account"}</span>
              {!active_organisation_id && <Check className="size-3.5 text-brass" />}
            </DropdownMenuItem>
            {organisations.map((organisation) => (
              <DropdownMenuItem key={organisation.id} className={MENU_ITEM_CLASSES} onClick={() => setActiveWorkspace({ id: organisation.id, name: organisation.name })}>
                <Building2 />
                <span className="flex-1 truncate">{organisation.name}</span>
                {active_organisation_id === organisation.id && <Check className="size-3.5 text-brass" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="my-1.5 bg-sidebar-border" />
            <DropdownMenuItem className={MENU_ITEM_CLASSES} onClick={() => navigate(Routes.dashboard.profile)}>
              My profile
            </DropdownMenuItem>
            {active_organisation_id && (
              <DropdownMenuItem className={MENU_ITEM_CLASSES} onClick={() => navigate(Routes.dashboard.settings)}>
                Organisation settings
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className={MENU_ITEM_CLASSES} onClick={() => setIsCreateOpen(true)}>
              <Plus />
              New organisation
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1.5 bg-sidebar-border" />
            <DropdownMenuItem className={`${MENU_ITEM_CLASSES} text-destructive focus:bg-destructive/15 focus:text-destructive`} onClick={() => logout()}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <CreateOrganisationDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </SidebarMenu>
  );
}
