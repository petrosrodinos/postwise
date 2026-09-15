import type { Post } from "@/features/posts/interfaces/posts.interfaces";

// One generated idea within a run. For BLOG projects it always wraps exactly
// one post; for social projects it wraps one post per project channel (e.g.
// a LinkedIn version + a Twitter version of the same idea).
export interface GenerationItem {
  id: string;
  generation_run_id: string;
  order: number;
  topic?: string | null;
  created_at: string;
  posts: Post[];
}

export interface GenerationRun {
  id: string;
  project_id: string;
  style_profile_id?: string | null;
  automation_id?: string | null;
  label?: string | null;
  posts_requested?: number | null;
  language: string;
  created_at: string;
  items?: GenerationItem[];
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
