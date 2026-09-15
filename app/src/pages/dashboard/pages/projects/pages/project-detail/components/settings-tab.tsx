import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { useDeleteProject, useUpdateProject } from "@/features/projects/hooks/use-projects";
import { Routes } from "@/routes/routes";
import type { Project } from "@/features/projects/interfaces/projects.interfaces";

interface SettingsTabProps {
  project: Project;
}

export function SettingsTab({ project }: SettingsTabProps) {
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { mutate: archiveProject, isPending: isArchiving } = useUpdateProject();
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 640 }}>
      <Card>
        <CardContent className="flex flex-col gap-5 pt-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">{project.is_archived ? "Unarchive project" : "Archive project"}</div>
              <p className="text-xs text-muted-foreground">Hides this project from active views. Content is kept.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={isArchiving}
              onClick={() => archiveProject({ id: project.id, dto: { is_archived: !project.is_archived } })}
            >
              {project.is_archived ? "Unarchive" : "Archive"}
            </Button>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-destructive">Delete project</div>
              <p className="text-xs text-muted-foreground">Permanently deletes this project and its drafts.</p>
            </div>
            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-white" onClick={() => setIsDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() =>
          deleteProject(project.id, {
            onSuccess: () => navigate(Routes.dashboard.projects),
          })
        }
        title="Delete this project?"
        description="This permanently deletes the project and its drafts. This cannot be undone."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
