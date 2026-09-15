import type { PostStatus, PostType } from "@/features/posts/interfaces/posts.interfaces";
import type { StyleProfile } from "@/features/style-profiles/interfaces/style-profiles.interfaces";

export interface ProjectStyleProfileLink {
  id: string;
  project_id: string;
  style_profile_id: string;
  created_at: string;
  style_profile: StyleProfile;
}

export interface Project {
  id: string;
  user_id?: string | null;
  organisation_id?: string | null;
  title: string;
  description?: string | null;
  platform: PostType;
  pillars: string[];
  ideas: string[];
  instructions: string[];
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  style_profiles?: ProjectStyleProfileLink[];
  post_status_counts?: Partial<Record<PostStatus, number>>;
}

export interface CreateProjectDto {
  title: string;
  description?: string;
  platform: PostType;
  pillars?: string[];
  ideas?: string[];
  instructions?: string[];
  organisation_id?: string;
}

export type UpdateProjectDto = Partial<Omit<CreateProjectDto, "organisation_id">> & {
  is_archived?: boolean;
};

export interface AttachStyleProfileDto {
  style_profile_id: string;
}

export interface GenerateProjectDetailsDto {
  title: string;
  description?: string;
  platform?: PostType;
}

export interface ProjectAiSuggestions {
  pillars: string[];
  ideas: string[];
  instructions: string[];
}

export interface ProjectsQueryType {
  page?: number;
  limit?: number;
  organisation_id?: string;
  platform?: PostType;
  is_archived?: boolean;
}
