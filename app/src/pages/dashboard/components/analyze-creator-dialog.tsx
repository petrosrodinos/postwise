import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ExternalLink, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PostTypeFormOptions } from "@/config/constants/dropdowns/posts/post-type-form.options";
import { PostTypes } from "@/features/posts/interfaces/posts.interfaces";
import { useCreateStyleProfile, useAnalyzeStyleProfile, useScrapeLinkedInPosts } from "@/features/style-profiles/hooks/use-style-profiles";
import type { PostedLimit, ScrapedLinkedInPost } from "@/features/style-profiles/interfaces/style-profiles.interfaces";
import { Routes } from "@/routes/routes";
import { analyzeStyleProfileSchema, samplePostsToArray, type AnalyzeStyleProfileFormData } from "../validation-schemas/style-profile.schema";

interface AnalyzeCreatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type DialogStep = "details" | "review";
type SortOption = "newest" | "oldest" | "most_liked" | "least_liked";

const EXTRACTS = ["Tone & voice", "Structural patterns", "Opening hooks", "Vocabulary & phrases"];

const POSTED_LIMIT_OPTIONS: { value: PostedLimit; label: string }[] = [
  { value: "any", label: "Any time" },
  { value: "1h", label: "Past hour" },
  { value: "24h", label: "Past 24 hours" },
  { value: "week", label: "Past week" },
  { value: "month", label: "Past month" },
  { value: "3months", label: "Past 3 months" },
  { value: "6months", label: "Past 6 months" },
  { value: "year", label: "Past year" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "most_liked", label: "Most liked" },
  { value: "least_liked", label: "Least liked" },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function formatPostDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString();
}

interface FetchSettings {
  maxPosts: number;
  postedLimit: PostedLimit;
  includeReposts: boolean;
  includeQuotePosts: boolean;
}

interface FetchSettingsFieldsProps {
  settings: FetchSettings;
  onChange: (settings: FetchSettings) => void;
}

function FetchSettingsFields({ settings, onChange }: FetchSettingsFieldsProps) {
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Posts to fetch</label>
          <Input
            type="number"
            min={1}
            max={50}
            value={settings.maxPosts}
            onChange={(e) => onChange({ ...settings, maxPosts: clamp(Number(e.target.value) || 1, 1, 50) })}
          />
        </div>
        <div className="grid gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Posted within</label>
          <Select value={settings.postedLimit} onValueChange={(value) => onChange({ ...settings, postedLimit: value as PostedLimit })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POSTED_LIMIT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={settings.includeReposts}
            onCheckedChange={(checked) => onChange({ ...settings, includeReposts: checked === true })}
          />
          Include reposts
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={settings.includeQuotePosts}
            onCheckedChange={(checked) => onChange({ ...settings, includeQuotePosts: checked === true })}
          />
          Include quote posts
        </label>
      </div>
    </div>
  );
}

