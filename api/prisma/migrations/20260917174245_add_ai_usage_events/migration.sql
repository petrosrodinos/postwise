-- CreateEnum
CREATE TYPE "AiUsageType" AS ENUM ('TEXT', 'IMAGE');

-- CreateEnum
CREATE TYPE "AiUsageFeature" AS ENUM ('GENERATION_MULTI_CHANNEL_DRAFT', 'GENERATION_RSS_DRAFT', 'GENERATION_COVER_IMAGE', 'POST_REVISE', 'POST_REPURPOSE', 'TOOLS_REVISE', 'TOOLS_REPURPOSE', 'TOOLS_TITLE_VARIATIONS', 'TOOLS_META_TAGS', 'TOOLS_IMAGE', 'STYLE_PROFILE_ANALYZE', 'PROJECT_GENERATE_DETAILS', 'INTERNAL_PASSTHROUGH');

-- CreateTable
CREATE TABLE "ai_usage_events" (
    "id" TEXT NOT NULL,
    "organisation_id" TEXT,
    "user_id" TEXT,
    "type" "AiUsageType" NOT NULL,
    "feature" "AiUsageFeature" NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "input_tokens" INTEGER,
    "output_tokens" INTEGER,
    "total_tokens" INTEGER,
    "image_count" INTEGER,
    "input_cost" DECIMAL(14,8) NOT NULL DEFAULT 0,
    "output_cost" DECIMAL(14,8) NOT NULL DEFAULT 0,
    "total_cost" DECIMAL(14,8) NOT NULL DEFAULT 0,
    "generation_run_id" TEXT,
    "post_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_usage_events_organisation_id_created_at_idx" ON "ai_usage_events"("organisation_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_usage_events_organisation_id_user_id_idx" ON "ai_usage_events"("organisation_id", "user_id");

-- CreateIndex
CREATE INDEX "ai_usage_events_organisation_id_feature_idx" ON "ai_usage_events"("organisation_id", "feature");

-- CreateIndex
CREATE INDEX "ai_usage_events_organisation_id_type_idx" ON "ai_usage_events"("organisation_id", "type");

-- CreateIndex
CREATE INDEX "ai_usage_events_generation_run_id_idx" ON "ai_usage_events"("generation_run_id");

-- AddForeignKey
ALTER TABLE "ai_usage_events" ADD CONSTRAINT "ai_usage_events_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage_events" ADD CONSTRAINT "ai_usage_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage_events" ADD CONSTRAINT "ai_usage_events_generation_run_id_fkey" FOREIGN KEY ("generation_run_id") REFERENCES "generation_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage_events" ADD CONSTRAINT "ai_usage_events_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
