import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Rss } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useDeleteRssFeed } from "@/features/rss-feeds/hooks/use-rss-feeds";
import type { RssFeed } from "@/features/rss-feeds/interfaces/rss-feeds.interfaces";

interface RssFeedCardProps {
  feed: RssFeed;
  onEdit: () => void;
}

export function RssFeedCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 flex-none rounded-lg" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export function RssFeedCard({ feed, onEdit }: RssFeedCardProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { mutate: deleteRssFeed, isPending: isDeleting } = useDeleteRssFeed();

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-brass-soft text-brass-ink">
            <Rss className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{feed.name}</h3>
            <p className="truncate text-xs text-muted-foreground">{feed.url}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-none">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setIsDeleteOpen(true)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {feed.last_fetch_error ? (
        <Badge variant="pill" className="bg-coral-soft text-coral">
          Last fetch failed
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">
          {feed.last_fetched_at
            ? `Last fetched ${formatDistanceToNow(new Date(feed.last_fetched_at), { addSuffix: true })}`
            : "Not fetched yet"}
        </span>
      )}

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => deleteRssFeed(feed.id, { onSuccess: () => setIsDeleteOpen(false) })}
        title="Delete RSS feed?"
        description={`"${feed.name}" will be removed from every project it's attached to.`}
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
