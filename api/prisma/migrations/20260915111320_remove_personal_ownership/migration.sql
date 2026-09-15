-- Backfill: reassign every personally-owned row to the organisation that was
-- auto-provisioned for its owning user (Organisation.created_by_user_id),
-- picking the oldest such organisation if more than one exists, before
-- organisation_id is made required and the personal-owner columns are dropped.

UPDATE "documents" d
SET "organisation_id" = (
  SELECT o."id" FROM "organisations" o
  WHERE o."created_by_user_id" = d."user_uuid"
  ORDER BY o."created_at" ASC
  LIMIT 1
)
WHERE d."organisation_id" IS NULL AND d."user_uuid" IS NOT NULL;

UPDATE "projects" p
SET "organisation_id" = (
  SELECT o."id" FROM "organisations" o
  WHERE o."created_by_user_id" = p."user_id"
  ORDER BY o."created_at" ASC
  LIMIT 1
)
WHERE p."organisation_id" IS NULL AND p."user_id" IS NOT NULL;

UPDATE "style_profiles" sp
SET "organisation_id" = (
  SELECT o."id" FROM "organisations" o
  WHERE o."created_by_user_id" = sp."user_id"
  ORDER BY o."created_at" ASC
  LIMIT 1
)
WHERE sp."organisation_id" IS NULL AND sp."user_id" IS NOT NULL;

UPDATE "social_channel_connections" scc
SET "organisation_id" = (
  SELECT o."id" FROM "organisations" o
  WHERE o."created_by_user_id" = scc."user_id"
  ORDER BY o."created_at" ASC
  LIMIT 1
)
WHERE scc."organisation_id" IS NULL AND scc."user_id" IS NOT NULL;

UPDATE "posts" post
SET "organisation_id" = (
  SELECT o."id" FROM "organisations" o
  WHERE o."created_by_user_id" = post."user_id"
  ORDER BY o."created_at" ASC
  LIMIT 1
)
WHERE post."organisation_id" IS NULL;

-- Fail loudly (rather than let the NOT NULL constraints below fail with a
-- generic error) if any row could not be resolved to an organisation.
DO $$
DECLARE
  unresolved INTEGER;
BEGIN
  SELECT
    (SELECT count(*) FROM "documents" WHERE "organisation_id" IS NULL) +
    (SELECT count(*) FROM "projects" WHERE "organisation_id" IS NULL) +
    (SELECT count(*) FROM "style_profiles" WHERE "organisation_id" IS NULL) +
    (SELECT count(*) FROM "social_channel_connections" WHERE "organisation_id" IS NULL) +
    (SELECT count(*) FROM "posts" WHERE "organisation_id" IS NULL)
  INTO unresolved;

  IF unresolved > 0 THEN
    RAISE EXCEPTION 'remove_personal_ownership backfill left % row(s) with organisation_id still NULL', unresolved;
  END IF;
END $$;

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_user_uuid_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_user_id_fkey";

-- DropForeignKey
ALTER TABLE "social_channel_connections" DROP CONSTRAINT "social_channel_connections_user_id_fkey";

-- DropForeignKey
ALTER TABLE "style_profiles" DROP CONSTRAINT "style_profiles_user_id_fkey";

-- DropIndex
DROP INDEX "documents_user_uuid_idx";

-- DropIndex
DROP INDEX "projects_user_id_idx";

-- DropIndex
DROP INDEX "social_channel_connections_user_id_idx";

-- DropIndex
DROP INDEX "style_profiles_user_id_idx";

-- AlterTable
ALTER TABLE "documents" DROP COLUMN "user_uuid",
ALTER COLUMN "organisation_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "organisation_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "user_id",
ALTER COLUMN "organisation_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "social_channel_connections" DROP COLUMN "user_id",
ALTER COLUMN "organisation_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "style_profiles" DROP COLUMN "user_id",
ALTER COLUMN "organisation_id" SET NOT NULL;
