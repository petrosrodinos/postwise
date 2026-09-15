import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Routes } from "@/routes/routes";
import { useWorkspaceStore } from "@/stores/workspace";
import { useOrganisation } from "@/features/organisations/hooks/use-organisations";
import { GeneralTab } from "./components/general-tab";
import { MembersTab } from "./components/members-tab";
import { ChannelConnectionsCard } from "@/pages/dashboard/components/channel-connections-card";

export default function SettingsPage() {
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);
  const { data: organisation, isPending } = useOrganisation(activeOrganisationId ?? undefined);

  if (!activeOrganisationId) {
    return (
      <div className="flex flex-col gap-4">
        <Link to={Routes.dashboard.root} className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <h3 className="text-base font-semibold text-foreground">No organisation selected</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm">
            You're on your personal account. Switch to an organisation from the sidebar to manage its settings, or create one from the workspace menu.
          </p>
          <Button className="mt-4" asChild>
            <Link to={Routes.dashboard.root}>Back to dashboard</Link>
          </Button>
        </div>
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
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
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
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <GeneralTab organisation={organisation} />
          </TabsContent>
          <TabsContent value="members">
            <MembersTab organisationId={organisation.id} />
          </TabsContent>
          <TabsContent value="channels" className="max-w-lg">
            <ChannelConnectionsCard title="Connected channels" description={`Social accounts for ${organisation.name}.`} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
