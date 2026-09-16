import { FolderKanban } from "lucide-react";
import { PostTypes } from "@/features/posts/interfaces/posts.interfaces";
import { PlatformGlyph } from "@/components/ui/platform-glyph";

interface FanCard {
  platform: (typeof PostTypes)[keyof typeof PostTypes];
  platformLabel: string;
  meta: string;
  lines: string[];
}

const CARDS: FanCard[] = [
  {
    platform: PostTypes.LINKEDIN,
    platformLabel: "LinkedIn",
    meta: "118 words",
    lines: ["We deleted our onboarding checklist last week.", "Signups were up 18% by Friday.", "Turns out the fastest path to activation was doing less of it, not more."],
  },
  {
    platform: PostTypes.TWITTER,
    platformLabel: "X",
    meta: "3 posts",
    lines: ["We killed our onboarding checklist.", "Signups: +18%.", "Less guidance, more friction removed."],
  },
  {
    platform: PostTypes.BLOG,
    platformLabel: "Blog",
    meta: "640 words",
    lines: ["Why we deleted our onboarding checklist", "Most onboarding is built to make the team feel useful, not to get people to value faster. Here's what happened when we removed ours."],
  },
];

export function ChannelFan() {
  return (
    <div className="relative animate-in fade-in slide-in-from-right-6 duration-700 fill-mode-both">
      <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-border bg-card px-3.5 py-2.5 shadow-[var(--shadow-card)]">
        <span className="flex h-6 w-6 flex-none items-center justify-center rounded-md bg-brass-soft text-brass-ink">
          <FolderKanban className="h-3.5 w-3.5" />
        </span>
        <span className="text-sm font-medium text-foreground">One idea: "the onboarding checklist we cut"</span>
      </div>

      <div className="relative border-l border-line-strong pl-6">
        {CARDS.map((card, i) => (
          <div
            key={card.platform}
            className="relative pb-5 last:pb-0 animate-in fade-in slide-in-from-right-4 fill-mode-both"
            style={{ animationDelay: `${150 + i * 140}ms`, animationDuration: "600ms" }}
          >
            <span className="absolute -left-[29px] top-5 h-2 w-2 rounded-full bg-brass ring-4 ring-background" aria-hidden />
            <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <PlatformGlyph platform={card.platform} />
                  {card.platformLabel}
                </span>
                <span className="text-xs text-muted-foreground">{card.meta}</span>
              </div>
              <div className="space-y-1 text-[13.5px] leading-relaxed text-foreground">
                {card.lines.map((line, li) => (
                  <p key={li}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
