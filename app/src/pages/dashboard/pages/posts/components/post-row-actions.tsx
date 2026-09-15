import { useState } from "react";
import { Eye, MoreHorizontal, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { useDeletePost, usePublishPost } from "@/features/posts/hooks/use-posts";
import { PostStatuses, type Post } from "@/features/posts/interfaces/posts.interfaces";

interface PostRowActionsProps {
  post: Post;
  onPreview?: () => void;
  triggerClassName?: string;
}

export function PostRowActions({ post, onPreview, triggerClassName }: PostRowActionsProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { mutate: publishPost, isPending: isPublishing } = usePublishPost();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();

  const canPublish = post.status !== PostStatuses.PUBLISHED && post.status !== PostStatuses.PUBLISHING;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={triggerClassName ?? "h-8 w-8"}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onPreview && (
            <DropdownMenuItem onClick={onPreview}>
              <Eye className="h-4 w-4" />
              Preview
            </DropdownMenuItem>
          )}
          <DropdownMenuItem disabled={!canPublish || isPublishing} onClick={() => publishPost(post.id)}>
            <Send className="h-4 w-4" />
            Publish now
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setIsDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => deletePost(post.id, { onSuccess: () => setIsDeleteOpen(false) })}
        title="Delete post?"
        description={`"${post.title || post.hook || "This post"}" will be permanently deleted.`}
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
      />
    </>
  );
}
