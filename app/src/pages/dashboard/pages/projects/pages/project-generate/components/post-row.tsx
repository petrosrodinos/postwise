import { useEffect, useRef, useState } from "react";
import { DnaBadge } from "@/components/ui/dna-badge";
import { PostStatusTag } from "@/components/ui/post-status-tag";
import { PlatformChip } from "@/components/ui/platform-glyph";
import { PLATFORM_META } from "@/components/ui/platform-picker";
import { cn } from "@/lib/utils";
import { PostStatuses, PostTypes, type Post } from "@/features/posts/interfaces/posts.interfaces";
import type { ProjectStyleProfileLink } from "@/features/projects/interfaces/projects.interfaces";
import { PostEditorSheet } from "@/pages/dashboard/components/post-editor-sheet";

interface PostRowProps {
  post: Post;
  platform: (typeof PostTypes)[keyof typeof PostTypes];
  styleProfiles: ProjectStyleProfileLink[];
  highlighted?: boolean;
}

// One channel's post within an idea card — a full-width, clickable row (icon
// + title/snippet + status) so it stays readable at a glance instead of
// squeezed into a narrow column. Clicking opens the full editor in a side
// sheet (title/body/SEO/cover-image/revise).
export function PostRow({ post, platform, styleProfiles, highlighted }: PostRowProps) {
  const rowRef = useRef<HTMLButtonElement>(null);
  const [showHighlight, setShowHighlight] = useState(!!highlighted);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!highlighted) return;
    rowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timeout = setTimeout(() => setShowHighlight(false), 2500);
    return () => clearTimeout(timeout);
  }, [highlighted]);

  const isBlog = platform === PostTypes.BLOG;
  const styleProfile = styleProfiles.find((link) => link.style_profile_id === post.style_profile_id)?.style_profile;
  const previewTitle = isBlog ? post.title || "Untitled" : post.hook || post.body?.slice(0, 80) || "Untitled";
  const previewSnippet = isBlog ? post.excerpt || post.body?.replace(/<[^>]*>/g, " ").trim() : post.body;

  return (
    <>
      <button
        ref={rowRef}
        type="button"
        onClick={() => setIsExpanded(true)}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent/40",
          showHighlight && "ring-2 ring-inset ring-brass-ink",
        )}
      >
        <PlatformChip platform={platform} label={PLATFORM_META[platform].label} className="w-20 flex-none" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{previewTitle}</p>
          {previewSnippet && <p className="truncate text-xs text-muted-foreground">{previewSnippet}</p>}
        </div>
        {styleProfile && <DnaBadge name={styleProfile.name} className="hidden flex-none sm:inline-flex" />}
        <PostStatusTag
          status={post.status}
          title={post.status === PostStatuses.FAILED ? (post.failed_reason ?? undefined) : undefined}
          className="flex-none"
        />
      </button>

      <PostEditorSheet post={post} open={isExpanded} onOpenChange={setIsExpanded} styleProfileName={styleProfile?.name} />
    </>
  );
}
