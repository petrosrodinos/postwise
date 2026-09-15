import { PlatformChip } from "@/components/ui/platform-glyph";
import { PLATFORM_META } from "@/components/ui/platform-picker";
import type { PostType } from "@/features/posts/interfaces/posts.interfaces";
import type { ProjectStyleProfileLink } from "@/features/projects/interfaces/projects.interfaces";
import type { GenerationItem } from "@/features/generation-runs/interfaces/generation-runs.interfaces";
import { GeneratedPostCard } from "./generated-post-card";

interface GenerationItemCardProps {
  item: GenerationItem;
  platform: PostType;
  styleProfiles: ProjectStyleProfileLink[];
  highlightedPostId?: string;
}

// Renders one generated idea. A BLOG idea always wraps exactly one post, so
// it renders exactly like before. A social idea wraps one post per target
// channel (e.g. LinkedIn + Twitter variants of the same idea) — those are
// grouped into a single card with a channel label above each variant.
export function GenerationItemCard({ item, platform, styleProfiles, highlightedPostId }: GenerationItemCardProps) {
  if (item.posts.length <= 1) {
    const post = item.posts[0];
    if (!post) return null;
    return (
      <GeneratedPostCard
        post={post}
        platform={platform}
        styleProfiles={styleProfiles}
        highlighted={post.id === highlightedPostId}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border/70 p-3 sm:col-span-2">
      {item.topic && <p className="px-1 text-sm font-semibold text-foreground">{item.topic}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {item.posts.map((post) => (
          <div key={post.id} className="flex flex-col gap-1.5">
            <PlatformChip platform={post.type} label={PLATFORM_META[post.type].label} className="px-1" />
            <GeneratedPostCard
              post={post}
              platform={post.type}
              styleProfiles={styleProfiles}
              highlighted={post.id === highlightedPostId}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
