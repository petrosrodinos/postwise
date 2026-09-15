import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Routes } from "@/routes/routes";
import { useProject } from "@/features/projects/hooks/use-projects";
import { useAddPostsToGenerationRun, useCreateGenerationRun, useGenerationRun } from "@/features/generation-runs/hooks/use-generation-runs";
import { DEFAULT_LANGUAGE } from "@/config/constants/dropdowns/generation-runs/language-form.options";
import { PostTypes } from "@/features/posts/interfaces/posts.interfaces";
import { GenerationContextCard } from "./components/generation-context-card";
import { GeneratedPostCard } from "./components/generated-post-card";
import { RssItemPickerCard } from "./components/rss-item-picker-card";

type GenerationSource = "ideas" | "rss";

export default function ProjectGeneratePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const runId = searchParams.get("run") ?? undefined;
  const tabParam = searchParams.get("tab");
  const backToProjectUrl = tabParam ? `${Routes.dashboard.project_detail(id ?? "")}?tab=${tabParam}` : Routes.dashboard.project_detail(id ?? "");

  const { data: project, isPending: isProjectPending } = useProject(id);
  const { data: run, isPending: isRunPending } = useGenerationRun(runId);
  const { mutate: createRun, isPending: isCreatingRun } = useCreateGenerationRun();
  const { mutate: addPosts, isPending: isAddingPosts } = useAddPostsToGenerationRun();
  const isGenerating = isCreatingRun || isAddingPosts;

  const [source, setSource] = useState<GenerationSource>("ideas");
  const [styleProfileId, setStyleProfileId] = useState("");
  const [postsRequested, setPostsRequested] = useState(4);
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [generateImages, setGenerateImages] = useState(false);
  const [imageCount, setImageCount] = useState(1);

  useEffect(() => {
    if (run) {
      setStyleProfileId(run.style_profile_id ?? "");
      setLanguage(run.language ?? DEFAULT_LANGUAGE);
    } else if (project) {
      setStyleProfileId(project.style_profiles?.[0]?.style_profile_id ?? "");
    }
  }, [run, project]);

  if (isProjectPending || (runId && isRunPending)) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-4 w-32" />
        <div className="grid items-start gap-6" style={{ gridTemplateColumns: "320px 1fr" }}>
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-36" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ))}
            <Skeleton className="mt-1 h-9 w-full rounded-md" />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between gap-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3.5 w-28" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-11/12" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          </div>
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
        <Link to={backToProjectUrl} className="text-sm font-semibold text-brass-ink hover:underline">
          ← Back to {project.title}
        </Link>
      </div>
    );
  }

  const posts = run?.posts ?? [];

  function handleGenerate() {
    if (run) {
      addPosts({
        id: run.id,
        dto: {
          style_profile_id: styleProfileId || undefined,
          posts_requested: postsRequested,
          language,
          generate_images: generateImages,
          image_count: imageCount,
        },
      });
      return;
    }

    createRun(
      {
        project_id: id!,
        style_profile_id: styleProfileId || undefined,
        posts_requested: postsRequested,
        language,
        generate_images: generateImages,
        image_count: imageCount,
      },
      {
        onSuccess: (newRun) => {
          setSearchParams({ run: newRun.id });
        },
      },
    );
  }

  const isBlog = project.platform === PostTypes.BLOG;

  return (
    <div className="flex flex-col gap-6">
      <Link
        to={backToProjectUrl}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {project.title}
      </Link>

      <div className="grid items-start gap-6" style={{ gridTemplateColumns: "320px 1fr" }}>
        <div className="flex flex-col gap-4">
          {isBlog && !run && (
            <div className="inline-flex rounded-lg border border-input p-1">
              {(
                [
                  { id: "ideas", label: "From ideas" },
                  { id: "rss", label: "From RSS feed" },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    source === option.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setSource(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {source === "rss" && isBlog && !run ? (
            <RssItemPickerCard
              project={project}
              styleProfileId={styleProfileId}
              language={language}
              generateImages={generateImages}
              imageCount={imageCount}
              onGenerated={(newRun) => setSearchParams({ run: newRun.id })}
            />
          ) : (
            <GenerationContextCard
              project={project}
              isExistingRun={!!run}
              styleProfileId={styleProfileId}
              onStyleProfileChange={setStyleProfileId}
              postsRequested={postsRequested}
              onPostsRequestedChange={setPostsRequested}
              language={language}
              onLanguageChange={setLanguage}
              generateImages={generateImages}
              onGenerateImagesChange={setGenerateImages}
              imageCount={imageCount}
              onImageCountChange={setImageCount}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          )}
        </div>

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

          {posts.length === 0 && !isGenerating ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
              <h3 className="text-base font-semibold text-foreground">No generation yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm">Choose a style profile and a batch size, then generate this project's first drafts.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {posts.map((post) => (
                <GeneratedPostCard key={post.id} post={post} platform={project.platform} styleProfiles={project.style_profiles ?? []} />
              ))}
              {isGenerating &&
                Array.from({ length: postsRequested }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <Skeleton className="h-5 w-24 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-11/12" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
