import type { PostType } from "@/features/posts/interfaces/posts.interfaces";
import { PostTypeFormOptions } from "./post-type-form.options";

export const PostTypeFilterOptions: { id: PostType | "all"; label: string }[] = [
  { id: "all", label: "All platforms" },
  ...PostTypeFormOptions,
];
