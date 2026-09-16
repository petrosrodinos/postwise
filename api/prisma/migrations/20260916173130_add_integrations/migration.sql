-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('SANITY');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'ERROR');

-- CreateEnum
CREATE TYPE "PostIntegrationStatus" AS ENUM ('PENDING', 'PUBLISHING', 'PUBLISHED', 'FAILED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityLogAction" ADD VALUE 'INTEGRATION_CONNECTED';
ALTER TYPE "ActivityLogAction" ADD VALUE 'INTEGRATION_UPDATED';
ALTER TYPE "ActivityLogAction" ADD VALUE 'INTEGRATION_REMOVED';

-- AlterEnum
ALTER TYPE "ActivityLogEntityType" ADD VALUE 'INTEGRATION';

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "organisation_id" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "name" TEXT NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'CONNECTED',
    "external_project_id" TEXT,
    "external_dataset" TEXT,
    "document_type" TEXT,
    "api_token_encrypted" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_integrations" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "integration_id" TEXT NOT NULL,
    "status" "PostIntegrationStatus" NOT NULL DEFAULT 'PENDING',
    "external_id" TEXT,
    "external_url" TEXT,
    "published_at" TIMESTAMP(3),
    "failed_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "integrations_organisation_id_idx" ON "integrations"("organisation_id");

-- CreateIndex
CREATE INDEX "post_integrations_post_id_idx" ON "post_integrations"("post_id");

-- CreateIndex
CREATE INDEX "post_integrations_integration_id_idx" ON "post_integrations"("integration_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_integrations_post_id_integration_id_key" ON "post_integrations"("post_id", "integration_id");

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_integrations" ADD CONSTRAINT "post_integrations_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_integrations" ADD CONSTRAINT "post_integrations_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
