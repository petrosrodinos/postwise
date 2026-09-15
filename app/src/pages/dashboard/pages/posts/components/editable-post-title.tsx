import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useUpdatePost } from "@/features/posts/hooks/use-posts";
import type { Post } from "@/features/posts/interfaces/posts.interfaces";

interface EditablePostTitleProps {
  post: Post;
  className?: string;
  fallback?: string;
}

export function EditablePostTitle({ post, className, fallback }: EditablePostTitleProps) {
  const { mutate: updatePost } = useUpdatePost();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(post.title ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(post.title ?? "");
  }, [post.id, post.title]);

  useEffect(() => {
    if (isEditing) inputRef.current?.select();
  }, [isEditing]);

  function commit() {
    setIsEditing(false);
    const trimmed = value.trim();
    if (trimmed === (post.title ?? "").trim()) return;
    if (!trimmed) {
      setValue(post.title ?? "");
      return;
    }
    updatePost({ id: post.id, dto: { title: trimmed } });
  }

  function cancel() {
    setValue(post.title ?? "");
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            cancel();
          }
        }}
        onClick={(e) => e.stopPropagation()}
        className={cn("h-8", className)}
      />
    );
  }

  return (
    <span
      role="textbox"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.stopPropagation();
          setIsEditing(true);
        }
      }}
      title="Click to edit title"
      className={cn("cursor-text rounded-sm underline decoration-dotted decoration-muted-foreground/50 underline-offset-4 hover:decoration-foreground", className)}
    >
      {post.title || post.hook || fallback || "Untitled post"}
    </span>
  );
}
