import { z } from "zod";
import { PostTypes } from "@/features/posts/interfaces/posts.interfaces";

export const projectSettingsSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  description: z.string().optional(),
  platform: z.enum([PostTypes.LINKEDIN, PostTypes.TWITTER, PostTypes.BLOG]),
});

export type ProjectSettingsFormData = z.infer<typeof projectSettingsSchema>;
