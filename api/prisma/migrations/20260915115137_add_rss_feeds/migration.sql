-- AlterTable
ALTER TABLE "automations" ADD COLUMN     "generate_images" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "image_count" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "rss_feed_id" TEXT;

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "rss_feed_item_id" TEXT;

-- CreateTable
CREATE TABLE "rss_feeds" (
    "id" TEXT NOT NULL,
    "organisation_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "last_fetched_at" TIMESTAMP(3),
    "last_fetch_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rss_feeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_rss_feeds" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "rss_feed_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_rss_feeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rss_feed_items" (
    "id" TEXT NOT NULL,
    "rss_feed_id" TEXT NOT NULL,
    "guid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT,
    "summary" TEXT,
    "content" TEXT,
    "published_at" TIMESTAMP(3),
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rss_feed_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rss_feeds_organisation_id_idx" ON "rss_feeds"("organisation_id");

-- CreateIndex
CREATE INDEX "project_rss_feeds_project_id_idx" ON "project_rss_feeds"("project_id");

-- CreateIndex
CREATE INDEX "project_rss_feeds_rss_feed_id_idx" ON "project_rss_feeds"("rss_feed_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_rss_feeds_project_id_rss_feed_id_key" ON "project_rss_feeds"("project_id", "rss_feed_id");

-- CreateIndex
CREATE INDEX "rss_feed_items_rss_feed_id_idx" ON "rss_feed_items"("rss_feed_id");

-- CreateIndex
CREATE INDEX "rss_feed_items_rss_feed_id_is_used_idx" ON "rss_feed_items"("rss_feed_id", "is_used");

-- CreateIndex
CREATE UNIQUE INDEX "rss_feed_items_rss_feed_id_guid_key" ON "rss_feed_items"("rss_feed_id", "guid");

-- CreateIndex
CREATE INDEX "automations_rss_feed_id_idx" ON "automations"("rss_feed_id");

-- CreateIndex
CREATE INDEX "posts_rss_feed_item_id_idx" ON "posts"("rss_feed_item_id");

-- AddForeignKey
ALTER TABLE "rss_feeds" ADD CONSTRAINT "rss_feeds_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_rss_feeds" ADD CONSTRAINT "project_rss_feeds_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_rss_feeds" ADD CONSTRAINT "project_rss_feeds_rss_feed_id_fkey" FOREIGN KEY ("rss_feed_id") REFERENCES "rss_feeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rss_feed_items" ADD CONSTRAINT "rss_feed_items_rss_feed_id_fkey" FOREIGN KEY ("rss_feed_id") REFERENCES "rss_feeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automations" ADD CONSTRAINT "automations_rss_feed_id_fkey" FOREIGN KEY ("rss_feed_id") REFERENCES "rss_feeds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_rss_feed_item_id_fkey" FOREIGN KEY ("rss_feed_item_id") REFERENCES "rss_feed_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
