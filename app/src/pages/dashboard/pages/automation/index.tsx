import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Routes } from "@/routes/routes";
import { useAllAutomations } from "@/features/automations/hooks/use-automations";
import type { Automation } from "@/features/automations/interfaces/automations.interfaces";
import { AutomationCard } from "./components/automation-card";
import { AutomationDialog } from "./components/automation-dialog";

export default function AutomationPage() {
  const { data: automations, projects, isLoading } = useAllAutomations();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);

  const isDialogOpen = isCreateOpen || !!editingAutomation;

  function closeDialog() {
    setIsCreateOpen(false);
    setEditingAutomation(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Automation</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Each automation runs on a schedule, generates from a project's context and a chosen Style DNA, and lands in draft, review, or
            published — your call.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} disabled={projects.length === 0}>
          New automation
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <h3 className="text-base font-semibold text-foreground">Create a project first</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm">Automations generate content for a project on a schedule — you'll need one before you can automate anything.</p>
          <Button className="mt-4" asChild>
            <Link to={Routes.dashboard.projects}>New project</Link>
          </Button>
        </div>
      ) : automations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <h3 className="text-base font-semibold text-foreground">No automations yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm">Set up a recurring schedule to keep drafts flowing without manual generation.</p>
          <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
            New automation
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {projects
            .map((project) => ({ project, projectAutomations: automations.filter((automation) => automation.project_id === project.id) }))
            .filter(({ projectAutomations }) => projectAutomations.length > 0)
            .map(({ project, projectAutomations }) => (
              <div key={project.id} className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-muted-foreground">{project.title}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {projectAutomations.map((automation) => (
                    <AutomationCard key={automation.id} automation={automation} project={project} onEdit={() => setEditingAutomation(automation)} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      <AutomationDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        projects={projects}
        automation={editingAutomation}
        defaultProjectId={projects[0]?.id}
      />
    </div>
  );
}
