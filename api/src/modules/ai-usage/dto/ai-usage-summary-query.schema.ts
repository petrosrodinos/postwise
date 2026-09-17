import { z } from 'zod';
import { AiUsageFeature, AiUsageType } from 'generated/prisma';

export const AiUsageSummaryQuerySchema = z.object({
  type: z.nativeEnum(AiUsageType).optional(),
  feature: z.nativeEnum(AiUsageFeature).optional(),
  provider: z.string().optional(),
  model: z.string().optional(),
  user_id: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type AiUsageSummaryQueryType = z.infer<typeof AiUsageSummaryQuerySchema>;
