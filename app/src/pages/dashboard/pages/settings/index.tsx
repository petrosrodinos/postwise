import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Routes } from "@/routes/routes";
import { useWorkspaceStore } from "@/stores/workspace";
import { useActiveOrganisationRole, useOrganisation } from "@/features/organisations/hooks/use-organisations";
import { OrganisationRoles } from "@/features/organisations/interfaces/organisations.interfaces";
import { GeneralTab } from "./components/general-tab";
import { MembersTab } from "./components/members-tab";
import { ActivityTab } from "./components/activity-tab";
import { IntegrationsCard } from "@/pages/dashboard/components/integrations-card";

export default function SettingsPage() {
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);
  const { data: organisation, isPending } = useOrganisation(activeOrganisationId ?? undefined);
  const { role } = useActiveOrganisationRole();
  // Regular members can only see the org-wide Activity feed — General,
  // Members and Integrations are management tabs restricted to Owner/Admin.
  const isMember = role === OrganisationRoles.MEMBER;

  if (!activeOrganisationId) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link to={Routes.dashboard.root} className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      {isPending || !organisation ? (
        <>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>

          <div className="flex gap-1 rounded-lg bg-muted p-1" style={{ width: "fit-content" }}>
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>

          <div className="flex max-w-lg flex-col gap-5 rounded-2xl border border-border bg-card p-6">
            <Skeleton className="h-4 w-24" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <Skeleton className="h-9 w-24 self-end rounded-md" />
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{organisation.name}</h1>
              <Badge>Organisation</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Private workspace for your brand-level content</p>
          </div>
        </div>
      )}

      {organisation && (
        <Tabs defaultValue={isMember ? "activity" : "general"}>
          <TabsList>
            {!isMember && <TabsTrigger value="general">General</TabsTrigger>}
            {!isMember && <TabsTrigger value="members">Members</TabsTrigger>}
            {!isMember && <TabsTrigger value="integrations">Integrations</TabsTrigger>}
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          {!isMember && (
            <TabsContent value="general">
              <GeneralTab organisation={organisation} />
            </TabsContent>
          )}
          {!isMember && (
            <TabsContent value="members">
              <MembersTab organisationId={organisation.id} />
            </TabsContent>
          )}
          {!isMember && (
            <TabsContent value="integrations">
              <IntegrationsCard title="Connected integrations" description={`External destinations for ${organisation.name}.`} />
            </TabsContent>
          )}
          <TabsContent value="activity">
            <ActivityTab organisationId={organisation.id} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
