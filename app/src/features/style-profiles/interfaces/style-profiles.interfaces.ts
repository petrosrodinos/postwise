import type { PostType } from "@/features/posts/interfaces/posts.interfaces";

export interface StyleProfile {
  id: string;
  organisation_id: string;
  name: string;
  platform: PostType;
  source_url?: string | null;
  posts_analyzed: number;
  tone_score?: number | null;
  structure_score?: number | null;
  hooks_score?: number | null;
  vocabulary_score?: number | null;
  rhythm_score?: number | null;
  tone_description?: string | null;
  dominant_hook?: string | null;
  vocabulary: string[];
  pillars: string[];
  last_analyzed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateStyleProfileDto {
  name: string;
  platform: PostType;
  source_url?: string;
  organisation_id: string;
}

export type UpdateStyleProfileDto = Partial<
  Omit<CreateStyleProfileDto, "organisation_id"> & {
    tone_score: number;
    structure_score: number;
    hooks_score: number;
    vocabulary_score: number;
    rhythm_score: number;
    tone_description: string;
    dominant_hook: string;
    vocabulary: string[];
    pillars: string[];
  }
>;

export interface AnalyzeStyleProfileDto {
  sample_posts: string[];
}

export type PostedLimit = "any" | "1h" | "24h" | "week" | "month" | "3months" | "6months" | "year";

export interface ScrapePostsDto {
  source_url?: string;
  // LinkedIn-only
  max_posts?: number;
  posted_limit?: PostedLimit;
  include_reposts?: boolean;
  include_quote_posts?: boolean;
  // Twitter/X-only
  results_limit?: number;
  skip_pinned_posts?: boolean;
}

export interface ScrapedPost {
  id: string;
  url?: string;
  text: string;
  posted_at?: string;
  author_name?: string;
  likes?: number;
  comments?: number;
}

export interface StyleProfilesQueryType {
  page?: number;
  limit?: number;
  organisation_id: string;
  platform?: PostType;
}
