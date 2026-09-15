import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { type NavCollapsible, type NavItem, type NavLink, type NavGroup } from "./types";
import { Link, useLocation } from "react-router-dom";

const NAV_ITEM_CLASSES =
  "gap-2.5 rounded-[6px] px-2.5 py-2 text-[13.5px] font-medium text-[#C7CAD3] hover:text-sidebar-accent-foreground data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-[inset_2px_0_0_var(--brass)]";

export function NavGroup({ title, items }: NavGroup) {
  const { state } = useSidebar();
  const location = useLocation();
  return (
    <SidebarGroup className="mt-4 px-2 first:mt-1">
      <SidebarGroupLabel className="h-auto px-2.5 pb-1.5 text-[11px] font-semibold text-[var(--ink-text-lo)]">{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item: any) => {
          const key = `${item.title}-${item.url}`;

          if (!item.items) return <SidebarMenuLink key={key} item={item} href={location.pathname} />;

          if (state === "collapsed") return <SidebarMenuCollapsedDropdown key={key} item={item} href={location.pathname} />;

          return <SidebarMenuCollapsible key={key} item={item} href={location.pathname} />;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

const NavBadge = ({ children }: { children: ReactNode }) => (
  <Badge className="ml-auto rounded-full border-transparent bg-[var(--ink-line)] px-1.5 py-0 text-[10.5px] font-semibold text-[var(--ink-text-lo)] shadow-none hover:bg-[var(--ink-line)]">{children}</Badge>
);

const SidebarMenuLink = ({ item, href }: { item: NavLink; href: string }) => {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={checkIsActive(href, item)} tooltip={item.title} className={NAV_ITEM_CLASSES}>
        <Link to={item.url} onClick={() => setOpenMobile(false)}>
          {item.icon && <item.icon className="opacity-85" />}
          <span>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const SidebarMenuCollapsible = ({ item, href }: { item: NavCollapsible; href: string }) => {
  const { setOpenMobile } = useSidebar();
  return (
    <Collapsible asChild defaultOpen={checkIsActive(href, item, true)} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title} className={NAV_ITEM_CLASSES}>
            {item.icon && <item.icon className="opacity-85" />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub className="border-sidebar-border">
            {item.items.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton asChild isActive={checkIsActive(href, subItem)} className="rounded-[6px] text-[#C7CAD3] hover:text-sidebar-accent-foreground data-[active=true]:text-sidebar-accent-foreground">
                  <Link to={subItem.url} onClick={() => setOpenMobile(false)}>
                    {subItem.icon && <subItem.icon className="opacity-85" />}
                    <span>{subItem.title}</span>
                    {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

const SidebarMenuCollapsedDropdown = ({ item, href }: { item: NavCollapsible; href: string }) => {
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton tooltip={item.title} isActive={checkIsActive(href, item)} className={NAV_ITEM_CLASSES}>
            {item.icon && <item.icon className="opacity-85" />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={4}>
          <DropdownMenuLabel>
            {item.title} {item.badge ? `(${item.badge})` : ""}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items.map((sub) => (
            <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
              <Link to={sub.url} className={`${checkIsActive(href, sub) ? "bg-secondary" : ""}`}>
                {sub.icon && <sub.icon />}
                <span className="max-w-52 text-wrap">{sub.title}</span>
                {sub.badge && <span className="ml-auto text-xs">{sub.badge}</span>}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

function checkIsActive(href: string, item: NavItem, mainNav = false) {
  return (
    href === item.url || // /endpint?search=param
    href.split("?")[0] === item.url || // endpoint
    !!item?.items?.filter((i) => i.url === href).length || // if child nav is active
    (mainNav && href.split("/")[1] !== "" && href.split("/")[1] === item?.url?.split("/")[1])
  );
}
