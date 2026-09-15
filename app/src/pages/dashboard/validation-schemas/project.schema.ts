import { z } from "zod";
import { PostTypes } from "@/features/posts/interfaces/posts.interfaces";

export const createProjectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  description: z.string().optional(),
  platform: z.enum([PostTypes.LINKEDIN, PostTypes.TWITTER, PostTypes.BLOG], {
    required_error: "Choose a platform",
  }),
  style_profile_ids: z.array(z.string()),
  rss_feed_ids: z.array(z.string()),
  pillars: z.array(z.string()),
  ideas: z.array(z.string()),
  instructions: z.array(z.string()),
  ai_directions: z.string().optional(),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;
