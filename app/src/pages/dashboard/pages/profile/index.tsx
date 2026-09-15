import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Routes } from "@/routes/routes";
import { useMe } from "@/features/user/hooks/use-user";
import { useWorkspaceStore } from "@/stores/workspace";
import { generateInitials } from "@/features/auth/utils/auth.utils";
import { PersonalInfoForm } from "./components/personal-info-form";
import { ChangePasswordForm } from "./components/change-password-form";
import { ChannelConnectionsCard } from "@/pages/dashboard/components/channel-connections-card";

export default function ProfilePage() {
  const { data: user, isPending } = useMe();
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);

  return (
    <div className="flex flex-col gap-6">
      <Link to={Routes.dashboard.root} className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      {isPending || !user ? (
        <>
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>

          <div className="flex gap-1 rounded-lg bg-muted p-1" style={{ width: "fit-content" }}>
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-8 w-36 rounded-md" />
          </div>

          <div className="flex max-w-lg flex-col gap-5 rounded-2xl border border-border bg-card p-6">
            <Skeleton className="h-4 w-28" />
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
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">{generateInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold">My profile</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your personal info and password</p>
          </div>
        </div>
      )}

      {user && (
        <Tabs defaultValue="personal">
          <TabsList>
            <TabsTrigger value="personal">Personal info</TabsTrigger>
            <TabsTrigger value="password">Change password</TabsTrigger>
            <TabsTrigger value="channels">Connected channels</TabsTrigger>
          </TabsList>
          <TabsContent value="personal">
            <PersonalInfoForm user={user} />
          </TabsContent>
          <TabsContent value="password">
            <ChangePasswordForm />
          </TabsContent>
          <TabsContent value="channels" className="max-w-lg">
            {activeOrganisationId ? (
              <p className="text-sm text-muted-foreground">
                You're viewing this app as an organisation. Channels for that workspace are managed from{" "}
                <Link to={Routes.dashboard.settings} className="font-semibold text-brass-ink hover:underline">
                  Organisation settings
                </Link>
                .
              </p>
            ) : (
              <ChannelConnectionsCard title="Connected channels" description="Social accounts for your personal account." />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
