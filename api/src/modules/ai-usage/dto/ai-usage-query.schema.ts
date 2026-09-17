import { z } from 'zod';
import { PaginationSchema } from '@/shared/schemas/pagination.schema';
import { AiUsageFeature, AiUsageType } from 'generated/prisma';

export const AiUsageQuerySchema = PaginationSchema.extend({
  type: z.nativeEnum(AiUsageType).optional(),
  feature: z.nativeEnum(AiUsageFeature).optional(),
  provider: z.string().optional(),
  model: z.string().optional(),
  user_id: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type AiUsageQueryType = z.infer<typeof AiUsageQuerySchema>;
