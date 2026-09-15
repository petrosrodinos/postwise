import { z } from 'zod';
import { PaginationSchema } from '@/shared/schemas/pagination.schema';
import { DocumentType } from 'generated/prisma';

export const DocumentsQuerySchema = PaginationSchema.extend({
  organisation_id: z.string(),
  type: z.nativeEnum(DocumentType).optional(),
});

export type DocumentsQueryType = z.infer<typeof DocumentsQuerySchema>;
