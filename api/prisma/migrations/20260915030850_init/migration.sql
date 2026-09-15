-- CreateEnum
CREATE TYPE "AuthRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN', 'SUPPORT');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('LOGO', 'BANNER', 'IMAGE', 'VIDEO', 'AUDIO', 'PDF', 'DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('TWITTER', 'LINKEDIN', 'BLOG');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'REVIEW', 'READY', 'SCHEDULED', 'PUBLISHING', 'PUBLISHED', 'FAILED');

-- CreateEnum
CREATE TYPE "SocialChannel" AS ENUM ('TWITTER', 'LINKEDIN');

-- CreateEnum
CREATE TYPE "SocialChannelConnectionStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'EXPIRED', 'ERROR');

-- CreateEnum
CREATE TYPE "PostChannelStatus" AS ENUM ('PENDING', 'SCHEDULED', 'PUBLISHING', 'PUBLISHED', 'FAILED');

-- CreateEnum
CREATE TYPE "OrganisationRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "AutomationFrequency" AS ENUM ('DAILY', 'WEEKDAYS', 'WEEKLY');

-- CreateEnum
CREATE TYPE "AutomationOutputStage" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISH');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" "AuthRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "user_uuid" TEXT,
    "organisation_id" TEXT,
    "filename" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL DEFAULT 'LOGO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisation_members" (
    "id" TEXT NOT NULL,
    "organisation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "OrganisationRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organisation_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_channel_connections" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "organisation_id" TEXT,
    "channel" "SocialChannel" NOT NULL,
    "status" "SocialChannelConnectionStatus" NOT NULL DEFAULT 'CONNECTED',
    "external_account_id" TEXT NOT NULL,
    "external_account_name" TEXT,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_channel_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "style_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "organisation_id" TEXT,
    "name" TEXT NOT NULL,
    "platform" "PostType" NOT NULL,
    "source_url" TEXT,
    "posts_analyzed" INTEGER NOT NULL DEFAULT 0,
    "tone_score" INTEGER,
    "structure_score" INTEGER,
    "hooks_score" INTEGER,
    "vocabulary_score" INTEGER,
    "rhythm_score" INTEGER,
    "tone_description" TEXT,
    "dominant_hook" TEXT,
    "vocabulary" TEXT[],
    "pillars" TEXT[],
    "last_analyzed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "style_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "organisation_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "platform" "PostType" NOT NULL,
    "pillars" TEXT[],
    "ideas" TEXT[],
    "instructions" TEXT[],
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_style_profiles" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "style_profile_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_style_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generation_runs" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "style_profile_id" TEXT,
    "automation_id" TEXT,
    "label" TEXT,
    "posts_requested" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automations" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "style_profile_id" TEXT,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "frequency" "AutomationFrequency" NOT NULL DEFAULT 'WEEKLY',
    "days_of_week" INTEGER[],
    "time_of_day" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "posts_per_run" INTEGER NOT NULL DEFAULT 1,
    "output_stage" "AutomationOutputStage" NOT NULL DEFAULT 'DRAFT',
    "last_run_at" TIMESTAMP(3),
    "next_run_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "organisation_id" TEXT,
    "project_id" TEXT,
    "style_profile_id" TEXT,
    "generation_run_id" TEXT,
    "source_post_id" TEXT,
    "type" "PostType" NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "hook" TEXT,
    "body" TEXT,
    "metadata" JSONB,
    "title" TEXT,
    "excerpt" TEXT,
    "cover_document_id" TEXT,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "canonical_url" TEXT,
    "scheduled_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "failed_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_attachments" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_channels" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "channel_connection_id" TEXT NOT NULL,
    "status" "PostChannelStatus" NOT NULL DEFAULT 'PENDING',
    "external_post_id" TEXT,
    "external_post_url" TEXT,
    "published_at" TIMESTAMP(3),
    "failed_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_channels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_id_idx" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_uuid_idx" ON "password_reset_tokens"("user_uuid");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "documents_user_uuid_idx" ON "documents"("user_uuid");

-- CreateIndex
CREATE INDEX "documents_organisation_id_idx" ON "documents"("organisation_id");

-- CreateIndex
CREATE INDEX "documents_id_idx" ON "documents"("id");

-- CreateIndex
CREATE UNIQUE INDEX "organisations_slug_key" ON "organisations"("slug");

-- CreateIndex
CREATE INDEX "organisations_created_by_user_id_idx" ON "organisations"("created_by_user_id");

-- CreateIndex
CREATE INDEX "organisations_slug_idx" ON "organisations"("slug");

-- CreateIndex
CREATE INDEX "organisation_members_organisation_id_idx" ON "organisation_members"("organisation_id");

-- CreateIndex
CREATE INDEX "organisation_members_user_id_idx" ON "organisation_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "organisation_members_organisation_id_user_id_key" ON "organisation_members"("organisation_id", "user_id");

-- CreateIndex
CREATE INDEX "social_channel_connections_user_id_idx" ON "social_channel_connections"("user_id");

