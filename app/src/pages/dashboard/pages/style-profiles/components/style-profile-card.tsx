import { formatDistanceToNow } from "date-fns";
import { PlatformChip } from "@/components/ui/platform-glyph";
import { Badge } from "@/components/ui/badge";
import { StyleDnaStrand, StyleDnaLegend } from "@/components/ui/style-dna-strand";
import { getPostTypeLabel } from "@/config/constants/dropdowns/posts/post-type-form.options";
import { isStyleProfileAnalyzed } from "@/features/style-profiles/utils/style-profiles.utils";
import type { StyleProfile } from "@/features/style-profiles/interfaces/style-profiles.interfaces";

interface StyleProfileCardProps {
  profile: StyleProfile;
  onClick: () => void;
}

export function StyleProfileCard({ profile, onClick }: StyleProfileCardProps) {
  const analyzed = isStyleProfileAnalyzed(profile);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="h-7 w-7 flex-none rounded-full bg-gradient-to-br from-violet to-brass-ink" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{profile.name}</div>
            {profile.source_url && <div className="truncate text-xs text-muted-foreground">{profile.source_url}</div>}
          </div>
        </div>
        <PlatformChip platform={profile.platform} label={getPostTypeLabel(profile.platform)} />
      </div>

      <StyleDnaStrand traits={profile} className="h-2" />
      <StyleDnaLegend traits={profile} />

      <p className="line-clamp-3 text-sm text-muted-foreground">
        {analyzed ? profile.tone_description : "Not analyzed yet — add sample posts to build this profile's Style DNA."}
      </p>

      {profile.pillars.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {profile.pillars.map((pillar) => (
            <Badge key={pillar} variant="pill">
              {pillar}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{profile.posts_analyzed} posts analyzed</span>
        <span>Updated {formatDistanceToNow(new Date(profile.updated_at), { addSuffix: true })}</span>
      </div>
    </button>
  );
}
