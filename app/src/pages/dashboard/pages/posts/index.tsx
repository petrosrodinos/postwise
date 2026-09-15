import { useState } from "react";
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

export default function PostsPage() {
  const [filters, setFilters] = useState<PostsFilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const { data: postsPage, isPending } = usePosts({
    page,
    limit: 20,
    search: filters.search || undefined,
    status: filters.status === "all" ? undefined : filters.status,
    type: filters.type === "all" ? undefined : filters.type,
    source: filters.source === "all" ? undefined : filters.source,
    project_id: filters.project_id === "all" ? undefined : filters.project_id,
  });

  const posts = postsPage?.data ?? [];

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
            <TableRow>
              <TableHead>Post</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead />
            </TableRow>
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
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id} className="cursor-pointer" onClick={() => setSelectedPost(post)}>
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
                    <PostRowActions post={post} onPreview={() => setSelectedPost(post)} />
                  </TableCell>
                </TableRow>
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
