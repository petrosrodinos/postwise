import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useAttachRssFeed, useAttachStyleProfile, useCreateProject } from "@/features/projects/hooks/use-projects";
import { useStyleProfiles } from "@/features/style-profiles/hooks/use-style-profiles";
import { useRssFeeds } from "@/features/rss-feeds/hooks/use-rss-feeds";
import { Routes } from "@/routes/routes";
import { createProjectSchema, type CreateProjectFormData } from "@/pages/dashboard/validation-schemas/project.schema";
import { ProjectForm } from "../../components/project-form";

export default function NewProjectPage() {
  const navigate = useNavigate();
  const { mutate: createProject, isPending: isCreating } = useCreateProject();
  const { mutate: attachStyleProfile } = useAttachStyleProfile();
  const { mutate: attachRssFeed } = useAttachRssFeed();
  const { data: styleProfilesPage } = useStyleProfiles({ limit: 100 });
  const styleProfiles = styleProfilesPage?.data ?? [];
  const { data: rssFeedsPage } = useRssFeeds({ limit: 100 });
  const rssFeeds = rssFeedsPage?.data ?? [];

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      platform: undefined,
      style_profile_ids: [],
      rss_feed_ids: [],
      pillars: [],
      ideas: [],
      instructions: [],
      ai_directions: "",
    },
  });

  function onSubmit(data: CreateProjectFormData) {
    createProject(
      {
        title: data.title,
        description: data.description || undefined,
        platform: data.platform,
        pillars: data.pillars,
        ideas: data.ideas,
        instructions: data.instructions,
        ai_directions: data.ai_directions || undefined,
      },
      {
        onSuccess: (project) => {
          for (const styleProfileId of data.style_profile_ids) {
            attachStyleProfile({ id: project.id, dto: { style_profile_id: styleProfileId } });
          }
          for (const rssFeedId of data.rss_feed_ids) {
            attachRssFeed({ id: project.id, dto: { rss_feed_id: rssFeedId } });
          }
          navigate(Routes.dashboard.project_detail(project.id));
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to={Routes.dashboard.projects}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All projects
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">Create a new project</h1>
        <p className="mt-1 text-sm text-muted-foreground">Organize AI generation around a goal, audience and voice.</p>
      </div>

      <ProjectForm
        form={form}
        onSubmit={onSubmit}
        submitLabel="Create project"
        isSubmitting={isCreating}
        onCancel={() => navigate(Routes.dashboard.projects)}
        styleProfiles={styleProfiles}
        rssFeeds={rssFeeds}
      />
    </div>
  );
}
