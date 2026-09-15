import { z } from 'zod';
import { SocialChannel } from 'generated/prisma';

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
// Twitter version of the same underlying idea).
export const ChannelDraftVariantSchema = z.object({
  hook: z.string().optional(),
  body: z.string(),
});

export type ChannelDraftVariant = z.infer<typeof ChannelDraftVariantSchema>;

// One generated idea, shaped with one variant per requested social channel,
// e.g. { topic, LINKEDIN: {...}, TWITTER: {...} }. Built dynamically per
// project.channels since the set of expected keys varies per project.
export function buildMultiChannelDraftSchema(channels: SocialChannel[]) {
  const shape: Record<string, z.ZodTypeAny> = { topic: z.string().optional() };
  for (const channel of channels) {
    shape[channel] = ChannelDraftVariantSchema;
  }
  return z.object(shape);
}

export function buildMultiChannelDraftsSchema(channels: SocialChannel[]) {
  return z.array(buildMultiChannelDraftSchema(channels)).min(1);
}

export type MultiChannelDraft = { topic?: string } & Partial<
  Record<SocialChannel, ChannelDraftVariant>
>;