-- CreateIndex
CREATE INDEX "social_channel_connections_organisation_id_idx" ON "social_channel_connections"("organisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "social_channel_connections_channel_external_account_id_key" ON "social_channel_connections"("channel", "external_account_id");

-- CreateIndex
CREATE INDEX "style_profiles_user_id_idx" ON "style_profiles"("user_id");

-- CreateIndex
CREATE INDEX "style_profiles_organisation_id_idx" ON "style_profiles"("organisation_id");

-- CreateIndex
CREATE INDEX "projects_user_id_idx" ON "projects"("user_id");

-- CreateIndex
CREATE INDEX "projects_organisation_id_idx" ON "projects"("organisation_id");

-- CreateIndex
CREATE INDEX "project_style_profiles_project_id_idx" ON "project_style_profiles"("project_id");

-- CreateIndex
CREATE INDEX "project_style_profiles_style_profile_id_idx" ON "project_style_profiles"("style_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_style_profiles_project_id_style_profile_id_key" ON "project_style_profiles"("project_id", "style_profile_id");

-- CreateIndex
CREATE INDEX "generation_runs_project_id_idx" ON "generation_runs"("project_id");

-- CreateIndex
CREATE INDEX "generation_runs_style_profile_id_idx" ON "generation_runs"("style_profile_id");

-- CreateIndex
CREATE INDEX "generation_runs_automation_id_idx" ON "generation_runs"("automation_id");

-- CreateIndex
CREATE INDEX "automations_project_id_idx" ON "automations"("project_id");

-- CreateIndex
CREATE INDEX "automations_style_profile_id_idx" ON "automations"("style_profile_id");

-- CreateIndex
CREATE INDEX "posts_user_id_idx" ON "posts"("user_id");

-- CreateIndex
CREATE INDEX "posts_organisation_id_idx" ON "posts"("organisation_id");

-- CreateIndex
CREATE INDEX "posts_project_id_idx" ON "posts"("project_id");

-- CreateIndex
CREATE INDEX "posts_style_profile_id_idx" ON "posts"("style_profile_id");

-- CreateIndex
CREATE INDEX "posts_generation_run_id_idx" ON "posts"("generation_run_id");

-- CreateIndex
CREATE INDEX "posts_source_post_id_idx" ON "posts"("source_post_id");

-- CreateIndex
CREATE INDEX "posts_cover_document_id_idx" ON "posts"("cover_document_id");

-- CreateIndex
CREATE INDEX "posts_status_idx" ON "posts"("status");

-- CreateIndex
CREATE INDEX "posts_scheduled_at_idx" ON "posts"("scheduled_at");

-- CreateIndex
CREATE INDEX "post_attachments_post_id_idx" ON "post_attachments"("post_id");

-- CreateIndex
CREATE INDEX "post_attachments_document_id_idx" ON "post_attachments"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_attachments_post_id_document_id_key" ON "post_attachments"("post_id", "document_id");

-- CreateIndex
CREATE INDEX "post_channels_post_id_idx" ON "post_channels"("post_id");

-- CreateIndex
CREATE INDEX "post_channels_channel_connection_id_idx" ON "post_channels"("channel_connection_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_channels_post_id_channel_connection_id_key" ON "post_channels"("post_id", "channel_connection_id");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation_members" ADD CONSTRAINT "organisation_members_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation_members" ADD CONSTRAINT "organisation_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_channel_connections" ADD CONSTRAINT "social_channel_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_channel_connections" ADD CONSTRAINT "social_channel_connections_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "style_profiles" ADD CONSTRAINT "style_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "style_profiles" ADD CONSTRAINT "style_profiles_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_style_profiles" ADD CONSTRAINT "project_style_profiles_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_style_profiles" ADD CONSTRAINT "project_style_profiles_style_profile_id_fkey" FOREIGN KEY ("style_profile_id") REFERENCES "style_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_runs" ADD CONSTRAINT "generation_runs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_runs" ADD CONSTRAINT "generation_runs_style_profile_id_fkey" FOREIGN KEY ("style_profile_id") REFERENCES "style_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_runs" ADD CONSTRAINT "generation_runs_automation_id_fkey" FOREIGN KEY ("automation_id") REFERENCES "automations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automations" ADD CONSTRAINT "automations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automations" ADD CONSTRAINT "automations_style_profile_id_fkey" FOREIGN KEY ("style_profile_id") REFERENCES "style_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_style_profile_id_fkey" FOREIGN KEY ("style_profile_id") REFERENCES "style_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_generation_run_id_fkey" FOREIGN KEY ("generation_run_id") REFERENCES "generation_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_document_id_fkey" FOREIGN KEY ("cover_document_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_source_post_id_fkey" FOREIGN KEY ("source_post_id") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_attachments" ADD CONSTRAINT "post_attachments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_attachments" ADD CONSTRAINT "post_attachments_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_channels" ADD CONSTRAINT "post_channels_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_channels" ADD CONSTRAINT "post_channels_channel_connection_id_fkey" FOREIGN KEY ("channel_connection_id") REFERENCES "social_channel_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