export function AnalyzeCreatorDialog({ isOpen, onClose }: AnalyzeCreatorDialogProps) {
  const navigate = useNavigate();
  const { mutateAsync: createStyleProfile, isPending: isCreating } = useCreateStyleProfile();
  const { mutateAsync: analyzeStyleProfile, isPending: isAnalyzing } = useAnalyzeStyleProfile();
  const { mutateAsync: scrapeLinkedInPosts, isPending: isFetchingPosts } = useScrapeLinkedInPosts();
  const isPending = isCreating || isAnalyzing || isFetchingPosts;

  const [step, setStep] = useState<DialogStep>("details");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [scrapedPosts, setScrapedPosts] = useState<ScrapedLinkedInPost[]>([]);
  const [manualPostsText, setManualPostsText] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [minLikes, setMinLikes] = useState(0);
  const [fetchSettings, setFetchSettings] = useState<FetchSettings>({
    maxPosts: 20,
    postedLimit: "any",
    includeReposts: true,
    includeQuotePosts: true,
  });

  const form = useForm<AnalyzeStyleProfileFormData>({
    resolver: zodResolver(analyzeStyleProfileSchema),
    defaultValues: { name: "", platform: undefined, source_url: "", sample_posts: "" },
  });

  const isLinkedIn = form.watch("platform") === PostTypes.LINKEDIN;

  const visiblePosts = useMemo(
    () => scrapedPosts.filter((post) => (post.likes ?? 0) >= minLikes),
    [scrapedPosts, minLikes],
  );

  const sortedPosts = useMemo(() => {
    const list = [...visiblePosts];
    switch (sort) {
      case "newest":
        return list.sort((a, b) => new Date(b.posted_at ?? 0).getTime() - new Date(a.posted_at ?? 0).getTime());
      case "oldest":
        return list.sort((a, b) => new Date(a.posted_at ?? 0).getTime() - new Date(b.posted_at ?? 0).getTime());
      case "most_liked":
        return list.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
      case "least_liked":
        return list.sort((a, b) => (a.likes ?? 0) - (b.likes ?? 0));
      default:
        return list;
    }
  }, [visiblePosts, sort]);

  const manualCount = samplePostsToArray(manualPostsText).length;
  const totalReady = sortedPosts.length + manualCount;

  function resetAll() {
    form.reset();
    setStep("details");
    setProfileId(null);
    setScrapedPosts([]);
    setManualPostsText("");
    setSort("newest");
    setMinLikes(0);
    setFetchSettings({ maxPosts: 20, postedLimit: "any", includeReposts: true, includeQuotePosts: true });
  }

  function handleClose() {
    if (isPending) return;
    resetAll();
    onClose();
  }

  function handleDiscard(id: string) {
    setScrapedPosts((prev) => prev.filter((post) => post.id !== id));
  }

  async function handleFetchPosts(data: AnalyzeStyleProfileFormData) {
    let id = profileId;
    if (!id) {
      const profile = await createStyleProfile({
        name: data.name,
        platform: data.platform,
        source_url: data.source_url || undefined,
      });
      id = profile.id;
      setProfileId(id);
    }

    const posts = await scrapeLinkedInPosts({
      id,
      dto: {
        source_url: data.source_url,
        max_posts: fetchSettings.maxPosts,
        posted_limit: fetchSettings.postedLimit,
        include_reposts: fetchSettings.includeReposts,
        include_quote_posts: fetchSettings.includeQuotePosts,
      },
    });

    setScrapedPosts(posts);
    setStep("review");
  }

  async function handleRefetch() {
    const sourceUrl = form.getValues("source_url");
    if (!profileId || !sourceUrl) return;

    const posts = await scrapeLinkedInPosts({
      id: profileId,
      dto: {
        source_url: sourceUrl,
        max_posts: fetchSettings.maxPosts,
        posted_limit: fetchSettings.postedLimit,
        include_reposts: fetchSettings.includeReposts,
        include_quote_posts: fetchSettings.includeQuotePosts,
      },
    });

    setScrapedPosts(posts);
  }

  async function handleAnalyze() {
    if (!profileId) return;
    const finalPosts = [...sortedPosts.map((post) => post.text), ...samplePostsToArray(manualPostsText)];
    if (finalPosts.length === 0) return;

    await analyzeStyleProfile({ id: profileId, dto: { sample_posts: finalPosts } });
    resetAll();
    onClose();
    navigate(Routes.dashboard.style_profiles);
  }

  async function onSubmit(data: AnalyzeStyleProfileFormData) {
    if (isLinkedIn) {
      if (!data.source_url) {
        form.setError("source_url", { message: "Enter a LinkedIn profile or company URL to fetch posts" });
        return;
      }
      await handleFetchPosts(data);
      return;
    }

    const posts = samplePostsToArray(data.sample_posts || "");
    if (posts.length === 0) {
      form.setError("sample_posts", { message: "Paste at least one sample post" });
      return;
    }

    const profile = await createStyleProfile({
      name: data.name,
      platform: data.platform,
      source_url: data.source_url || undefined,
    });
    await analyzeStyleProfile({ id: profile.id, dto: { sample_posts: posts } });
    resetAll();
    onClose();
    navigate(Routes.dashboard.style_profiles);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{step === "review" ? "Review fetched posts" : "Analyze a creator"}</DialogTitle>
          <DialogDescription>
            {step === "review"
              ? "Discard anything that doesn't fit, then run the analysis."
              : isLinkedIn
                ? "We'll fetch this creator's recent LinkedIn posts for you to review before analyzing."
                : "Build a reusable Style DNA profile from a creator's own writing."}
          </DialogDescription>
        </DialogHeader>

        {step === "details" ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile name</FormLabel>
                    <FormControl>
                      <Input placeholder="My LinkedIn voice" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PostTypeFormOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="source_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source URL{isLinkedIn ? "" : " (optional)"}</FormLabel>
                    <FormControl>
                      <Input placeholder="linkedin.com/in/username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isLinkedIn ? (
                <div className="grid gap-2 rounded-lg border border-border p-3">
                  <p className="text-xs font-medium text-muted-foreground">Fetch settings</p>
                  <FetchSettingsFields settings={fetchSettings} onChange={setFetchSettings} />
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="sample_posts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sample posts</FormLabel>
                      <FormControl>
                        <Textarea rows={6} placeholder={"Paste a handful of the creator's best posts, separated by a blank line between each one."} {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">Signal fingerprints tone, structure, hooks and vocabulary from what you paste here.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-2 gap-2 rounded-lg border border-dashed border-border bg-muted/40 p-3">
                {EXTRACTS.map((item) => (
                  <div key={item} className="text-xs font-medium text-muted-foreground">
                    {item}
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} loading={isPending}>
                  {isLinkedIn ? "Fetch posts" : "Analyze creator"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-2 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Fetch settings</p>
                <Button type="button" variant="outline" size="sm" onClick={handleRefetch} disabled={isPending} loading={isFetchingPosts}>
                  Re-fetch
                </Button>
              </div>
              <FetchSettingsFields settings={fetchSettings} onChange={setFetchSettings} />
              <p className="text-xs text-muted-foreground">Re-fetching replaces the list below.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Sort by</label>
                <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Minimum likes</label>
                <Input
                  type="number"
                  min={0}
                  value={minLikes}
                  onChange={(e) => setMinLikes(Math.max(0, Number(e.target.value) || 0))}
                />
              </div>
            </div>

            <ScrollArea className="h-72 rounded-lg border border-border">
              <div className="grid gap-2 p-2">
                {sortedPosts.length === 0 ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">
                    {scrapedPosts.length === 0 ? "No posts were fetched." : "No posts match your filters."}
                  </p>
                ) : (
                  sortedPosts.map((post) => (
                    <div key={post.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="line-clamp-3 text-sm">{post.text}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {formatPostDate(post.posted_at) && <span>{formatPostDate(post.posted_at)}</span>}
                          {typeof post.likes === "number" && <span>{post.likes} likes</span>}
                          {typeof post.comments === "number" && <span>{post.comments} comments</span>}
                          {post.url && (
                            <a href={post.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                              <ExternalLink className="h-3 w-3" />
                              View
                            </a>
                          )}
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleDiscard(post.id)} aria-label="Discard post">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="w-full justify-between">
                  Add posts manually
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <Textarea
                  rows={4}
                  placeholder="Paste additional posts, separated by a blank line between each one."
                  value={manualPostsText}
                  onChange={(e) => setManualPostsText(e.target.value)}
                />
              </CollapsibleContent>
            </Collapsible>

            <DialogFooter className="flex items-center justify-between sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {totalReady} post{totalReady === 1 ? "" : "s"} ready to analyze
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep("details")} disabled={isPending}>
                  Back
                </Button>
                <Button type="button" onClick={handleAnalyze} disabled={isPending || totalReady === 0} loading={isAnalyzing}>
                  Analyze creator
                </Button>
              </div>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
