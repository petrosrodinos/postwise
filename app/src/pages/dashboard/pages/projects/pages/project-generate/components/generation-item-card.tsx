import type { PostType } from "@/features/posts/interfaces/posts.interfaces";
import type { ProjectStyleProfileLink } from "@/features/projects/interfaces/projects.interfaces";
import type { GenerationItem } from "@/features/generation-runs/interfaces/generation-runs.interfaces";
import { PostRow } from "./post-row";

interface GenerationItemCardProps {
  item: GenerationItem;
  index: number;
  styleProfiles: ProjectStyleProfileLink[];
  highlightedPostId?: string;
}

// One generated idea, as a card: a title row identifying the idea, then one
// full-width row per channel post (LinkedIn/X/Blog) underneath — each row is
// its own clickable summary that opens the full editor. Keeps ideas visually
// grouped without cramming several channels' content side by side.
export function GenerationItemCard({ item, index, styleProfiles, highlightedPostId }: GenerationItemCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-2.5">
        <p className="truncate text-sm font-semibold text-foreground">{item.topic || `Idea ${index + 1}`}</p>
      </div>
      <div className="divide-y divide-border">
        {item.posts.map((post) => (
          <PostRow
            key={post.id}
            post={post}
            platform={post.type as PostType}
            styleProfiles={styleProfiles}
            highlighted={post.id === highlightedPostId}
          />
        ))}
      </div>
    </div>
  );
}
