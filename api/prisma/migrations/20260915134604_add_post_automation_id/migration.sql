-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "automation_id" TEXT;

-- CreateIndex
CREATE INDEX "posts_automation_id_idx" ON "posts"("automation_id");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_automation_id_fkey" FOREIGN KEY ("automation_id") REFERENCES "automations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: posts already created by an automation, via their generation run,
-- get their automation_id set directly so it doesn't rely on a two-hop join.
UPDATE "posts" p
SET "automation_id" = gr."automation_id"
FROM "generation_runs" gr
WHERE p."generation_run_id" = gr."id" AND gr."automation_id" IS NOT NULL;
