import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { PostTypeFormOptions } from "@/config/constants/dropdowns/posts/post-type-form.options";
import { useDeleteProject, useUpdateProject } from "@/features/projects/hooks/use-projects";
import { Routes } from "@/routes/routes";
import type { Project } from "@/features/projects/interfaces/projects.interfaces";
import { projectSettingsSchema, type ProjectSettingsFormData } from "../validation-schemas/project-settings.schema";

interface SettingsTabProps {
  project: Project;
}

export function SettingsTab({ project }: SettingsTabProps) {
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { mutate: updateProject, isPending: isSaving } = useUpdateProject();
  const { mutate: archiveProject, isPending: isArchiving } = useUpdateProject();
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

  const form = useForm<ProjectSettingsFormData>({
    resolver: zodResolver(projectSettingsSchema),
    defaultValues: {
      title: project.title,
      description: project.description ?? "",
      platform: project.platform,
    },
  });

  function onSubmit(data: ProjectSettingsFormData) {
    updateProject({ id: project.id, dto: { title: data.title, description: data.description || undefined, platform: data.platform } });
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 640 }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PostTypeFormOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Button type="submit" disabled={isSaving} loading={isSaving}>
                  Save changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

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
