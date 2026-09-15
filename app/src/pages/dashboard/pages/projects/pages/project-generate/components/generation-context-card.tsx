import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlatformGlyph } from "@/components/ui/platform-glyph";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { PostTypeFormOptions } from "@/config/constants/dropdowns/posts/post-type-form.options";
import { LanguageFormOptions } from "@/config/constants/dropdowns/generation-runs/language-form.options";
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
  onGenerate,
  isGenerating,
}: GenerationContextCardProps) {
  const styleProfiles = project.style_profiles ?? [];

  return (
    <div className="sticky top-20 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground">Generation context</p>
        <p className="mt-1 text-base font-semibold">{isExistingRun ? "Regenerate this batch" : "Set up this batch"}</p>
      </div>

      <div>
        <Label className="mb-1.5 block text-xs font-semibold text-foreground">Project</Label>
        <div className="flex h-9 items-center justify-between rounded-md border border-input bg-muted px-3 text-sm font-semibold">
          {project.title}
          <PlatformGlyph platform={project.platform} />
        </div>
      </div>

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

      {!isExistingRun && (
        <div>
          <Label className="mb-1.5 block text-xs font-semibold text-foreground">Number of posts</Label>
          <Input
            type="number"
            min={1}
            max={10}
            value={postsRequested}
            onChange={(e) => onPostsRequestedChange(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
          />
        </div>
      )}

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

      <div>
        <Label className="mb-1.5 block text-xs font-semibold text-foreground">Platform</Label>
        <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
          {getDropdownOptionLabel(PostTypeFormOptions, project.platform)}
        </div>
      </div>

      <Button className="mt-1 w-full" onClick={onGenerate} disabled={isGenerating} loading={isGenerating}>
        <Sparkles className="h-4 w-4" />
        {isExistingRun ? "Generate another batch" : "Generate posts"}
      </Button>
    </div>
  );
}
