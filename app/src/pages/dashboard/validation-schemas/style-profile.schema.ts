import { z } from "zod";
import { PostTypes } from "@/features/posts/interfaces/posts.interfaces";

export const analyzeStyleProfileSchema = z
  .object({
    name: z.string().min(1, "Give this Style DNA profile a name"),
    platform: z.enum([PostTypes.LINKEDIN, PostTypes.TWITTER, PostTypes.BLOG, PostTypes.INSTAGRAM]),
    source_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
    sample_posts: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.platform === PostTypes.INSTAGRAM && !data.sample_posts?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Paste at least one sample post",
        path: ["sample_posts"],
      });
    }
  });

export type AnalyzeStyleProfileFormData = z.infer<typeof analyzeStyleProfileSchema>;

export function samplePostsToArray(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map((post) => post.trim())
    .filter(Boolean);
}
