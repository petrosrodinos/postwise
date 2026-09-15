import { z } from 'zod';
import { PaginationSchema } from '@/shared/schemas/pagination.schema';

export const AutomationsQuerySchema = PaginationSchema.extend({
  project_id: z.string(),
});

export type AutomationsQueryType = z.infer<typeof AutomationsQuerySchema>;
