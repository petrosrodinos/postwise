import { z } from "zod";
import { AutomationFrequencies, AutomationOutputStages } from "@/features/automations/interfaces/automations.interfaces";

export const automationSchema = z.object({
  project_id: z.string().min(1, "Choose a project"),
  style_profile_id: z.string().optional(),
  rss_feed_id: z.string().optional(),
  name: z.string().min(1, "Give this automation a name"),
  frequency: z.enum([AutomationFrequencies.WEEKLY, AutomationFrequencies.DAILY, AutomationFrequencies.WEEKDAYS]),
  days_of_week: z.array(z.number().min(0).max(6)),
  time_of_day: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use HH:mm format"),
  timezone: z.string().min(1),
  posts_per_run: z.number().min(1).max(10),
  output_stage: z.enum([AutomationOutputStages.DRAFT, AutomationOutputStages.REVIEW, AutomationOutputStages.PUBLISH]),
  generate_images: z.boolean(),
  image_count: z.number().min(1).max(4),
});

export type AutomationFormData = z.infer<typeof automationSchema>;
