import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Rss, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFetchRssItems } from "@/features/rss-feeds/hooks/use-rss-feeds";
import { useCreateRssGenerationRun } from "@/features/generation-runs/hooks/use-generation-runs";
import type { RssFeedItem } from "@/features/rss-feeds/interfaces/rss-feeds.interfaces";
import type { Project } from "@/features/projects/interfaces/projects.interfaces";
import type { GenerationRun } from "@/features/generation-runs/interfaces/generation-runs.interfaces";

interface RssItemPickerCardProps {
  project: Project;
  styleProfileId: string;
  language: string;
  generateImages: boolean;
  imageCount: number;
  onGenerated: (run: GenerationRun) => void;
}

export function RssItemPickerCard({ project, styleProfileId, language, generateImages, imageCount, onGenerated }: RssItemPickerCardProps) {
  const rssFeeds = project.rss_feeds ?? [];
  const [rssFeedId, setRssFeedId] = useState(rssFeeds[0]?.rss_feed_id ?? "");
  const [limit, setLimit] = useState(10);
  const [items, setItems] = useState<RssFeedItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { mutate: fetchItems, isPending: isFetching } = useFetchRssItems();
  const { mutate: createRssRun, isPending: isGenerating } = useCreateRssGenerationRun();

  function handleFetch() {
    if (!rssFeedId) return;
    fetchItems(
      { id: rssFeedId, dto: { limit, unused_only: true } },
      {
        onSuccess: (fetched) => {
          setItems(fetched);
          setSelectedIds(fetched.map((item) => item.id));
        },
      },
    );
  }

  function toggleItem(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]));
  }

  function handleGenerate() {
    if (selectedIds.length === 0) return;
    createRssRun(
      {
        project_id: project.id,
        rss_feed_item_ids: selectedIds,
        style_profile_id: styleProfileId || undefined,
        language,
        generate_images: generateImages,
        image_count: imageCount,
      },
      {
        onSuccess: (run) => {
          setItems([]);
          setSelectedIds([]);
          onGenerated(run);
        },
      },
    );
  }

  if (rssFeeds.length === 0) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Rss className="h-4 w-4" />
          No RSS feeds attached
        </div>
        <p>Attach an RSS feed to this project (from the project's edit page) to generate blog posts from its latest articles.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div>
        <Label className="mb-1.5 block text-xs font-semibold text-foreground">Feed</Label>
        <Select value={rssFeedId} onValueChange={setRssFeedId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a feed" />
          </SelectTrigger>
          <SelectContent>
            {rssFeeds.map((link) => (
              <SelectItem key={link.rss_feed_id} value={link.rss_feed_id}>
                {link.rss_feed.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-[1fr_auto] items-end gap-3">
        <div>
          <Label className="mb-1.5 block text-xs font-semibold text-foreground">Number of items</Label>
          <Input
            type="number"
            min={1}
            max={50}
            value={limit}
            onChange={(e) => setLimit(Math.min(50, Math.max(1, Number(e.target.value) || 1)))}
          />
        </div>
        <Button type="button" variant="outline" disabled={!rssFeedId || isFetching} loading={isFetching} onClick={handleFetch}>
          Fetch items
        </Button>
      </div>

      {items.length > 0 && (
        <>
          <ScrollArea className="max-h-72 rounded-lg border border-border">
            <div className="flex flex-col divide-y divide-border">
              {items.map((item) => (
                <label key={item.id} className="flex cursor-pointer items-start gap-3 p-3 hover:bg-muted/50">
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="mt-0.5"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{item.title}</div>
                    {item.published_at && (
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </ScrollArea>

          <Button
            className="w-full"
            disabled={selectedIds.length === 0 || isGenerating}
            loading={isGenerating}
            onClick={handleGenerate}
          >
            <Sparkles className="h-4 w-4" />
            Generate {selectedIds.length || ""} blog post{selectedIds.length === 1 ? "" : "s"}
          </Button>
        </>
      )}
    </div>
  );
}
