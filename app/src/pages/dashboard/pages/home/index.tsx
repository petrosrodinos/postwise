import { useState } from "react";
import { Link } from "react-router-dom";
import { FolderKanban, Sparkles, Dna } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Routes } from "@/routes/routes";
import { useAuthStore } from "@/stores/auth";
import { useWorkspaceStore } from "@/stores/workspace";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useStyleProfiles } from "@/features/style-profiles/hooks/use-style-profiles";
import { usePosts } from "@/features/posts/hooks/use-posts";
import { ProjectCard } from "@/pages/dashboard/components/project-card";
import { NewProjectDialog } from "@/pages/dashboard/components/new-project-dialog";
import { AnalyzeCreatorDialog } from "@/pages/dashboard/components/analyze-creator-dialog";
import { DnaBadge } from "@/components/ui/dna-badge";
import { PostStatusTag } from "@/components/ui/post-status-tag";
import { PlatformGlyph } from "@/components/ui/platform-glyph";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardHomePage() {
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isAnalyzeOpen, setIsAnalyzeOpen] = useState(false);

  const fullName = useAuthStore((state) => state.full_name);
  const activeOrganisationName = useWorkspaceStore((state) => state.active_organisation_name);

  const { data: projectsPage, isPending: isProjectsPending } = useProjects({ is_archived: false, limit: 4 });
  const { data: styleProfilesPage, isPending: isProfilesPending } = useStyleProfiles({ limit: 4 });
  const { data: recentPostsPage, isPending: isPostsPending } = usePosts({ limit: 5 });

  const projects = projectsPage?.data ?? [];
  const styleProfiles = styleProfilesPage?.data ?? [];
  const recentPosts = recentPostsPage?.data ?? [];
  const totalPostsAnalyzed = styleProfiles.reduce((sum, profile) => sum + profile.posts_analyzed, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {greeting()}, {fullName ?? "there"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's happening across your LinkedIn, X and blog content{activeOrganisationName ? ` in ${activeOrganisationName}` : ""}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAnalyzeOpen(true)}>
            Analyze a creator
          </Button>
          <Button onClick={() => setIsNewProjectOpen(true)}>New project</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Active projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-brass" />
          </CardHeader>
          <CardContent>
            {isProjectsPending ? <Skeleton className="h-8 w-16" /> : <div className="font-display text-3xl font-semibold">{projectsPage?.pagination.total ?? 0}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Posts</CardTitle>
            <Sparkles className="h-4 w-4 text-coral" />
          </CardHeader>
          <CardContent>
            {isPostsPending ? <Skeleton className="h-8 w-16" /> : <div className="font-display text-3xl font-semibold">{recentPostsPage?.pagination.total ?? 0}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Style profiles trained</CardTitle>
            <Dna className="h-4 w-4 text-violet" />
          </CardHeader>
          <CardContent>
            {isProfilesPending ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="font-display text-3xl font-semibold">{styleProfilesPage?.pagination.total ?? 0}</div>
                <p className="mt-2 text-xs text-muted-foreground">{totalPostsAnalyzed} source posts analyzed</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Your projects</h2>
            <Link to={Routes.dashboard.projects} className="text-sm font-semibold text-brass-ink hover:underline">
              View all →
            </Link>
          </div>
          {isProjectsPending ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-2xl" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
              <h3 className="text-base font-semibold text-foreground">No projects yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm">Create a project to organize AI generation around a goal, audience and voice.</p>
              <Button className="mt-4" onClick={() => setIsNewProjectOpen(true)}>
                New project
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent posts</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {isPostsPending ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
              ) : recentPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No posts yet.</p>
              ) : (
                recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <PlatformGlyph platform={post.type} />
                      <span className="truncate text-sm font-medium">{post.title || post.hook || post.body?.slice(0, 40) || "Untitled post"}</span>
                    </div>
                    <PostStatusTag status={post.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Style profiles</CardTitle>
              <Link to={Routes.dashboard.style_profiles} className="text-xs font-semibold text-brass-ink hover:underline">
                Manage →
              </Link>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {isProfilesPending ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
              ) : styleProfiles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No style profiles yet.</p>
              ) : (
                styleProfiles.map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between gap-3">
                    <DnaBadge name={profile.name} traits={profile} />
                    <span className="text-xs text-muted-foreground">{profile.posts_analyzed} posts</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <NewProjectDialog isOpen={isNewProjectOpen} onClose={() => setIsNewProjectOpen(false)} />
      <AnalyzeCreatorDialog isOpen={isAnalyzeOpen} onClose={() => setIsAnalyzeOpen(false)} />
    </div>
  );
}
