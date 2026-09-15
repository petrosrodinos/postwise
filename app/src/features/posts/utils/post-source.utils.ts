import { PostSources, type Post, type PostSource } from "../interfaces/posts.interfaces";

export function getPostSource(post: Pick<Post, "automation_id" | "source_post_id" | "generation_run_id">): PostSource {
  if (post.automation_id) return PostSources.AUTOMATION;
  if (post.source_post_id) return PostSources.REPURPOSED;
  if (post.generation_run_id) return PostSources.GENERATED;
  return PostSources.MANUAL;
}
