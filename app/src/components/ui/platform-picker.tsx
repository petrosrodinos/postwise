import { Instagram, Linkedin, Newspaper, Twitter, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PostTypes, type PostType } from "@/features/posts/interfaces/posts.interfaces";

interface PlatformMeta {
  label: string;
  description: string;
  icon: LucideIcon;
  accentClassName: string;
}

export const PLATFORM_META: Record<PostType, PlatformMeta> = {
  [PostTypes.LINKEDIN]: {
    label: "LinkedIn",
    description: "Professional posts & thought leadership",
    icon: Linkedin,
    accentClassName: "border-[#0A66C2] bg-[#0A66C2]/[0.07] text-[#0A66C2]",
  },
  [PostTypes.TWITTER]: {
    label: "X",
    description: "Short-form threads & quick takes",
    icon: Twitter,
    accentClassName: "border-foreground bg-foreground/[0.06] text-foreground",
  },
  [PostTypes.BLOG]: {
    label: "Blog",
    description: "Long-form articles & SEO content",
    icon: Newspaper,
    accentClassName: "border-teal bg-teal/[0.08] text-teal",
  },
  [PostTypes.INSTAGRAM]: {
    label: "Instagram",
    description: "Visual posts & photo captions",
    icon: Instagram,
    accentClassName: "border-[#E1306C] bg-[#E1306C]/[0.07] text-[#E1306C]",
  },
};

interface PlatformPickerProps {
  value?: PostType;
  onChange: (value: PostType) => void;
  className?: string;
}

export function PlatformPicker({ value, onChange, className }: PlatformPickerProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {(Object.keys(PLATFORM_META) as PostType[]).map((id) => {
        const meta = PLATFORM_META[id];
        const Icon = meta.icon;
        const selected = value === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={selected}
            className={cn(
              "flex flex-col items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
              selected ? cn("shadow-sm", meta.accentClassName) : "border-border bg-card hover:border-foreground/25 hover:bg-accent/40",
            )}
          >
            <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-full", selected ? "bg-background/70" : "bg-muted text-foreground")}>
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">{meta.label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{meta.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

const ALL_OPTIONS: PostType[] = [PostTypes.LINKEDIN, PostTypes.TWITTER, PostTypes.BLOG, PostTypes.INSTAGRAM];

interface ContentChannelsPickerProps {
  value: PostType[];
  onChange: (value: PostType[]) => void;
  className?: string;
}

// Plain multi-select over every content channel a project can target —
// LinkedIn, X and Blog can all be picked together, fanning one AI batch's
// idea out across all of them (a Post row per channel, sharing the idea).
// Always keeps at least one channel selected.
export function ContentChannelsPicker({ value, onChange, className }: ContentChannelsPickerProps) {
  function toggle(option: PostType) {
    const isSelected = value.includes(option);
    const next = isSelected ? value.filter((c) => c !== option) : [...value, option];
    if (next.length === 0) return; // keep at least one channel selected

    onChange(next);
  }

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {ALL_OPTIONS.map((option) => {
        const meta = PLATFORM_META[option];
        const Icon = meta.icon;
        const selected = value.includes(option);

        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            aria-pressed={selected}
            className={cn(
              "flex flex-col items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
              selected ? cn("shadow-sm", meta.accentClassName) : "border-border bg-card hover:border-foreground/25 hover:bg-accent/40",
            )}
          >
            <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-full", selected ? "bg-background/70" : "bg-muted text-foreground")}>
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">{meta.label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{meta.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
