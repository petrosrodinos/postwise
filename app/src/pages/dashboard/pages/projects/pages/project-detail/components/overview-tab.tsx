import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkflowBar } from "@/components/ui/workflow-bar";
import { PostStatusTag } from "@/components/ui/post-status-tag";
import { StyleDnaStrand } from "@/components/ui/style-dna-strand";
import { PostStatusFilterOptions } from "@/config/constants/dropdowns/posts/post-status-filter.options";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { PostStatuses } from "@/features/posts/interfaces/posts.interfaces";
import { usePosts } from "@/features/posts/hooks/use-posts";
import { Routes } from "@/routes/routes";
import type { Project } from "@/features/projects/interfaces/projects.interfaces";

const ALL_STATUSES = Object.values(PostStatuses);

interface OverviewTabProps {
  project: Project;
  onViewAllPosts: () => void;
}

export function OverviewTab({ project, onViewAllPosts }: OverviewTabProps) {
  const counts = project.post_status_counts ?? {};
  const { data: recentPostsPage, isPending } = usePosts({ project_id: project.id, limit: 4 });
  const recentPosts = recentPostsPage?.data ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <WorkflowBar counts={counts} />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {ALL_STATUSES.map((status) => (
                <div key={status}>
                  <div className="text-lg font-semibold">{counts[status] ?? 0}</div>
                  <div className="text-xs text-muted-foreground">{getDropdownOptionLabel(PostStatusFilterOptions, status)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent generated posts</CardTitle>
            <Button type="button" variant="link" onClick={onViewAllPosts} className="h-auto p-0 text-xs font-semibold text-brass-ink">
              View all →
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {isPending ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
            ) : recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No posts generated yet.</p>
            ) : (
              recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium">{post.title || post.hook || post.body?.slice(0, 60) || "Untitled post"}</span>
                  <PostStatusTag status={post.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content pillars</CardTitle>
          </CardHeader>
          <CardContent>
            {project.pillars.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pillars set.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {project.pillars.map((pillar) => (
                  <Badge key={pillar} variant="pill">
                    {pillar}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Style profiles in use</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {!project.style_profiles || project.style_profiles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No style profiles attached.</p>
            ) : (
              project.style_profiles.map((link) => (
                <div key={link.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{link.style_profile.name}</div>
                    <StyleDnaStrand traits={link.style_profile} className="mt-1 w-24" />
                  </div>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">{link.style_profile.posts_analyzed} posts</span>
                </div>
              ))
            )}
            <Button variant="outline" size="sm" asChild className="mt-1">
              <Link to={Routes.dashboard.style_profiles}>Manage style profiles</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
