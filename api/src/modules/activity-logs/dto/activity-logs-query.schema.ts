import { z } from 'zod';
import { PaginationSchema } from '@/shared/schemas/pagination.schema';
import { ActivityLogAction, ActivityLogEntityType } from 'generated/prisma';

export const ActivityLogsQuerySchema = PaginationSchema.extend({
  action: z.nativeEnum(ActivityLogAction).optional(),
  entity_type: z.nativeEnum(ActivityLogEntityType).optional(),
  user_id: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type ActivityLogsQueryType = z.infer<typeof ActivityLogsQuerySchema>;
