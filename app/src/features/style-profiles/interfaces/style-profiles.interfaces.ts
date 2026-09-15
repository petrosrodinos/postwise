import type { PostType } from "@/features/posts/interfaces/posts.interfaces";

export interface StyleProfile {
  id: string;
  user_id?: string | null;
  organisation_id?: string | null;
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
  organisation_id?: string;
}

export type UpdateStyleProfileDto = Partial<Omit<CreateStyleProfileDto, "organisation_id">>;

export interface AnalyzeStyleProfileDto {
  sample_posts: string[];
}

export interface StyleProfilesQueryType {
  page?: number;
  limit?: number;
  organisation_id?: string;
  platform?: PostType;
}
