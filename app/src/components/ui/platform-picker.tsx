import { Linkedin, Newspaper, Twitter, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PostTypes, type PostType } from "@/features/posts/interfaces/posts.interfaces";
import { SocialChannels, type SocialChannel } from "@/features/social-channel-connections/interfaces/social-channel-connections.interfaces";

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
};

interface PlatformPickerProps {
  value?: PostType;
  onChange: (value: PostType) => void;
  className?: string;
}

export function PlatformPicker({ value, onChange, className }: PlatformPickerProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-3", className)}>
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

const SOCIAL_CHANNELS: SocialChannel[] = [SocialChannels.LINKEDIN, SocialChannels.TWITTER];

interface ChannelMultiPickerProps {
  value: SocialChannel[];
  onChange: (value: SocialChannel[]) => void;
  className?: string;
}

// Multi-select variant of PlatformPicker, restricted to social channels
// (LinkedIn/Twitter) — used to pick a project's target channels for
// multi-channel generation, as opposed to the single content-type choice
// PlatformPicker makes.
export function ChannelMultiPicker({ value, onChange, className }: ChannelMultiPickerProps) {
  function toggle(channel: SocialChannel) {
    onChange(value.includes(channel) ? value.filter((c) => c !== channel) : [...value, channel]);
  }

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {SOCIAL_CHANNELS.map((channel) => {
        const meta = PLATFORM_META[channel];
        const Icon = meta.icon;
        const selected = value.includes(channel);

        return (
          <button
            key={channel}
            type="button"
            onClick={() => toggle(channel)}
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
