import type { PaginationQuery } from "@/interfaces/pagination.interfaces";

export const AiUsageTypes = {
  TEXT: "TEXT",
  IMAGE: "IMAGE",
} as const;
export type AiUsageType = (typeof AiUsageTypes)[keyof typeof AiUsageTypes];

export const AiUsageFeatures = {
  GENERATION_MULTI_CHANNEL_DRAFT: "GENERATION_MULTI_CHANNEL_DRAFT",
  GENERATION_RSS_DRAFT: "GENERATION_RSS_DRAFT",
  GENERATION_COVER_IMAGE: "GENERATION_COVER_IMAGE",
  POST_REVISE: "POST_REVISE",
  POST_REPURPOSE: "POST_REPURPOSE",
  TOOLS_REVISE: "TOOLS_REVISE",
  TOOLS_REPURPOSE: "TOOLS_REPURPOSE",
  TOOLS_TITLE_VARIATIONS: "TOOLS_TITLE_VARIATIONS",
  TOOLS_META_TAGS: "TOOLS_META_TAGS",
  TOOLS_IMAGE: "TOOLS_IMAGE",
  STYLE_PROFILE_ANALYZE: "STYLE_PROFILE_ANALYZE",
  PROJECT_GENERATE_DETAILS: "PROJECT_GENERATE_DETAILS",
  INTERNAL_PASSTHROUGH: "INTERNAL_PASSTHROUGH",
} as const;
export type AiUsageFeature = (typeof AiUsageFeatures)[keyof typeof AiUsageFeatures];

export interface AiUsageEvent {
  id: string;
  organisation_id: string | null;
  user: { id: string; name: string; email: string } | null;
  type: AiUsageType;
  feature: AiUsageFeature;
  provider: string;
  model: string;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  image_count: number | null;
  input_cost: number;
  output_cost: number;
  total_cost: number;
  generation_run_id: string | null;
  post_id: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface AiUsageQueryType extends PaginationQuery {
  type?: AiUsageType;
  feature?: AiUsageFeature;
  provider?: string;
  model?: string;
  user_id?: string;
  from?: string;
  to?: string;
}

export type AiUsageSummaryQueryType = Omit<AiUsageQueryType, "page" | "limit">;

export interface AiUsageBreakdownRow {
  count: number;
  total_cost: number;
}

export interface AiUsageSummary {
  total_cost: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  total_image_count: number;
  total_generations: number;
  by_feature: (AiUsageBreakdownRow & { feature: AiUsageFeature })[];
  by_type: (AiUsageBreakdownRow & { type: AiUsageType })[];
  by_provider: (AiUsageBreakdownRow & { provider: string })[];
}
