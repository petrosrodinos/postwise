import { z } from 'zod';

export const DraftSchema = z.object({
  hook: z.string().optional(),
  body: z.string(),
  title: z.string().optional(),
  excerpt: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

export const DraftsSchema = z.array(DraftSchema).min(1);

export type Draft = z.infer<typeof DraftSchema>;
