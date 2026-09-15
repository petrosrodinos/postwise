import { z } from 'zod';
import { PaginationSchema } from '@/shared/schemas/pagination.schema';
import { PostStatus, PostType } from 'generated/prisma';

export const PostSources = ['MANUAL', 'GENERATED', 'AUTOMATION', 'REPURPOSED'] as const;

export const PostsQuerySchema = PaginationSchema.extend({
  organisation_id: z.string(),
  project_id: z.string().optional(),
  status: z.nativeEnum(PostStatus).optional(),
  type: z.nativeEnum(PostType).optional(),
  search: z.string().optional(),
  automation_id: z.string().optional(),
  source: z.enum(PostSources).optional(),
  order_by: z.enum(['created_at', 'updated_at', 'scheduled_at']).default('created_at'),
  order_direction: z.enum(['asc', 'desc']).default('desc'),
});

export type PostsQueryType = z.infer<typeof PostsQuerySchema>;
