import { Linkedin, Mail, Newspaper, Twitter, type LucideIcon } from "lucide-react";
import { ToolContentTypes, type ToolContentType } from "@/features/tools/interfaces/tools.interfaces";

interface ToolContentTypeMeta {
  label: string;
  icon: LucideIcon;
  accentClassName: string;
}

// Tools-local metadata, deliberately not shared with the app-wide
// PLATFORM_META (which is keyed by PostType and has no EMAIL entry).
export const TOOL_CONTENT_TYPE_META: Record<ToolContentType, ToolContentTypeMeta> = {
  [ToolContentTypes.LINKEDIN]: {
    label: "LinkedIn",
    icon: Linkedin,
    accentClassName: "border-[#0A66C2] bg-[#0A66C2]/[0.07] text-[#0A66C2]",
  },
  [ToolContentTypes.TWITTER]: {
    label: "X",
    icon: Twitter,
    accentClassName: "border-foreground bg-foreground/[0.06] text-foreground",
  },
  [ToolContentTypes.BLOG]: {
    label: "Blog",
    icon: Newspaper,
    accentClassName: "border-teal bg-teal/[0.08] text-teal",
  },
  [ToolContentTypes.EMAIL]: {
    label: "Email",
    icon: Mail,
    accentClassName: "border-violet bg-violet/[0.08] text-violet",
  },
};

export const TOOL_CONTENT_TYPE_OPTIONS: ToolContentType[] = [
  ToolContentTypes.LINKEDIN,
  ToolContentTypes.TWITTER,
  ToolContentTypes.BLOG,
  ToolContentTypes.EMAIL,
];
