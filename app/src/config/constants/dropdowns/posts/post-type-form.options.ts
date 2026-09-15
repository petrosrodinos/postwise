import { PostTypes, type PostType } from "@/features/posts/interfaces/posts.interfaces";

export const PostTypeFormOptions: { id: PostType; label: string }[] = [
  { id: PostTypes.LINKEDIN, label: "LinkedIn" },
  { id: PostTypes.TWITTER, label: "X" },
  { id: PostTypes.BLOG, label: "Blog" },
];

export function getPostTypeLabel(type: PostType | string): string {
  return PostTypeFormOptions.find((option) => option.id === type)?.label ?? type;
}
