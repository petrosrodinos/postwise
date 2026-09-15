import { z } from 'zod';
import { PaginationSchema } from '@/shared/schemas/pagination.schema';
import { PostType } from 'generated/prisma';

export const StyleProfilesQuerySchema = PaginationSchema.extend({
  organisation_id: z.string(),
  platform: z.nativeEnum(PostType).optional(),
});

export type StyleProfilesQueryType = z.infer<typeof StyleProfilesQuerySchema>;
