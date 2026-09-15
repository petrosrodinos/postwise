import { cn } from "@/lib/utils";
import { PostStatuses, type PostStatus } from "@/features/posts/interfaces/posts.interfaces";

export type WorkflowCounts = Partial<Record<PostStatus, number>>;

const SEGMENT_ORDER: { status: PostStatus; className: string }[] = [
  { status: PostStatuses.DRAFT, className: "bg-muted-foreground/40" },
  { status: PostStatuses.REVIEW, className: "bg-coral" },
  { status: PostStatuses.READY, className: "bg-violet" },
  { status: PostStatuses.SCHEDULED, className: "bg-brass" },
  { status: PostStatuses.PUBLISHING, className: "bg-brass" },
  { status: PostStatuses.FAILED, className: "bg-rust" },
  { status: PostStatuses.PUBLISHED, className: "bg-teal" },
];

interface WorkflowBarProps {
  counts: WorkflowCounts;
  className?: string;
}

export function WorkflowBar({ counts, className }: WorkflowBarProps) {
  const total = SEGMENT_ORDER.reduce((sum, segment) => sum + (counts[segment.status] ?? 0), 0);

  if (!total) {
    return <div className={cn("h-1.5 w-full rounded-full bg-muted", className)} />;
  }

  return (
    <div className={cn("flex h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      {SEGMENT_ORDER.filter((segment) => (counts[segment.status] ?? 0) > 0).map((segment) => (
        <div
          key={segment.status}
          className={cn("h-full", segment.className)}
          style={{ width: `${((counts[segment.status] ?? 0) / total) * 100}%` }}
        />
      ))}
    </div>
  );
}
