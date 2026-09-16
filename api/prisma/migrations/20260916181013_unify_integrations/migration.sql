-- AlterEnum
BEGIN;
CREATE TYPE "ActivityLogAction_new" AS ENUM ('USER_REGISTERED', 'USER_LOGGED_IN', 'USER_PROFILE_UPDATED', 'PASSWORD_CHANGED', 'PASSWORD_RESET_COMPLETED', 'ORGANISATION_CREATED', 'ORGANISATION_UPDATED', 'ORGANISATION_DELETED', 'MEMBER_ADDED', 'MEMBER_INVITED', 'MEMBER_INVITATION_RESENT', 'MEMBER_INVITATION_ACCEPTED', 'MEMBER_ROLE_UPDATED', 'MEMBER_REMOVED', 'DOCUMENT_UPLOADED', 'DOCUMENT_UPDATED', 'DOCUMENT_DELETED', 'STYLE_PROFILE_CREATED', 'STYLE_PROFILE_UPDATED', 'STYLE_PROFILE_DELETED', 'STYLE_PROFILE_ANALYZED', 'PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_DELETED', 'PROJECT_STYLE_PROFILE_ATTACHED', 'PROJECT_STYLE_PROFILE_DETACHED', 'PROJECT_RSS_FEED_ATTACHED', 'PROJECT_RSS_FEED_DETACHED', 'RSS_FEED_CREATED', 'RSS_FEED_UPDATED', 'RSS_FEED_DELETED', 'RSS_FEED_ITEMS_FETCHED', 'AUTOMATION_CREATED', 'AUTOMATION_UPDATED', 'AUTOMATION_DELETED', 'AUTOMATION_RAN', 'GENERATION_RUN_CREATED', 'POST_CREATED', 'POST_UPDATED', 'POST_DELETED', 'POST_SCHEDULED', 'POST_PUBLISHED', 'POST_PUBLISH_FAILED', 'POST_REPURPOSED', 'POST_ATTACHMENT_ADDED', 'POST_ATTACHMENT_REMOVED', 'INTEGRATION_CONNECTED', 'INTEGRATION_UPDATED', 'INTEGRATION_REMOVED');
ALTER TABLE "activity_logs" ALTER COLUMN "action" TYPE "ActivityLogAction_new" USING ("action"::text::"ActivityLogAction_new");
ALTER TYPE "ActivityLogAction" RENAME TO "ActivityLogAction_old";
ALTER TYPE "ActivityLogAction_new" RENAME TO "ActivityLogAction";
DROP TYPE "public"."ActivityLogAction_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ActivityLogEntityType_new" AS ENUM ('USER', 'ORGANISATION', 'ORGANISATION_MEMBER', 'DOCUMENT', 'STYLE_PROFILE', 'PROJECT', 'RSS_FEED', 'AUTOMATION', 'GENERATION_RUN', 'POST', 'INTEGRATION');
ALTER TABLE "activity_logs" ALTER COLUMN "entity_type" TYPE "ActivityLogEntityType_new" USING ("entity_type"::text::"ActivityLogEntityType_new");
ALTER TYPE "ActivityLogEntityType" RENAME TO "ActivityLogEntityType_old";
ALTER TYPE "ActivityLogEntityType_new" RENAME TO "ActivityLogEntityType";
DROP TYPE "public"."ActivityLogEntityType_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "IntegrationProvider" ADD VALUE 'TWITTER';
ALTER TYPE "IntegrationProvider" ADD VALUE 'LINKEDIN';

-- DropForeignKey
ALTER TABLE "post_channels" DROP CONSTRAINT "post_channels_channel_connection_id_fkey";

-- DropForeignKey
ALTER TABLE "post_channels" DROP CONSTRAINT "post_channels_post_id_fkey";

-- DropForeignKey
ALTER TABLE "social_channel_connections" DROP CONSTRAINT "social_channel_connections_organisation_id_fkey";

-- AlterTable
ALTER TABLE "integrations" ADD COLUMN     "access_token_encrypted" TEXT,
ADD COLUMN     "external_account_id" TEXT,
ADD COLUMN     "external_account_name" TEXT,
ADD COLUMN     "refresh_token_encrypted" TEXT,
ADD COLUMN     "token_expires_at" TIMESTAMP(3);

-- DropTable
DROP TABLE "post_channels";

-- DropTable
DROP TABLE "social_channel_connections";

-- DropEnum
DROP TYPE "PostChannelStatus";

-- DropEnum
DROP TYPE "SocialChannel";

-- DropEnum
DROP TYPE "SocialChannelConnectionStatus";

-- CreateIndex
CREATE UNIQUE INDEX "integrations_provider_external_account_id_key" ON "integrations"("provider", "external_account_id");

