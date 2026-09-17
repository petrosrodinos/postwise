import { AiUsageFeatures, type AiUsageFeature } from "@/features/ai-usage/interfaces/ai-usage.interfaces";

export const AiUsageFeatureFilterOptions: { id: AiUsageFeature | "all"; label: string }[] = [
  { id: "all", label: "All features" },
  { id: AiUsageFeatures.GENERATION_MULTI_CHANNEL_DRAFT, label: "Generated post drafts" },
  { id: AiUsageFeatures.GENERATION_RSS_DRAFT, label: "Generated RSS drafts" },
  { id: AiUsageFeatures.GENERATION_COVER_IMAGE, label: "Generated cover images" },
  { id: AiUsageFeatures.POST_REVISE, label: "Revised post" },
  { id: AiUsageFeatures.POST_REPURPOSE, label: "Repurposed post" },
  { id: AiUsageFeatures.TOOLS_REVISE, label: "Tools: revise" },
  { id: AiUsageFeatures.TOOLS_REPURPOSE, label: "Tools: repurpose" },
  { id: AiUsageFeatures.TOOLS_TITLE_VARIATIONS, label: "Tools: title variations" },
  { id: AiUsageFeatures.TOOLS_META_TAGS, label: "Tools: meta tags" },
  { id: AiUsageFeatures.TOOLS_IMAGE, label: "Tools: image" },
  { id: AiUsageFeatures.STYLE_PROFILE_ANALYZE, label: "Analyzed style profile" },
  { id: AiUsageFeatures.PROJECT_GENERATE_DETAILS, label: "Generated project details" },
  { id: AiUsageFeatures.INTERNAL_PASSTHROUGH, label: "Internal admin request" },
];

export function getAiUsageFeatureLabel(feature: AiUsageFeature | string): string {
  return AiUsageFeatureFilterOptions.find((option) => option.id === feature)?.label ?? feature;
}
