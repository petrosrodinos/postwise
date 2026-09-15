import { z } from 'zod';
import { PaginationSchema } from '@/shared/schemas/pagination.schema';
import { PostType } from 'generated/prisma';

export const ProjectsQuerySchema = PaginationSchema.extend({
  organisation_id: z.string().optional(),
  platform: z.nativeEnum(PostType).optional(),
  is_archived: z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true' || v === '1')),
});

export type ProjectsQueryType = z.infer<typeof ProjectsQuerySchema>;
