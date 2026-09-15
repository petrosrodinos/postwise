import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, Rss } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetchRssItems } from "@/features/rss-feeds/hooks/use-rss-feeds";
import type { RssFeed } from "@/features/rss-feeds/interfaces/rss-feeds.interfaces";

interface RssFeedTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  feed: RssFeed | null;
}

const TEST_ITEM_LIMIT = 5;

export function RssFeedTestDialog({ isOpen, onClose, feed }: RssFeedTestDialogProps) {
  const { mutate: fetchItems, data: items, isPending, isError, reset } = useFetchRssItems();

  useEffect(() => {
    if (isOpen && feed) {
      fetchItems({ id: feed.id, dto: { limit: TEST_ITEM_LIMIT, unused_only: false } });
    }
    if (!isOpen) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, feed?.id]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Test "{feed?.name}"</DialogTitle>
          <DialogDescription>The {TEST_ITEM_LIMIT} most recent items from this feed.</DialogDescription>
        </DialogHeader>

        {isPending && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-coral/30 bg-coral-soft p-4 text-sm text-coral">
            Could not fetch this feed. Double-check the URL and try again.
          </div>
        )}

        {!isPending && !isError && items && items.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            <Rss className="h-5 w-5" />
            No items found in this feed.
          </div>
        )}

        {!isPending && !isError && items && items.length > 0 && (
          <ScrollArea className="max-h-96 rounded-lg border border-border">
            <div className="flex flex-col divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col gap-1 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium">{item.title}</span>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-none text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  {item.published_at && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
