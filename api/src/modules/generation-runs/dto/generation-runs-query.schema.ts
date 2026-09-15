import { z } from 'zod';
import { PaginationSchema } from '@/shared/schemas/pagination.schema';

export const GenerationRunsQuerySchema = PaginationSchema.extend({
  project_id: z.string().optional(),
});

export type GenerationRunsQueryType = z.infer<typeof GenerationRunsQuerySchema>;
