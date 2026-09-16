import type { RevisePreset, RevisedPostDraft } from "@/features/posts/interfaces/posts.interfaces";

// Tools has its own content-type set, deliberately separate from the
// shared `PostType` used by Posts/Projects/Style Profiles: EMAIL is a
// Tools-only concept (a draftable content type with no real publishing
// integration) and must never become a valid Post/Project/Style Profile
// platform, so it's kept out of that shared type entirely.
export const ToolContentTypes = {
  TWITTER: "TWITTER",
  LINKEDIN: "LINKEDIN",
  BLOG: "BLOG",
  EMAIL: "EMAIL",
} as const;
export type ToolContentType = (typeof ToolContentTypes)[keyof typeof ToolContentTypes];

// Everything here is stateless: the user types content directly into the
// Tools page and these DTOs carry it straight to the AI endpoint on every
// call — nothing is persisted or fetched by id.
export interface ToolContent {
  organisation_id: string;
  type: ToolContentType;
  title?: string;
  hook?: string;
  body?: string;
  excerpt?: string;
}

export interface ReviseToolContentDto extends ToolContent {
  preset?: RevisePreset;
  instructions?: string;
}

export interface RepurposeToolContentDto extends ToolContent {
  target_types: ToolContentType[];
}

export interface RepurposedContentDraft extends RevisedPostDraft {
  seo_title?: string;
  seo_description?: string;
}

export interface RepurposeToolContentResult {
  type: ToolContentType;
  draft: RepurposedContentDraft;
}

export interface GenerateTitleVariationsDto extends ToolContent {
  style_profile_id?: string;
  count?: number;
  instructions?: string;
}

export type GenerateMetaTagsDto = ToolContent;

export interface MetaTagsDraft {
  seo_title: string;
  seo_description: string;
}

export interface GenerateToolImagesDto {
  organisation_id: string;
  prompt?: string;
  title?: string;
  body?: string;
  count: number;
  size?: "1024x1024" | "1024x1536" | "1536x1024";
}

export interface GeneratedImage {
  base64: string;
  mimeType: string;
}
