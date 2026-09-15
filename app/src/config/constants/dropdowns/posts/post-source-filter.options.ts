import { PostSources, type PostSource } from "@/features/posts/interfaces/posts.interfaces";

export const PostSourceFilterOptions: { id: PostSource | "all"; label: string }[] = [
  { id: "all", label: "All sources" },
  { id: PostSources.MANUAL, label: "Manual" },
  { id: PostSources.GENERATED, label: "AI Generated" },
  { id: PostSources.AUTOMATION, label: "Automation" },
  { id: PostSources.REPURPOSED, label: "Repurposed" },
];

export function getPostSourceLabel(source: PostSource | string): string {
  return PostSourceFilterOptions.find((option) => option.id === source)?.label ?? source;
}
