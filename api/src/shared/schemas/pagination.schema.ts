import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 20)),
});

export type PaginationType = z.infer<typeof PaginationSchema>;

export function paginate(page: number, limit: number) {
  return { skip: (page - 1) * limit, take: limit };
}

export function paginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
    has_next: page < Math.ceil(total / limit),
    has_prev: page > 1,
  };
}
