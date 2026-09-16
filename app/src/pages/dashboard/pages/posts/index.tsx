import { Fragment, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { PostStatusTag } from "@/components/ui/post-status-tag";
import { PlatformChip } from "@/components/ui/platform-glyph";
import { getPostTypeLabel } from "@/config/constants/dropdowns/posts/post-type-form.options";
import { getPostSourceLabel } from "@/config/constants/dropdowns/posts/post-source-filter.options";
import { usePosts } from "@/features/posts/hooks/use-posts";
import { getPostSource } from "@/features/posts/utils/post-source.utils";
import { Routes } from "@/routes/routes";
import type { Post } from "@/features/posts/interfaces/posts.interfaces";
import { PostsFilters, type PostsFilterState } from "./components/posts-filters";
import { PostRowActions } from "./components/post-row-actions";
import { PostPreviewDrawer } from "./components/post-preview-drawer";

const DEFAULT_FILTERS: PostsFilterState = {
  search: "",
  status: "all",
  type: "all",
  source: "all",
  project_id: "all",
};

const COLUMN_COUNT = 7;

interface BatchItemGroup {
  key: string;
  topic?: string | null;
  order: number;
  posts: Post[];
}

interface BatchGroup {
  runId: string;
  label?: string | null;
  createdAt: string;
  projectId: string;
  projectTitle: string;
  items: BatchItemGroup[];
}

// Mirrors the project generate page's Project → batch → idea hierarchy, but as
// flat table rows with section headers, since posts here span every project.
function groupPosts(posts: Post[]) {
  const batchOrder: string[] = [];
  const batches = new Map<string, BatchGroup>();
  const ungrouped: Post[] = [];

  for (const post of posts) {
    if (!post.generation_run) {
      ungrouped.push(post);
      continue;
    }

    let batch = batches.get(post.generation_run.id);
    if (!batch) {
      batch = {
        runId: post.generation_run.id,
        label: post.generation_run.label,
        createdAt: post.generation_run.created_at,
        projectId: post.generation_run.project_id,
        projectTitle: post.project?.title ?? "Untitled project",
        items: [],
      };
      batches.set(batch.runId, batch);
      batchOrder.push(batch.runId);
    }

    const itemKey = post.generation_item?.id ?? `post-${post.id}`;
    let item = batch.items.find((existing) => existing.key === itemKey);
    if (!item) {
      item = { key: itemKey, topic: post.generation_item?.topic, order: post.generation_item?.order ?? batch.items.length, posts: [] };
      batch.items.push(item);
    }
    item.posts.push(post);
  }

  for (const batch of batches.values()) {
    batch.items.sort((a, b) => a.order - b.order);
  }

  return { batches: batchOrder.map((id) => batches.get(id)!), ungrouped };
}

export default function PostsPage() {
  const [filters, setFilters] = useState<PostsFilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const { data: postsPage, isPending } = usePosts({
    page,
    limit: 50,
    search: filters.search || undefined,
    status: filters.status === "all" ? undefined : filters.status,
    type: filters.type === "all" ? undefined : filters.type,
    source: filters.source === "all" ? undefined : filters.source,
    project_id: filters.project_id === "all" ? undefined : filters.project_id,
  });

  const posts = postsPage?.data ?? [];
  const { batches, ungrouped } = useMemo(() => groupPosts(posts), [posts]);

  function updateFilters(next: PostsFilterState) {
    setFilters(next);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Posts</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every post across every project — manual, AI-generated, and automation-generated — in one place.</p>
      </div>

      <PostsFilters filters={filters} onChange={updateFilters} />

      {isPending ? (
        <Table>
          <TableHeader>
            <PostsTableHeaderRow />
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="max-w-xs">
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <h3 className="text-base font-semibold text-foreground">No posts found</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm">Try adjusting your filters, or generate posts from a project.</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <PostsTableHeaderRow />
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <Fragment key={batch.runId}>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableCell colSpan={COLUMN_COUNT} className="py-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <span className="truncate">{batch.projectTitle}</span>
                          {batch.label && (
                            <>
                              <span className="text-muted-foreground">·</span>
                              <span className="truncate text-muted-foreground">{batch.label}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{format(new Date(batch.createdAt), "MMM d, yyyy")}</span>
                          <Link
                            to={`${Routes.dashboard.project_generate(batch.projectId)}?run=${batch.runId}&tab=generations`}
                            className="font-semibold text-brass-ink hover:underline"
                          >
                            View in generator →
                          </Link>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                  {batch.items.map((item) => (
                    <Fragment key={item.key}>
                      {batch.items.length > 1 && (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={COLUMN_COUNT} className="py-1 pl-6 text-xs font-medium text-muted-foreground">
                            {item.topic || "Idea"}
                          </TableCell>
                        </TableRow>
                      )}
                      {item.posts.map((post) => (
                        <PostTableRow key={post.id} post={post} onSelect={setSelectedPost} />
                      ))}
                    </Fragment>
                  ))}
                </Fragment>
              ))}

              {batches.length > 0 && ungrouped.length > 0 && (
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableCell colSpan={COLUMN_COUNT} className="py-2 text-sm font-semibold text-foreground">
                    Manual &amp; other posts
                  </TableCell>
                </TableRow>
              )}
              {ungrouped.map((post) => (
                <PostTableRow key={post.id} post={post} onSelect={setSelectedPost} />
              ))}
            </TableBody>
          </Table>

          {postsPage && postsPage.pagination.total_pages > 1 && (
            <Pagination currentPage={page} totalPages={postsPage.pagination.total_pages} onPageChange={setPage} />
          )}
        </>
      )}

      <PostPreviewDrawer post={selectedPost} onClose={() => setSelectedPost(null)} />
    </div>
  );
}

function PostsTableHeaderRow() {
  return (
    <TableRow>
      <TableHead>Post</TableHead>
      <TableHead>Project</TableHead>
      <TableHead>Platform</TableHead>
      <TableHead>Source</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Updated</TableHead>
      <TableHead />
    </TableRow>
  );
}

function PostTableRow({ post, onSelect }: { post: Post; onSelect: (post: Post) => void }) {
  return (
    <TableRow className="cursor-pointer" onClick={() => onSelect(post)}>
      <TableCell className="max-w-xs">
        <div className="truncate font-medium">{post.title || post.hook || post.body?.slice(0, 60) || "Untitled post"}</div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{post.project?.title ?? "—"}</TableCell>
      <TableCell>
        <PlatformChip platform={post.type} label={getPostTypeLabel(post.type)} />
      </TableCell>
      <TableCell>
        <Badge variant="pill" className="whitespace-nowrap">
          {getPostSourceLabel(getPostSource(post))}
        </Badge>
      </TableCell>
      <TableCell>
        <PostStatusTag status={post.status} title={post.status === "FAILED" ? (post.failed_reason ?? undefined) : undefined} />
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{format(new Date(post.updated_at), "MMM d, yyyy")}</TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <PostRowActions post={post} onPreview={() => onSelect(post)} />
      </TableCell>
    </TableRow>
  );
}
