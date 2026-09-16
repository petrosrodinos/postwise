import { z } from 'zod';
import { PaginationSchema } from '@/shared/schemas/pagination.schema';
import { IntegrationProvider } from 'generated/prisma';

export const IntegrationsQuerySchema = PaginationSchema.extend({
  organisation_id: z.string(),
  provider: z.nativeEnum(IntegrationProvider).optional(),
});

export type IntegrationsQueryType = z.infer<typeof IntegrationsQuerySchema>;
