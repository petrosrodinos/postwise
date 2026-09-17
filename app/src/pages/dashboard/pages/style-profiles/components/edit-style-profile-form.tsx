import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagInput } from "@/components/ui/tag-input";
import { PostTypeFormOptions } from "@/config/constants/dropdowns/posts/post-type-form.options";
import { PostTypes } from "@/features/posts/interfaces/posts.interfaces";
import { useUpdateStyleProfile } from "@/features/style-profiles/hooks/use-style-profiles";
import type { StyleProfile } from "@/features/style-profiles/interfaces/style-profiles.interfaces";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  platform: z.enum([PostTypes.LINKEDIN, PostTypes.TWITTER, PostTypes.BLOG]),
  source_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  tone_score: z.number().min(0).max(100),
  structure_score: z.number().min(0).max(100),
  hooks_score: z.number().min(0).max(100),
  vocabulary_score: z.number().min(0).max(100),
  rhythm_score: z.number().min(0).max(100),
  tone_description: z.string(),
  dominant_hook: z.string(),
  vocabulary: z.array(z.string()),
  pillars: z.array(z.string()),
});

type FormData = z.infer<typeof schema>;

interface EditStyleProfileFormProps {
  profile: StyleProfile;
  onCancel: () => void;
  onSaved: () => void;
}

function buildDefaultValues(profile: StyleProfile): FormData {
  return {
    name: profile.name,
    platform: profile.platform,
    source_url: profile.source_url ?? "",
    tone_score: profile.tone_score ?? 0,
    structure_score: profile.structure_score ?? 0,
    hooks_score: profile.hooks_score ?? 0,
    vocabulary_score: profile.vocabulary_score ?? 0,
    rhythm_score: profile.rhythm_score ?? 0,
    tone_description: profile.tone_description ?? "",
    dominant_hook: profile.dominant_hook ?? "",
    vocabulary: profile.vocabulary,
    pillars: profile.pillars,
  };
}

export function EditStyleProfileForm({ profile, onCancel, onSaved }: EditStyleProfileFormProps) {
  const { mutate, isPending } = useUpdateStyleProfile();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultValues(profile),
  });

  const platform = form.watch("platform");
  const isBlog = platform === PostTypes.BLOG;

  function handleCancel() {
    if (isPending) return;
    onCancel();
  }

  function onSubmit(data: FormData) {
    mutate(
      {
        id: profile.id,
        dto: {
          name: data.name,
          platform: data.platform,
          source_url: data.source_url || undefined,
          tone_score: data.tone_score,
          structure_score: data.structure_score,
          hooks_score: data.hooks_score,
          vocabulary_score: data.vocabulary_score,
          rhythm_score: data.rhythm_score,
          tone_description: data.tone_description,
          dominant_hook: data.dominant_hook,
          vocabulary: data.vocabulary,
          pillars: data.pillars,
        },
      },
      { onSuccess: () => onSaved() },
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile name</FormLabel>
              <FormControl>
                <Input {...field} />
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
        <FormField
          control={form.control}
          name="source_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isBlog ? "RSS feed URL" : "Source URL"}</FormLabel>
              <FormControl>
                <Input placeholder={isBlog ? "https://example.com/feed.xml" : "linkedin.com/in/username"} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="border-t border-border pt-4">
          <div className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Style DNA</div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="tone_score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tone</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="structure_score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Structure</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hooks_score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hooks</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vocabulary_score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vocabulary</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rhythm_score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rhythm</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="tone_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tone & voice description</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="How this creator sounds and writes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dominant_hook"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Signature hook</FormLabel>
              <FormControl>
                <Input placeholder="e.g. A bold contrarian claim" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vocabulary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vocabulary & recurring phrases</FormLabel>
              <FormControl>
                <TagInput value={field.value} onChange={field.onChange} placeholder="Add a word or phrase and press Enter" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} loading={isPending}>
            Save changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
