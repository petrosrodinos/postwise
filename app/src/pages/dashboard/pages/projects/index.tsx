import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Routes } from "@/routes/routes";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { ProjectCard, ProjectCardSkeleton } from "@/pages/dashboard/components/project-card";
import { ProjectStatusTabs, type ProjectStatusFilter } from "./components/project-status-tabs";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ProjectStatusFilter>("all");

  const { data: projectsPage, isPending } = useProjects({
    limit: 100,
    ...(filter === "active" && { is_archived: false }),
    ...(filter === "archived" && { is_archived: true }),
  });

  const projects = projectsPage?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">Organize generation around a goal, audience and voice</p>
        </div>
        <Button onClick={() => navigate(Routes.dashboard.new_project)}>New project</Button>
      </div>

      <ProjectStatusTabs value={filter} onChange={setFilter} />

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <h3 className="text-base font-semibold text-foreground">
            {filter === "archived" ? "No archived projects" : "No projects yet"}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm">
            {filter === "archived"
              ? "Projects you archive will show up here."
              : "Create a project to organize AI generation around a goal, audience and voice."}
          </p>
          {filter !== "archived" && (
            <Button className="mt-4" onClick={() => navigate(Routes.dashboard.new_project)}>
              New project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
