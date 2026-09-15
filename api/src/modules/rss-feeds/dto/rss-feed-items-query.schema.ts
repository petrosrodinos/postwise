import { z } from 'zod';

export const RssFeedItemsQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 20)),
  since: z.string().optional(),
  unused_only: z
    .string()
    .optional()
    .transform((v) => v === undefined || v === 'true'),
});

export type RssFeedItemsQueryType = z.infer<typeof RssFeedItemsQuerySchema>;
