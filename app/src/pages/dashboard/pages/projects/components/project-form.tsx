import type { UseFormReturn } from "react-hook-form";
import { Dna, Wand2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TagInput } from "@/components/ui/tag-input";
import { ChipListEditor } from "@/components/ui/chip-list-editor";
import { PlatformPicker } from "@/components/ui/platform-picker";
import { cn } from "@/lib/utils";
import { useGenerateProjectDetails } from "@/features/projects/hooks/use-projects";
import type { StyleProfile } from "@/features/style-profiles/interfaces/style-profiles.interfaces";
import type { CreateProjectFormData } from "@/pages/dashboard/validation-schemas/project.schema";
import { ProjectPreviewCard } from "./project-preview-card";

interface ProjectFormProps {
  form: UseFormReturn<CreateProjectFormData>;
  onSubmit: (data: CreateProjectFormData) => void;
  submitLabel: string;
  isSubmitting: boolean;
  onCancel: () => void;
  styleProfiles: StyleProfile[];
}

export function ProjectForm({ form, onSubmit, submitLabel, isSubmitting, onCancel, styleProfiles }: ProjectFormProps) {
  const { mutate: generateDetails, isPending: isGeneratingDetails } = useGenerateProjectDetails();

  const title = form.watch("title");
  const description = form.watch("description");
  const platform = form.watch("platform");
  const pillars = form.watch("pillars");
  const ideas = form.watch("ideas");
  const instructions = form.watch("instructions");
  const styleProfileIds = form.watch("style_profile_ids");

  async function handleGenerateWithAi() {
    const titleValid = await form.trigger("title");
    if (!titleValid) return;

    generateDetails(
      { title, description: description || undefined, platform },
      {
        onSuccess: (suggestions) => {
          form.setValue("pillars", suggestions.pillars, { shouldDirty: true });
          form.setValue("ideas", suggestions.ideas, { shouldDirty: true });
          form.setValue("instructions", suggestions.instructions, { shouldDirty: true });
        },
      },
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid items-start gap-6" style={{ gridTemplateColumns: "1fr 320px" }}>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basics</CardTitle>
              <CardDescription>What is this project for?</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
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
                      <Textarea rows={2} placeholder="Who is this for, and what's the goal?" {...field} />
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
                    <FormControl>
                      <PlatformPicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {styleProfiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Voice</CardTitle>
                <CardDescription>Optionally draft using one or more trained style profiles.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="style_profile_ids"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-wrap gap-2">
                        {styleProfiles.map((profile) => {
                          const selected = field.value.includes(profile.id);
                          return (
                            <button
                              key={profile.id}
                              type="button"
                              onClick={() =>
                                field.onChange(selected ? field.value.filter((id) => id !== profile.id) : [...field.value, profile.id])
                              }
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                                selected
                                  ? "border-violet bg-violet/10 text-violet"
                                  : "border-border bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground",
                              )}
                            >
                              <Dna className="h-3.5 w-3.5" />
                              {profile.name}
                            </button>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="text-base">Content strategy</CardTitle>
                <CardDescription>Pillars, ideas and ground rules the AI will draft from.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleGenerateWithAi} disabled={isGeneratingDetails} loading={isGeneratingDetails}>
                <Wand2 className="h-3.5 w-3.5" />
                Generate with AI
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
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
                      <ChipListEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Add a rough topic, angle or note"
                        emptyLabel="No ideas yet — add your own or generate some with AI."
                      />
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
                      <ChipListEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Add a rule the AI should always follow"
                        emptyLabel="No instructions yet — add your own or generate some with AI."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <ProjectPreviewCard
          title={title}
          platform={platform}
          pillars={pillars}
          ideasCount={ideas.length}
          instructionsCount={instructions.length}
          styleProfileCount={styleProfileIds.length}
          submitLabel={submitLabel}
          isSubmitting={isSubmitting}
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
}
