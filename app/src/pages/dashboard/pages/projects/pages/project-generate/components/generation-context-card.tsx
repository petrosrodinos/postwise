import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlatformGlyph, PlatformChip } from "@/components/ui/platform-glyph";
import { PLATFORM_META } from "@/components/ui/platform-picker";
import { LanguageFormOptions } from "@/config/constants/dropdowns/generation-runs/language-form.options";
import { PostTypes } from "@/features/posts/interfaces/posts.interfaces";
import type { Project } from "@/features/projects/interfaces/projects.interfaces";

const NONE_VALUE = "__none__";

interface GenerationContextCardProps {
  project: Project;
  isExistingRun: boolean;
  styleProfileId: string;
  onStyleProfileChange: (value: string) => void;
  postsRequested: number;
  onPostsRequestedChange: (value: number) => void;
  language: string;
  onLanguageChange: (value: string) => void;
  generateImages: boolean;
  onGenerateImagesChange: (value: boolean) => void;
  imageCount: number;
  onImageCountChange: (value: number) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function GenerationContextCard({
  project,
  isExistingRun,
  styleProfileId,
  onStyleProfileChange,
  postsRequested,
  onPostsRequestedChange,
  language,
  onLanguageChange,
  generateImages,
  onGenerateImagesChange,
  imageCount,
  onImageCountChange,
  onGenerate,
  isGenerating,
}: GenerationContextCardProps) {
  const styleProfiles = project.style_profiles ?? [];
  const isBlog = project.platform === PostTypes.BLOG;
  const channels = isBlog ? [] : project.channels?.length ? project.channels : [project.platform];

  return (
    <div className="sticky top-20 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground">Generation context</p>
        <p className="mt-1 text-base font-semibold">{isExistingRun ? "Add to this batch" : "Set up this batch"}</p>
      </div>

      <div>
        <Label className="mb-1.5 block text-xs font-semibold text-foreground">Project</Label>
        <div className="flex h-9 items-center justify-between rounded-md border border-input bg-muted px-3 text-sm font-semibold">
          {project.title}
          <PlatformGlyph platform={project.platform} />
        </div>
      </div>

      {isBlog ? (
        <div>
          <Label className="mb-1.5 block text-xs font-semibold text-foreground">Style profile</Label>
          <Select value={styleProfileId || NONE_VALUE} onValueChange={(value) => onStyleProfileChange(value === NONE_VALUE ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="No style profile" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>No style profile</SelectItem>
              {styleProfiles.map((link) => (
                <SelectItem key={link.style_profile_id} value={link.style_profile_id}>
                  {link.style_profile.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div>
          <Label className="mb-1.5 block text-xs font-semibold text-foreground">Generating for</Label>
          <div className="flex flex-col gap-1.5 rounded-lg border border-input bg-muted/50 p-2.5">
            {channels.map((channel) => {
              const matchedProfile = styleProfiles.find((link) => link.style_profile.platform === channel)?.style_profile;
              return (
                <div key={channel} className="flex items-center justify-between gap-2 text-xs">
                  <PlatformChip platform={channel} label={PLATFORM_META[channel].label} />
                  <span className="truncate text-muted-foreground">{matchedProfile ? matchedProfile.name : "No style profile"}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <Label className="mb-1.5 block text-xs font-semibold text-foreground">{isExistingRun ? "Posts to add" : "Number of posts"}</Label>
        <Input
          type="number"
          min={1}
          max={10}
          value={postsRequested}
          onChange={(e) => onPostsRequestedChange(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
        />
      </div>

      <div>
        <Label className="mb-1.5 block text-xs font-semibold text-foreground">Language</Label>
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LanguageFormOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isBlog && (
        <div className="flex flex-col gap-3 rounded-lg border border-input p-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="generate-images"
              checked={generateImages}
              onCheckedChange={(checked) => onGenerateImagesChange(!!checked)}
            />
            <Label htmlFor="generate-images" className="text-sm font-normal">
              Generate AI cover image candidates
            </Label>
          </div>
          {generateImages && (
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-foreground">Image candidates</Label>
              <Input
                type="number"
                min={1}
                max={4}
                value={imageCount}
                onChange={(e) => onImageCountChange(Math.min(4, Math.max(1, Number(e.target.value) || 1)))}
              />
            </div>
          )}
        </div>
      )}

      <Button className="mt-1 w-full" onClick={onGenerate} disabled={isGenerating} loading={isGenerating}>
        <Sparkles className="h-4 w-4" />
        {isExistingRun ? "Add posts to batch" : "Generate posts"}
      </Button>
    </div>
  );
}
