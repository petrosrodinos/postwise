import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_META } from "@/components/ui/platform-picker";
import { PostTypes, type PostType } from "@/features/posts/interfaces/posts.interfaces";
import type { SocialChannel } from "@/features/social-channel-connections/interfaces/social-channel-connections.interfaces";

interface ProjectPreviewCardProps {
  title: string;
  platform?: PostType;
  channels?: SocialChannel[];
  pillars: string[];
  ideasCount: number;
  instructionsCount: number;
  styleProfileCount: number;
  submitLabel: string;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function ProjectPreviewCard({
  title,
  platform,
  channels,
  pillars,
  ideasCount,
  instructionsCount,
  styleProfileCount,
  submitLabel,
  isSubmitting,
  onCancel,
}: ProjectPreviewCardProps) {
  const meta = platform ? PLATFORM_META[platform] : undefined;
  const Icon = meta?.icon;
  const isSocial = platform && platform !== PostTypes.BLOG;
  const channelMetas = isSocial && channels?.length ? channels.map((channel) => PLATFORM_META[channel]) : [];

  return (
    <div className="sticky top-20 flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground">Preview</p>
        <p className="mt-1 truncate text-lg font-semibold">{title || "Untitled project"}</p>
      </div>

      {channelMetas.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm">
          {channelMetas.map((channelMeta) => {
            const ChannelIcon = channelMeta.icon;
            return (
              <span key={channelMeta.label} className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${channelMeta.accentClassName}`}>
                <ChannelIcon className="h-3 w-3" />
                {channelMeta.label}
              </span>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm">
          {Icon ? (
            <span className={`inline-flex h-7 w-7 flex-none items-center justify-center rounded-full ${meta!.accentClassName}`}>
              <Icon className="h-3.5 w-3.5" />
            </span>
          ) : (
            <span className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-muted text-muted-foreground">?</span>
          )}
          <span className="font-medium">{isSocial ? "Choose at least one channel" : (meta?.label ?? "No platform chosen yet")}</span>
        </div>
      )}

      {pillars.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {pillars.map((pillar) => (
            <Badge key={pillar} variant="pill">
              {pillar}
            </Badge>
          ))}
        </div>
      )}

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <dt className="text-xs text-muted-foreground">Ideas</dt>
          <dd className="font-semibold">{ideasCount}</dd>
        </div>
        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <dt className="text-xs text-muted-foreground">Instructions</dt>
          <dd className="font-semibold">{instructionsCount}</dd>
        </div>
        <div className="col-span-2 rounded-lg bg-muted/50 px-3 py-2">
          <dt className="text-xs text-muted-foreground">Style profiles attached</dt>
          <dd className="font-semibold">{styleProfileCount}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
          <Sparkles className="h-4 w-4" />
          {submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
