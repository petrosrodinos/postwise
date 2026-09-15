import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PostStatusTag } from "@/components/ui/post-status-tag";
import { StyleDnaStrand } from "@/components/ui/style-dna-strand";
import { useGenerationRuns } from "@/features/generation-runs/hooks/use-generation-runs";
import { usePosts } from "@/features/posts/hooks/use-posts";
import { Routes } from "@/routes/routes";
import type { Project } from "@/features/projects/interfaces/projects.interfaces";

interface GenerationsTabProps {
  project: Project;
}

export function GenerationsTab({ project }: GenerationsTabProps) {
  const { data: runsPage, isPending: isRunsPending } = useGenerationRuns({ project_id: project.id, limit: 50 });
  const { data: postsPage, isPending: isPostsPending } = usePosts({ project_id: project.id, limit: 100 });

  const runs = runsPage?.data ?? [];
  const posts = postsPage?.data ?? [];

  function styleProfileFor(styleProfileId?: string | null) {
    return project.style_profiles?.find((link) => link.style_profile_id === styleProfileId)?.style_profile;
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">Every batch of AI-generated posts for this project, in one place.</p>

      {isRunsPending ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : runs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          <h3 className="text-base font-semibold text-foreground">No generations yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm">Run your first AI generation to produce drafts from this project's context.</p>
          <Button className="mt-4" asChild>
            <Link to={Routes.dashboard.project_generate(project.id)}>Generate posts</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {runs.map((run) => {
            const styleProfile = styleProfileFor(run.style_profile_id);
            return (
              <Card key={run.id}>
                <CardContent className="flex flex-col gap-3 pt-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{run.label || `Batch ${run.id.slice(0, 8)}`}</div>
                      <div className="text-xs text-muted-foreground">Created {format(new Date(run.created_at), "MMM d, yyyy")}</div>
                    </div>
                    {styleProfile && <StyleDnaStrand traits={styleProfile} className="w-14 flex-none" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{run.posts_requested ?? "—"} posts</span>
                    <Link
                      to={`${Routes.dashboard.project_generate(project.id)}?run=${run.id}`}
                      className="text-sm font-semibold text-brass-ink hover:underline"
                    >
                      View generation →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div>
        <h3 className="mb-3 text-base font-semibold">All generated posts</h3>
        {isPostsPending ? (
          <Skeleton className="h-40 w-full" />
        ) : posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead>Style profile</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => {
                const styleProfile = styleProfileFor(post.style_profile_id);
                return (
                  <TableRow key={post.id}>
                    <TableCell className="max-w-xs">
                      <div className="truncate font-medium">{post.title || post.hook || post.body?.slice(0, 60) || "Untitled post"}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{styleProfile?.name ?? "—"}</TableCell>
                    <TableCell>
                      <PostStatusTag status={post.status} title={post.status === "FAILED" ? post.failed_reason ?? undefined : undefined} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(post.updated_at), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Link
                        to={`${Routes.dashboard.project_generate(project.id)}${post.generation_run_id ? `?run=${post.generation_run_id}` : ""}`}
                        className="text-sm font-semibold text-brass-ink hover:underline"
                      >
                        Open →
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
