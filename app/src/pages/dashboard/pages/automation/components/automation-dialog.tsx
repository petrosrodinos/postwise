import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { AutomationFrequencies, AutomationOutputStages, type Automation } from "@/features/automations/interfaces/automations.interfaces";
import { useCreateAutomation, useUpdateAutomation } from "@/features/automations/hooks/use-automations";
import { AutomationFrequencyFormOptions } from "@/config/constants/dropdowns/automations/automation-frequency-form.options";
import { AutomationOutputStageFormOptions } from "@/config/constants/dropdowns/automations/automation-output-stage-form.options";
import { WeekdayOptions } from "@/config/constants/dropdowns/shared/weekday.options";
import { PostTypes } from "@/features/posts/interfaces/posts.interfaces";
import type { Project } from "@/features/projects/interfaces/projects.interfaces";
import { automationSchema, type AutomationFormData } from "../validation-schemas/automation.schema";

interface AutomationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  automation?: Automation | null;
  defaultProjectId?: string;
}

const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function AutomationDialog({ isOpen, onClose, projects, automation, defaultProjectId }: AutomationDialogProps) {
  const isEditing = !!automation;
  const { mutate: createAutomation, isPending: isCreating } = useCreateAutomation();
  const { mutate: updateAutomation, isPending: isUpdating } = useUpdateAutomation();
  const isPending = isCreating || isUpdating;

  const form = useForm<AutomationFormData>({
    resolver: zodResolver(automationSchema),
    defaultValues: {
      project_id: automation?.project_id ?? defaultProjectId ?? "",
      style_profile_id: automation?.style_profile_id ?? undefined,
      rss_feed_id: automation?.rss_feed_id ?? undefined,
      name: automation?.name ?? "",
      frequency: automation?.frequency ?? AutomationFrequencies.WEEKLY,
      days_of_week: automation?.days_of_week ?? [1],
      time_of_day: automation?.time_of_day ?? "09:00",
      timezone: automation?.timezone ?? browserTimezone,
      posts_per_run: automation?.posts_per_run ?? 3,
      output_stage: automation?.output_stage ?? AutomationOutputStages.DRAFT,
      generate_images: automation?.generate_images ?? false,
      image_count: automation?.image_count ?? 1,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        project_id: automation?.project_id ?? defaultProjectId ?? "",
        style_profile_id: automation?.style_profile_id ?? undefined,
        rss_feed_id: automation?.rss_feed_id ?? undefined,
        name: automation?.name ?? "",
        frequency: automation?.frequency ?? AutomationFrequencies.WEEKLY,
        days_of_week: automation?.days_of_week ?? [1],
        time_of_day: automation?.time_of_day ?? "09:00",
        timezone: automation?.timezone ?? browserTimezone,
        posts_per_run: automation?.posts_per_run ?? 3,
        output_stage: automation?.output_stage ?? AutomationOutputStages.DRAFT,
        generate_images: automation?.generate_images ?? false,
        image_count: automation?.image_count ?? 1,
      });
    }
  }, [isOpen, automation, defaultProjectId, form]);

  const selectedProjectId = form.watch("project_id");
  const selectedProject = projects.find((project) => project.id === selectedProjectId);
  const availableStyleProfiles = selectedProject?.style_profiles ?? [];
  const availableRssFeeds = selectedProject?.rss_feeds ?? [];
  const isBlogProject = selectedProject?.platform === PostTypes.BLOG;
  const frequency = form.watch("frequency");
  const generateImages = form.watch("generate_images");

  function handleClose() {
    if (isPending) return;
    onClose();
  }

  function onSubmit(data: AutomationFormData) {
    const dto = {
      ...data,
      style_profile_id: data.style_profile_id || undefined,
      rss_feed_id: data.rss_feed_id || undefined,
      days_of_week: data.frequency === AutomationFrequencies.WEEKLY ? data.days_of_week : undefined,
    };

    if (isEditing) {
      const { project_id, ...updateDto } = dto;
      updateAutomation({ id: automation!.id, dto: updateDto }, { onSuccess: onClose });
    } else {
      createAutomation(dto, { onSuccess: onClose });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit automation" : "New automation"}</DialogTitle>
          <DialogDescription>Runs on a schedule, generates from a project's context and a chosen Style DNA.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Automation name</FormLabel>
                  <FormControl>
                    <Input placeholder="Weekly LinkedIn drafts" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("style_profile_id", undefined);
                      form.setValue("rss_feed_id", undefined);
                    }}
                    disabled={isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="style_profile_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Style profile</FormLabel>
                  <Select value={field.value ?? "none"} onValueChange={(value) => field.onChange(value === "none" ? undefined : value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {availableStyleProfiles.map((link) => (
                        <SelectItem key={link.style_profile_id} value={link.style_profile_id}>
                          {link.style_profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isBlogProject && availableRssFeeds.length > 0 && (
              <FormField
                control={form.control}
                name="rss_feed_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RSS feed source</FormLabel>
                    <Select value={field.value ?? "none"} onValueChange={(value) => field.onChange(value === "none" ? undefined : value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Generate from ideas" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Generate from ideas</SelectItem>
                        {availableRssFeeds.map((link) => (
                          <SelectItem key={link.rss_feed_id} value={link.rss_feed_id}>
                            {link.rss_feed.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isBlogProject && (
              <div className="flex flex-col gap-3 rounded-lg border border-input p-3">
                <FormField
                  control={form.control}
                  name="generate_images"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
                      </FormControl>
                      <FormLabel className="font-normal">Generate AI cover image candidates for each post</FormLabel>
                    </FormItem>
                  )}
                />
                {generateImages && (
                  <FormField
                    control={form.control}
                    name="image_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image candidates</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={4}
                            value={field.value}
                            onChange={(event) => field.onChange(Number(event.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <div className="inline-flex rounded-lg border border-input p-1">
                    {AutomationFrequencyFormOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={cn(
                          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                          field.value === option.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                        )}
                        onClick={() => field.onChange(option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </FormItem>
              )}
            />

            {frequency === AutomationFrequencies.WEEKLY && (
              <FormField
                control={form.control}
                name="days_of_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days</FormLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {WeekdayOptions.map((day) => {
                        const active = field.value.includes(day.id);
                        return (
                          <button
                            key={day.id}
                            type="button"
                            className={cn(
                              "h-8 w-10 rounded-md border text-xs font-semibold transition-colors",
                              active ? "border-foreground bg-foreground text-background" : "border-input text-muted-foreground hover:text-foreground",
                            )}
                            onClick={() => field.onChange(active ? field.value.filter((d) => d !== day.id) : [...field.value, day.id].sort())}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="time_of_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time of day</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="posts_per_run"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posts per run</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={field.value}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="output_stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>When posts are generated</FormLabel>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-2">
                    {AutomationOutputStageFormOptions.map((option) => (
                      <Label
                        key={option.id}
                        htmlFor={`output-stage-${option.id}`}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal transition-colors",
                          field.value === option.id ? "border-brass bg-brass-soft" : "border-input",
                        )}
                      >
                        <RadioGroupItem value={option.id} id={`output-stage-${option.id}`} className="mt-1" />
                        <span>
                          <span className="block text-sm font-semibold">{option.label}</span>
                          <span className="block text-xs text-muted-foreground">{option.description}</span>
                        </span>
                      </Label>
                    ))}
                  </RadioGroup>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} loading={isPending}>
                {isEditing ? "Save changes" : "Create automation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
