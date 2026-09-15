// Canonical content-type enum — also reused as the "platform" for
// StyleProfile and Project (all three share the same LinkedIn/X/Blog space).
export const PostTypes = {
  TWITTER: "TWITTER",
  LINKEDIN: "LINKEDIN",
  BLOG: "BLOG",
} as const;
export type PostType = (typeof PostTypes)[keyof typeof PostTypes];

export const PostStatuses = {
  DRAFT: "DRAFT",
  REVIEW: "REVIEW",
  READY: "READY",
  SCHEDULED: "SCHEDULED",
  PUBLISHING: "PUBLISHING",
  PUBLISHED: "PUBLISHED",
  FAILED: "FAILED",
} as const;
export type PostStatus = (typeof PostStatuses)[keyof typeof PostStatuses];

export const PostChannelStatuses = {
  PENDING: "PENDING",
  SCHEDULED: "SCHEDULED",
  PUBLISHING: "PUBLISHING",
  PUBLISHED: "PUBLISHED",
  FAILED: "FAILED",
} as const;
export type PostChannelStatus = (typeof PostChannelStatuses)[keyof typeof PostChannelStatuses];

export interface Post {
  id: string;
  user_id: string;
  organisation_id: string;
  project_id?: string | null;
  style_profile_id?: string | null;
  generation_run_id?: string | null;
  source_post_id?: string | null;
  type: PostType;
  status: PostStatus;
  hook?: string | null;
  body?: string | null;
  title?: string | null;
  excerpt?: string | null;
  cover_document_id?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_url?: string | null;
  metadata?: Record<string, unknown> | null;
  scheduled_at?: string | null;
  published_at?: string | null;
  failed_reason?: string | null;
  created_at: string;
  updated_at: string;
  attachments?: PostAttachment[];
  channels?: PostChannel[];
}

export interface PostAttachment {
  id: string;
  post_id: string;
  document_id: string;
  order: number;
  created_at: string;
}

export interface PostChannel {
  id: string;
  post_id: string;
  channel_connection_id: string;
  status: PostChannelStatus;
  external_post_id?: string | null;
  external_post_url?: string | null;
  published_at?: string | null;
  failed_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePostDto {
  type: PostType;
  organisation_id: string;
  project_id?: string;
  style_profile_id?: string;
  hook?: string;
  body?: string;
  title?: string;
  excerpt?: string;
  cover_document_id?: string;
  seo_title?: string;
  seo_description?: string;
  canonical_url?: string;
  metadata?: Record<string, unknown>;
}

export type UpdatePostDto = Partial<Omit<CreatePostDto, "type" | "organisation_id">> & {
  status?: typeof PostStatuses.DRAFT | typeof PostStatuses.REVIEW | typeof PostStatuses.READY;
};

export interface SchedulePostDto {
  scheduled_at: string;
  channel_connection_ids?: string[];
}

export interface RepurposePostDto {
  target_types: PostType[];
}

export interface AddPostAttachmentDto {
  document_id: string;
  order?: number;
}

export interface AddPostChannelDto {
  channel_connection_id: string;
}

export interface PostsQueryType {
  page?: number;
  limit?: number;
  organisation_id: string;
  project_id?: string;
  status?: PostStatus;
  type?: PostType;
}
