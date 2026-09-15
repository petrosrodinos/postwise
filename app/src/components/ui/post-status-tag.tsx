import { cn } from "@/lib/utils";
import { PostStatuses, type PostStatus } from "@/features/posts/interfaces/posts.interfaces";
import { PostStatusFilterOptions } from "@/config/constants/dropdowns/posts/post-status-filter.options";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";

const STATUS_STYLE: Record<PostStatus, string> = {
  [PostStatuses.DRAFT]: "bg-secondary text-secondary-foreground",
  [PostStatuses.REVIEW]: "bg-coral-soft text-coral",
  [PostStatuses.READY]: "bg-violet-soft text-violet",
  [PostStatuses.SCHEDULED]: "bg-brass-soft text-brass-ink",
  [PostStatuses.PUBLISHING]: "bg-brass-soft text-brass-ink",
  [PostStatuses.PUBLISHED]: "bg-teal-soft text-teal",
  [PostStatuses.FAILED]: "bg-rust text-white",
};

const STATUS_DOT: Record<PostStatus, string> = {
  [PostStatuses.DRAFT]: "bg-muted-foreground",
  [PostStatuses.REVIEW]: "bg-coral",
  [PostStatuses.READY]: "bg-violet",
  [PostStatuses.SCHEDULED]: "bg-brass",
  [PostStatuses.PUBLISHING]: "bg-brass animate-pulse",
  [PostStatuses.PUBLISHED]: "bg-teal",
  [PostStatuses.FAILED]: "bg-rust",
};

interface PostStatusTagProps {
  status: PostStatus;
  className?: string;
  title?: string;
}

export function PostStatusTag({ status, className, title }: PostStatusTagProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_STYLE[status], className)}
      title={title}
    >
      <span className={cn("inline-block h-[7px] w-[7px] rounded-full", STATUS_DOT[status])} />
      {getDropdownOptionLabel(PostStatusFilterOptions, status)}
    </span>
  );
}
