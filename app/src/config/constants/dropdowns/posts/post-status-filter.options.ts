import { PostStatuses, type PostStatus } from "@/features/posts/interfaces/posts.interfaces";

export const PostStatusFilterOptions: { id: PostStatus | "all"; label: string }[] = [
  { id: "all", label: "All statuses" },
  { id: PostStatuses.DRAFT, label: "Draft" },
  { id: PostStatuses.REVIEW, label: "Pending review" },
  { id: PostStatuses.READY, label: "Ready" },
  { id: PostStatuses.SCHEDULED, label: "Scheduled" },
  { id: PostStatuses.PUBLISHING, label: "Publishing" },
  { id: PostStatuses.PUBLISHED, label: "Published" },
  { id: PostStatuses.FAILED, label: "Failed" },
];

export function getPostStatusLabel(status: PostStatus | string): string {
  return PostStatusFilterOptions.find((option) => option.id === status)?.label ?? status;
}
