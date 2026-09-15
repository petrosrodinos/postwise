import { z } from 'zod';
import { PaginationSchema } from '@/shared/schemas/pagination.schema';
import { PostStatus, PostType } from 'generated/prisma';

export const PostsQuerySchema = PaginationSchema.extend({
  organisation_id: z.string(),
  project_id: z.string().optional(),
  status: z.nativeEnum(PostStatus).optional(),
  type: z.nativeEnum(PostType).optional(),
});

export type PostsQueryType = z.infer<typeof PostsQuerySchema>;
