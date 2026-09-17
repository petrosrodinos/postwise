import { z } from "zod";
import { PostTypes } from "@/features/posts/interfaces/posts.interfaces";

export const createProjectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  description: z.string().optional(),
  channels: z
    .array(z.enum([PostTypes.LINKEDIN, PostTypes.TWITTER, PostTypes.BLOG, PostTypes.INSTAGRAM]))
    .min(1, "Choose at least one channel"),
  style_profile_ids: z.array(z.string()),
  rss_feed_ids: z.array(z.string()),
  pillars: z.array(z.string()),
  ideas: z.array(z.string()),
  instructions: z.array(z.string()),
  ai_directions: z.string().optional(),
  humanize_by_default: z.boolean(),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;
