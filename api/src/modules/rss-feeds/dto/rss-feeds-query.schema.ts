import { z } from 'zod';
import { PaginationSchema } from '@/shared/schemas/pagination.schema';

export const RssFeedsQuerySchema = PaginationSchema.extend({
  organisation_id: z.string(),
});

export type RssFeedsQueryType = z.infer<typeof RssFeedsQuerySchema>;
