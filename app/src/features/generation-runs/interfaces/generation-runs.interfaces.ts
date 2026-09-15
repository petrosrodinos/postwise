import type { Post } from "@/features/posts/interfaces/posts.interfaces";

export interface GenerationRun {
  id: string;
  project_id: string;
  style_profile_id?: string | null;
  automation_id?: string | null;
  label?: string | null;
  posts_requested?: number | null;
  language: string;
  created_at: string;
  posts?: Post[];
}

export interface CreateGenerationRunDto {
  project_id: string;
  style_profile_id?: string;
  posts_requested?: number;
  label?: string;
  language?: string;
  generate_images?: boolean;
  image_count?: number;
}

export interface CreateRssGenerationRunDto {
  project_id: string;
  rss_feed_item_ids: string[];
  style_profile_id?: string;
  label?: string;
  language?: string;
  generate_images?: boolean;
  image_count?: number;
}

export interface AddPostsToGenerationRunDto {
  style_profile_id?: string;
  posts_requested?: number;
  language?: string;
  generate_images?: boolean;
  image_count?: number;
}

export interface GenerationRunsQueryType {
  page?: number;
  limit?: number;
  project_id?: string;
}
