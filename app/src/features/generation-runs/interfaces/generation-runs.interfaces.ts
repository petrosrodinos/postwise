import type { Post } from "@/features/posts/interfaces/posts.interfaces";

export interface GenerationRun {
  id: string;
  project_id: string;
  style_profile_id?: string | null;
  automation_id?: string | null;
  label?: string | null;
  posts_requested?: number | null;
  created_at: string;
  posts?: Post[];
}

export interface CreateGenerationRunDto {
  project_id: string;
  style_profile_id?: string;
  posts_requested?: number;
  label?: string;
}

export interface GenerationRunsQueryType {
  page?: number;
  limit?: number;
  project_id?: string;
}
