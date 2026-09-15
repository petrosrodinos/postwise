import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAttachRssFeed,
  useAttachStyleProfile,
  useDetachRssFeed,
  useDetachStyleProfile,
  useProject,
  useUpdateProject,
} from "@/features/projects/hooks/use-projects";
import { useStyleProfiles } from "@/features/style-profiles/hooks/use-style-profiles";
import { useRssFeeds } from "@/features/rss-feeds/hooks/use-rss-feeds";
import { Routes } from "@/routes/routes";
import { createProjectSchema, type CreateProjectFormData } from "@/pages/dashboard/validation-schemas/project.schema";
import { ProjectForm } from "../../components/project-form";

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isPending } = useProject(id);
  const { mutate: updateProject, isPending: isSaving } = useUpdateProject();
  const { mutate: attachStyleProfile } = useAttachStyleProfile();
  const { mutate: detachStyleProfile } = useDetachStyleProfile();
  const { mutate: attachRssFeed } = useAttachRssFeed();
  const { mutate: detachRssFeed } = useDetachRssFeed();
  const { data: styleProfilesPage } = useStyleProfiles({ limit: 100 });
  const styleProfiles = styleProfilesPage?.data ?? [];
  const { data: rssFeedsPage } = useRssFeeds({ limit: 100 });
  const rssFeeds = rssFeedsPage?.data ?? [];

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    values: project
      ? {
          title: project.title,
          description: project.description ?? "",
          platform: project.platform,
          style_profile_ids: project.style_profiles?.map((link) => link.style_profile_id) ?? [],
          rss_feed_ids: project.rss_feeds?.map((link) => link.rss_feed_id) ?? [],
          pillars: project.pillars,
          ideas: project.ideas,
          instructions: project.instructions,
          ai_directions: project.ai_directions ?? "",
        }
      : undefined,
  });

  if (isPending) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-1 h-7 w-40" />
          <Skeleton className="h-4 w-80" />
        </div>

        <div className="grid items-start gap-6" style={{ gridTemplateColumns: "1fr 320px" }}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6">
              <Skeleton className="h-4 w-16" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-16 w-full rounded-md" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>

            <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6">
              <Skeleton className="h-4 w-36" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>
          </div>

          <Skeleton className="h-64 w-full rounded-2xl" />
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

  function onSubmit(data: CreateProjectFormData) {
    const initialStyleProfileIds = project!.style_profiles?.map((link) => link.style_profile_id) ?? [];
    const toAttach = data.style_profile_ids.filter((profileId) => !initialStyleProfileIds.includes(profileId));
    const toDetach = initialStyleProfileIds.filter((profileId) => !data.style_profile_ids.includes(profileId));

    const initialRssFeedIds = project!.rss_feeds?.map((link) => link.rss_feed_id) ?? [];
    const rssFeedsToAttach = data.rss_feed_ids.filter((feedId) => !initialRssFeedIds.includes(feedId));
    const rssFeedsToDetach = initialRssFeedIds.filter((feedId) => !data.rss_feed_ids.includes(feedId));

    updateProject(
      {
        id: project!.id,
        dto: {
          title: data.title,
          description: data.description || undefined,
          platform: data.platform,
          pillars: data.pillars,
          ideas: data.ideas,
          instructions: data.instructions,
          ai_directions: data.ai_directions || undefined,
        },
      },
      {
        onSuccess: () => {
          for (const styleProfileId of toAttach) {
            attachStyleProfile({ id: project!.id, dto: { style_profile_id: styleProfileId } });
          }
          for (const styleProfileId of toDetach) {
            detachStyleProfile({ id: project!.id, styleProfileId });
          }
          for (const rssFeedId of rssFeedsToAttach) {
            attachRssFeed({ id: project!.id, dto: { rss_feed_id: rssFeedId } });
          }
          for (const rssFeedId of rssFeedsToDetach) {
            detachRssFeed({ id: project!.id, rssFeedId });
          }
          navigate(Routes.dashboard.project_detail(project!.id));
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to={Routes.dashboard.project_detail(project.id)}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {project.title}
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">Edit project</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update the goal, audience and voice this project drafts from.</p>
      </div>

      <ProjectForm
        form={form}
        onSubmit={onSubmit}
        submitLabel="Save changes"
        isSubmitting={isSaving}
        onCancel={() => navigate(Routes.dashboard.project_detail(project.id))}
        styleProfiles={styleProfiles}
        rssFeeds={rssFeeds}
      />
    </div>
  );
}
