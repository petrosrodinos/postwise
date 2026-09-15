import { cn } from "@/lib/utils";
import { PostTypes, type PostType } from "@/features/posts/interfaces/posts.interfaces";

const PLATFORM_GLYPH: Record<PostType, { label: string; className: string }> = {
  [PostTypes.LINKEDIN]: { label: "in", className: "bg-[#0A66C2] text-white" },
  [PostTypes.TWITTER]: { label: "X", className: "bg-[var(--ink-950)] text-white" },
  [PostTypes.BLOG]: { label: "B", className: "bg-teal text-white" },
};

interface PlatformGlyphProps {
  platform: PostType;
  className?: string;
}

export function PlatformGlyph({ platform, className }: PlatformGlyphProps) {
  const glyph = PLATFORM_GLYPH[platform];
  return (
    <span
      className={cn("inline-flex h-[18px] w-[18px] flex-none items-center justify-center rounded-[5px] text-[9px] font-extrabold", glyph.className, className)}
      aria-hidden
    >
      {glyph.label}
    </span>
  );
}

interface PlatformChipProps extends PlatformGlyphProps {
  label: string;
}

export function PlatformChip({ platform, label, className }: PlatformChipProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground", className)}>
      <PlatformGlyph platform={platform} />
      {label}
    </span>
  );
}
