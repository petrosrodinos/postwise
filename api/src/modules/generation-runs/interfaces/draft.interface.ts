import { z } from 'zod';
import { PostType } from 'generated/prisma';

export const DraftSchema = z.object({
  hook: z.string().optional(),
  body: z.string(),
  title: z.string().optional(),
  excerpt: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

export const DraftsSchema = z.array(DraftSchema).min(1);

export type Draft = z.infer<typeof DraftSchema>;

// One channel-specific variant of a generated idea (e.g. the LinkedIn or
// Twitter version of the same underlying idea) — short hook + body.
export const ChannelDraftVariantSchema = z.object({
  hook: z.string().optional(),
  body: z.string(),
});

export type ChannelDraftVariant = z.infer<typeof ChannelDraftVariantSchema>;

// The Blog variant of a generated idea — a fuller article shape with SEO
// fields, same as the standalone blog Draft shape above.
export const BlogChannelDraftVariantSchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  body: z.string(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

export type BlogChannelDraftVariant = z.infer<
  typeof BlogChannelDraftVariantSchema
>;

function variantSchemaFor(channel: PostType) {
  return channel === PostType.BLOG
    ? BlogChannelDraftVariantSchema
    : ChannelDraftVariantSchema;
}

// One generated idea, shaped with one variant per requested channel, e.g.
// { topic, LINKEDIN: {hook,body}, TWITTER: {hook,body}, BLOG: {title,...} }.
// Built dynamically per project.channels since the set of expected keys (and
// each key's shape) varies per project.
export function buildMultiChannelDraftSchema(channels: PostType[]) {
  const shape: Record<string, z.ZodTypeAny> = { topic: z.string().optional() };
  for (const channel of channels) {
    shape[channel] = variantSchemaFor(channel);
  }
  return z.object(shape);
}

export function buildMultiChannelDraftsSchema(channels: PostType[]) {
  return z.array(buildMultiChannelDraftSchema(channels)).min(1);
}

export type MultiChannelDraft = { topic?: string } & Partial<
  Record<PostType, ChannelDraftVariant | BlogChannelDraftVariant>
>;
