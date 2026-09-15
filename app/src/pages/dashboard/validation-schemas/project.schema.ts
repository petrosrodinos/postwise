import { z } from "zod";
import { PostTypes } from "@/features/posts/interfaces/posts.interfaces";

export const createProjectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  description: z.string().optional(),
  platform: z.enum([PostTypes.LINKEDIN, PostTypes.TWITTER, PostTypes.BLOG]),
  style_profile_ids: z.array(z.string()),
  pillars: z.array(z.string()),
  ideas: z.string().optional(),
  instructions: z.string().optional(),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;

export function linesToArray(value?: string): string[] {
  if (!value) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
