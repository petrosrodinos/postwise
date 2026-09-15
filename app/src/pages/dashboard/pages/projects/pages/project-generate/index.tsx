import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Routes } from "@/routes/routes";
import { useProject } from "@/features/projects/hooks/use-projects";
import { useCreateGenerationRun, useGenerationRun } from "@/features/generation-runs/hooks/use-generation-runs";
import { GenerationContextCard } from "./components/generation-context-card";
import { GeneratedPostCard } from "./components/generated-post-card";

export default function ProjectGeneratePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const runId = searchParams.get("run") ?? undefined;

  const { data: project, isPending: isProjectPending } = useProject(id);
  const { data: run, isPending: isRunPending } = useGenerationRun(runId);
  const { mutate: createRun, isPending: isGenerating } = useCreateGenerationRun();

  const [styleProfileId, setStyleProfileId] = useState("");
  const [postsRequested, setPostsRequested] = useState(4);

  useEffect(() => {
    if (run) {
      setStyleProfileId(run.style_profile_id ?? "");
    } else if (project) {
      setStyleProfileId(project.style_profiles?.[0]?.style_profile_id ?? "");
    }
  }, [run, project]);

  if (isProjectPending || (runId && isRunPending)) {
    return (
      <div className="grid gap-6" style={{ gridTemplateColumns: "320px 1fr" }}>
        <Skeleton className="h-96 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!id || !project) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted-foreground">This project couldn't be found.</p>
        <Link to={Routes.dashboard.projects} className="text-sm font-semibold text-brass-ink hover:underline">
          ← All projects
        </Link>
      </div>
    );
  }

  if (runId && !run) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted-foreground">This batch couldn't be found.</p>
        <Link to={Routes.dashboard.project_detail(id)} className="text-sm font-semibold text-brass-ink hover:underline">
          ← Back to {project.title}
        </Link>
      </div>
    );
  }

  const posts = run?.posts ?? [];

  function handleGenerate() {
    createRun(
      {
        project_id: id!,
        style_profile_id: styleProfileId || undefined,
        posts_requested: run ? (run.posts_requested ?? (posts.length || 4)) : postsRequested,
      },
      {
        onSuccess: (newRun) => {
          setSearchParams({ run: newRun.id });
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to={Routes.dashboard.project_detail(id)}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {project.title}
      </Link>

      <div className="grid items-start gap-6" style={{ gridTemplateColumns: "320px 1fr" }}>
        <GenerationContextCard
          project={project}
          isExistingRun={!!run}
          styleProfileId={styleProfileId}
          onStyleProfileChange={setStyleProfileId}
          postsRequested={postsRequested}
          onPostsRequestedChange={setPostsRequested}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />

        <div className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-semibold">{run ? run.label ?? "New batch" : "New generation"}</h2>
            <span className="text-sm text-muted-foreground">
              {run
                ? `Created ${formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}`
                : posts.length > 0
                  ? `${posts.length} posts in this batch`
                  : ""}
            </span>
          </div>

          {isGenerating ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: run?.posts_requested ?? postsRequested }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-11/12" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
              <h3 className="text-base font-semibold text-foreground">No generation yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm">Choose a style profile and a batch size, then generate this project's first drafts.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {posts.map((post) => (
                <GeneratedPostCard key={post.id} post={post} platform={project.platform} styleProfiles={project.style_profiles ?? []} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
