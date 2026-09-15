import type { CSSProperties } from "react";
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Header } from "@/components/layout/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout() {
  return (
    <SidebarProvider style={{ "--sidebar-width": "248px" } as CSSProperties}>
      <DashboardSidebar />
      <SidebarInset>
        <Header fixed />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
