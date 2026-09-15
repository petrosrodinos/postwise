import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlatformGlyph } from "@/components/ui/platform-glyph";
import { useProject } from "@/features/projects/hooks/use-projects";
import { Routes } from "@/routes/routes";
import { OverviewTab } from "./components/overview-tab";
import { GenerationsTab } from "./components/generations-tab";
import { SettingsTab } from "./components/settings-tab";

type TabValue = "overview" | "generations" | "settings";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<TabValue>("overview");
  const { data: project, isPending } = useProject(id);

  if (isPending) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-4 w-24" />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Skeleton className="mt-1.5 h-6 w-6 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
        </div>

        <div className="flex gap-1 rounded-lg bg-muted p-1" style={{ width: "fit-content" }}>
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
          <div className="flex flex-col gap-6">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted-foreground">This project couldn't be found.</p>
        <Link to={Routes.dashboard.projects} className="text-sm font-semibold text-brass-ink hover:underline">
          ← All projects
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link to={Routes.dashboard.projects} className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        All projects
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <PlatformGlyph platform={project.platform} className="mt-1.5 h-6 w-6 text-xs" />
          <div>
            <h1 className="text-2xl font-semibold">{project.title}</h1>
            {project.description && <p className="mt-1 max-w-xl text-sm text-muted-foreground">{project.description}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={Routes.dashboard.project_edit(project.id)}>Edit project</Link>
          </Button>
          <Button asChild>
            <Link to={Routes.dashboard.project_generate(project.id)}>New generation</Link>
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as TabValue)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="generations">Generations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab project={project} onViewAllPosts={() => setTab("generations")} />
        </TabsContent>
        <TabsContent value="generations">
          <GenerationsTab project={project} />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab project={project} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
