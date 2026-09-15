import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PostStatusTag } from "@/components/ui/post-status-tag";
import { PlatformChip } from "@/components/ui/platform-glyph";
import { getPostTypeLabel } from "@/config/constants/dropdowns/posts/post-type-form.options";
import { getPostSourceLabel } from "@/config/constants/dropdowns/posts/post-source-filter.options";
import { useUpdatePost } from "@/features/posts/hooks/use-posts";
import { getPostSource } from "@/features/posts/utils/post-source.utils";
import { PostStatuses, type Post } from "@/features/posts/interfaces/posts.interfaces";
import { Routes } from "@/routes/routes";
import { PostRowActions } from "./post-row-actions";

const EDITABLE_STATUSES: string[] = [PostStatuses.DRAFT, PostStatuses.REVIEW, PostStatuses.READY];

interface PostPreviewDrawerProps {
  post: Post | null;
  onClose: () => void;
}

export function PostPreviewDrawer({ post, onClose }: PostPreviewDrawerProps) {
  const { mutate: updatePost, isPending: isSaving } = useUpdatePost();
  const [body, setBody] = useState(post?.body ?? "");

  useEffect(() => {
    setBody(post?.body ?? "");
  }, [post?.id, post?.body]);

  const isOpen = !!post;
  const isEditable = post ? EDITABLE_STATUSES.includes(post.status) : false;
  const isDirty = post ? body !== (post.body ?? "") : false;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        {post && (
          <>
            <SheetHeader className="text-left">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <SheetTitle className="font-display truncate text-xl">{post.title || post.hook || "Untitled post"}</SheetTitle>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <PlatformChip platform={post.type} label={getPostTypeLabel(post.type)} />
                    <PostStatusTag status={post.status} title={post.status === PostStatuses.FAILED ? (post.failed_reason ?? undefined) : undefined} />
                    <Badge variant="pill">{getPostSourceLabel(getPostSource(post))}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {post.project && (
                      <Link to={Routes.dashboard.project_detail(post.project.id)} className="font-semibold text-brass-ink hover:underline">
                        {post.project.title}
                      </Link>
                    )}
                    {post.automation && <span>via automation "{post.automation.name}"</span>}
                    <span>updated {format(new Date(post.updated_at), "MMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                </div>
                <PostRowActions post={post} triggerClassName="mr-6 h-8 w-8" />
              </div>
            </SheetHeader>

            <div className="mt-6 flex flex-col gap-4">
              {post.hook && (
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Hook</div>
                  <p className="text-sm font-medium">{post.hook}</p>
                </div>
              )}

              {post.type === "BLOG" && post.excerpt && (
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Excerpt</div>
                  <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                </div>
              )}

              {post.cover_document_id && post.attachments && (
                <img
                  src={post.attachments.find((a) => a.document_id === post.cover_document_id)?.document?.url}
                  alt="Cover"
                  className="max-h-56 w-full rounded-xl border border-border object-cover"
                />
              )}

              <div>
                <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Body</div>
                {isEditable ? (
                  <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} className="text-sm leading-relaxed" />
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.body}</p>
                )}
              </div>

              {(post.scheduled_at || post.published_at) && (
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  {post.scheduled_at && <span>Scheduled for {format(new Date(post.scheduled_at), "MMM d, yyyy 'at' h:mm a")}</span>}
                  {post.published_at && <span>Published {format(new Date(post.published_at), "MMM d, yyyy 'at' h:mm a")}</span>}
                </div>
              )}
            </div>

            {isEditable && (
              <div className="mt-8 flex justify-end border-t border-border pt-4">
                <Button disabled={!isDirty || isSaving} loading={isSaving} onClick={() => updatePost({ id: post.id, dto: { body } })}>
                  Save changes
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
