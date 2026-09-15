import { z } from 'zod';
import { PaginationSchema } from '@/shared/schemas/pagination.schema';
import { SocialChannel } from 'generated/prisma';

export const SocialChannelConnectionsQuerySchema = PaginationSchema.extend({
  organisation_id: z.string().optional(),
  channel: z.nativeEnum(SocialChannel).optional(),
});

export type SocialChannelConnectionsQueryType = z.infer<
  typeof SocialChannelConnectionsQuerySchema
>;
