import type { Document } from "@/features/documents/interfaces/documents.interfaces";

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

export const PostIntegrationStatuses = {
  PENDING: "PENDING",
  PUBLISHING: "PUBLISHING",
  PUBLISHED: "PUBLISHED",
  FAILED: "FAILED",
} as const;
export type PostIntegrationStatus = (typeof PostIntegrationStatuses)[keyof typeof PostIntegrationStatuses];

export const PostSources = {
  MANUAL: "MANUAL",
  GENERATED: "GENERATED",
  AUTOMATION: "AUTOMATION",
  REPURPOSED: "REPURPOSED",
} as const;
export type PostSource = (typeof PostSources)[keyof typeof PostSources];

export interface Post {
  id: string;
  user_id: string;
  organisation_id: string;
  project_id?: string | null;
  style_profile_id?: string | null;
  generation_run_id?: string | null;
  generation_item_id?: string | null;
  source_post_id?: string | null;
  rss_feed_item_id?: string | null;
  automation_id?: string | null;
  automation?: { id: string; name: string } | null;
  project?: { id: string; title: string } | null;
  generation_run?: { id: string; label?: string | null; created_at: string; project_id: string } | null;
  generation_item?: { id: string; topic?: string | null; order: number } | null;
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
  integrations?: PostIntegration[];
}

export interface PostAttachment {
  id: string;
  post_id: string;
  document_id: string;
  order: number;
  created_at: string;
  document?: Document;
}

export interface PostIntegration {
  id: string;
  post_id: string;
  integration_id: string;
  status: PostIntegrationStatus;
  external_id?: string | null;
  external_url?: string | null;
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
}

export interface RepurposePostDto {
  target_types: PostType[];
}

export const RevisePresets = {
  FRIENDLIER: "FRIENDLIER",
  MORE_FORMAL: "MORE_FORMAL",
  LESS_FORMAL: "LESS_FORMAL",
  SHORTER: "SHORTER",
  LONGER: "LONGER",
  SIMPLIFY: "SIMPLIFY",
  PUNCHIER: "PUNCHIER",
  FIX_GRAMMAR: "FIX_GRAMMAR",
  HUMANIZE: "HUMANIZE",
} as const;
export type RevisePreset = (typeof RevisePresets)[keyof typeof RevisePresets];

export interface RevisePostDto {
  preset?: RevisePreset;
  instructions?: string;
}

export interface RevisedPostDraft {
  hook?: string;
  body: string;
  title?: string;
  excerpt?: string;
}

export interface AddPostAttachmentDto {
  document_id: string;
  order?: number;
}

export interface PostsQueryType {
  page?: number;
  limit?: number;
  organisation_id: string;
  project_id?: string;
  status?: PostStatus;
  type?: PostType;
  search?: string;
  automation_id?: string;
  source?: PostSource;
  order_by?: "created_at" | "updated_at" | "scheduled_at";
  order_direction?: "asc" | "desc";
}
