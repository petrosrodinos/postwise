import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRssFeeds } from "@/features/rss-feeds/hooks/use-rss-feeds";
import type { RssFeed } from "@/features/rss-feeds/interfaces/rss-feeds.interfaces";
import { RssFeedCard, RssFeedCardSkeleton } from "./components/rss-feed-card";
import { RssFeedDialog } from "./components/rss-feed-dialog";

export default function RssFeedsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<RssFeed | null>(null);

  const { data: feedsPage, isPending } = useRssFeeds({ limit: 100 });
  const feeds = feedsPage?.data ?? [];

  function openCreate() {
    setEditingFeed(null);
    setIsDialogOpen(true);
  }

  function openEdit(feed: RssFeed) {
    setEditingFeed(feed);
    setIsDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">RSS Feeds</h1>
        <p className="mt-1 text-sm text-muted-foreground">Blog sources the AI can turn into full posts</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-xl text-sm text-muted-foreground">
          Attach a feed to a project to pick items and generate blog posts from them — manually or on an automated schedule.
        </p>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add RSS feed
        </Button>
      </div>

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <RssFeedCardSkeleton key={i} />
          ))}
        </div>
      ) : feeds.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <h3 className="text-base font-semibold text-foreground">No RSS feeds yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm">Add a blog's RSS feed URL to start generating posts from its latest articles.</p>
          <Button className="mt-4" onClick={openCreate}>
            Add RSS feed
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {feeds.map((feed) => (
            <RssFeedCard key={feed.id} feed={feed} onEdit={() => openEdit(feed)} />
          ))}
        </div>
      )}

      <RssFeedDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} feed={editingFeed} />
    </div>
  );
}
