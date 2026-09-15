import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Routes } from "@/routes/routes";
import { PlatformGlyph } from "@/components/ui/platform-glyph";
import { Badge } from "@/components/ui/badge";
import { DnaBadge } from "@/components/ui/dna-badge";
import { WorkflowBar } from "@/components/ui/workflow-bar";
import { Skeleton } from "@/components/ui/skeleton";
import type { Project } from "@/features/projects/interfaces/projects.interfaces";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCardSkeleton() {
  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3.5 w-full" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-1 h-1.5 w-full rounded-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function ProjectCard({ project }: ProjectCardProps) {
  const counts = project.post_status_counts ?? {};
  const totalPosts = Object.values(counts).reduce((sum, value) => sum + (value ?? 0), 0);
  const scheduled = counts.SCHEDULED ?? 0;

  return (
    <Link
      to={Routes.dashboard.project_detail(project.id)}
      className="flex flex-col gap-3.5 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <PlatformGlyph platform={project.platform} />
        <span>Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}</span>
      </div>

      <div>
        <h3 className="text-base font-semibold">{project.title}</h3>
        {project.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>}
      </div>

      {project.pillars.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.pillars.map((pillar) => (
            <Badge key={pillar} variant="pill">
              {pillar}
            </Badge>
          ))}
        </div>
      )}

      {project.style_profiles && project.style_profiles.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.style_profiles.map((link) => (
            <DnaBadge key={link.id} name={link.style_profile.name} />
          ))}
        </div>
      )}

      <WorkflowBar counts={counts} className="mt-1" />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {totalPosts} post{totalPosts === 1 ? "" : "s"} · {project.style_profiles?.length ?? 0} style profile
          {project.style_profiles?.length === 1 ? "" : "s"}
        </span>
        <span>{scheduled} scheduled</span>
      </div>
    </Link>
  );
}
