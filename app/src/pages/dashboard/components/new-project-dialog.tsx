import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TagInput } from "@/components/ui/tag-input";
import { PostTypeFormOptions } from "@/config/constants/dropdowns/posts/post-type-form.options";
import { useAttachStyleProfile, useCreateProject } from "@/features/projects/hooks/use-projects";
import { useStyleProfiles } from "@/features/style-profiles/hooks/use-style-profiles";
import { Routes } from "@/routes/routes";
import { createProjectSchema, linesToArray, type CreateProjectFormData } from "../validation-schemas/project.schema";

interface NewProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewProjectDialog({ isOpen, onClose }: NewProjectDialogProps) {
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateProject();
  const { mutate: attachStyleProfile } = useAttachStyleProfile();
  const { data: styleProfilesPage } = useStyleProfiles({ limit: 100 });
  const styleProfiles = styleProfilesPage?.data ?? [];

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      platform: undefined,
      style_profile_ids: [],
      pillars: [],
      ideas: "",
      instructions: "",
    },
  });

  function handleClose() {
    if (isPending) return;
    form.reset();
    onClose();
  }

  function onSubmit(data: CreateProjectFormData) {
    mutate(
      {
        title: data.title,
        description: data.description || undefined,
        platform: data.platform,
        pillars: data.pillars,
        ideas: linesToArray(data.ideas),
        instructions: linesToArray(data.instructions),
      },
      {
        onSuccess: (project) => {
          for (const styleProfileId of data.style_profile_ids) {
            attachStyleProfile({ id: project.id, dto: { style_profile_id: styleProfileId } });
          }
          form.reset();
          onClose();
          navigate(Routes.dashboard.project_detail(project.id));
        },
      },
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Organize generation around a goal, audience and voice.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project title</FormLabel>
                  <FormControl>
                    <Input placeholder="Q3 thought leadership" {...field} />
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
                    <Textarea rows={2} placeholder="What is this project for?" {...field} />
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
                        <SelectValue placeholder="Choose a platform" />
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
            {styleProfiles.length > 0 && (
              <FormField
                control={form.control}
                name="style_profile_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Style profile(s)</FormLabel>
                    <div className="flex flex-col gap-2 rounded-md border border-input p-3">
                      {styleProfiles.map((profile) => {
                        const checked = field.value.includes(profile.id);
                        return (
                          <Label key={profile.id} className="flex cursor-pointer items-center gap-2 text-sm font-normal">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) =>
                                field.onChange(value ? [...field.value, profile.id] : field.value.filter((id) => id !== profile.id))
                              }
                            />
                            {profile.name}
                          </Label>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="pillars"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content pillars</FormLabel>
                  <FormControl>
                    <TagInput value={field.value} onChange={field.onChange} placeholder="Add a pillar and press Enter" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ideas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ideas</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="One idea per line — rough topics, angles or notes to draw from" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="One rule per line — rules the AI should always follow" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} loading={isPending}>
                Create project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
