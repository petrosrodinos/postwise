-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "channels" "SocialChannel"[];

-- CreateTable
CREATE TABLE "generation_items" (
    "id" TEXT NOT NULL,
    "generation_run_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "topic" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generation_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "generation_items_generation_run_id_idx" ON "generation_items"("generation_run_id");

-- AddForeignKey
ALTER TABLE "generation_items" ADD CONSTRAINT "generation_items_generation_run_id_fkey" FOREIGN KEY ("generation_run_id") REFERENCES "generation_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "generation_item_id" TEXT;

-- CreateIndex
CREATE INDEX "posts_generation_item_id_idx" ON "posts"("generation_item_id");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_generation_item_id_fkey" FOREIGN KEY ("generation_item_id") REFERENCES "generation_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: existing social projects get their single legacy platform as
-- their initial target channel.
UPDATE "projects"
SET "channels" = ARRAY[("platform")::text]::"SocialChannel"[]
WHERE "platform" IN ('LINKEDIN', 'TWITTER');

-- Backfill: every other project (BLOG, or any unrecognised platform) gets an
-- empty channel list rather than SQL NULL — Prisma's `channels` field is a
-- non-optional list and must never see a null value for it.
UPDATE "projects"
SET "channels" = '{}'
WHERE "channels" IS NULL;

-- Backfill: every pre-existing Post created by a GenerationRun becomes its
-- own single-post GenerationItem (legacy runs never fanned out across
-- channels), so old batches still render correctly under the new
-- items-grouped generation results page instead of appearing empty.
WITH legacy_posts AS (
  SELECT
    id,
    generation_run_id,
    ROW_NUMBER() OVER (PARTITION BY generation_run_id ORDER BY created_at) - 1 AS item_order
  FROM "posts"
  WHERE "generation_run_id" IS NOT NULL AND "generation_item_id" IS NULL
),
inserted_items AS (
  INSERT INTO "generation_items" ("id", "generation_run_id", "order", "created_at")
  SELECT gen_random_uuid()::text, generation_run_id, item_order, NOW()
  FROM legacy_posts
  RETURNING id, generation_run_id, "order"
)
UPDATE "posts" p
SET "generation_item_id" = ii.id
FROM inserted_items ii
JOIN legacy_posts lp ON lp.generation_run_id = ii.generation_run_id AND lp.item_order = ii."order"
WHERE p.id = lp.id;
