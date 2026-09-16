import type { PostStatus, PostType } from "@/features/posts/interfaces/posts.interfaces";
import type { StyleProfile } from "@/features/style-profiles/interfaces/style-profiles.interfaces";
import type { RssFeed } from "@/features/rss-feeds/interfaces/rss-feeds.interfaces";

export interface ProjectStyleProfileLink {
  id: string;
  project_id: string;
  style_profile_id: string;
  created_at: string;
  style_profile: StyleProfile;
}

export interface ProjectRssFeedLink {
  id: string;
  project_id: string;
  rss_feed_id: string;
  created_at: string;
  rss_feed: RssFeed;
}

export interface Project {
  id: string;
  organisation_id: string;
  title: string;
  description?: string | null;
  platform: PostType;
  channels: PostType[];
  pillars: string[];
  ideas: string[];
  instructions: string[];
  ai_directions?: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  style_profiles?: ProjectStyleProfileLink[];
  rss_feeds?: ProjectRssFeedLink[];
  post_status_counts?: Partial<Record<PostStatus, number>>;
}

export interface CreateProjectDto {
  title: string;
  description?: string;
  channels: PostType[];
  pillars?: string[];
  ideas?: string[];
  instructions?: string[];
  ai_directions?: string;
  organisation_id: string;
}

export type UpdateProjectDto = Partial<Omit<CreateProjectDto, "organisation_id">> & {
  is_archived?: boolean;
};

export interface AttachStyleProfileDto {
  style_profile_id: string;
}

export interface AttachRssFeedDto {
  rss_feed_id: string;
}

export interface GenerateProjectDetailsDto {
  title: string;
  description?: string;
  platform?: PostType;
  ai_directions?: string;
}

export interface ProjectAiSuggestions {
  pillars: string[];
  ideas: string[];
  instructions: string[];
}

export interface ProjectsQueryType {
  page?: number;
  limit?: number;
  organisation_id: string;
  platform?: PostType;
  is_archived?: boolean;
}
