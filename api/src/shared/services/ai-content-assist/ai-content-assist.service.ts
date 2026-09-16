import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { AiService } from '@/integrations/ai/services/ai.service';
import { parseAiJson } from '@/shared/utils/ai/parse-ai-json.util';
import { RevisePreset } from '@/shared/dto/revise-content.dto';

export const ReviseDraftSchema = z.object({
  hook: z.string().optional(),
  body: z.string(),
  title: z.string().optional(),
  excerpt: z.string().optional(),
});
export type ReviseDraft = z.infer<typeof ReviseDraftSchema>;

export const RepurposeDraftSchema = z.object({
  hook: z.string().optional(),
  body: z.string(),
  title: z.string().optional(),
  excerpt: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});
export type RepurposeDraft = z.infer<typeof RepurposeDraftSchema>;

const REVISE_PRESET_INSTRUCTIONS: Record<RevisePreset, string> = {
  [RevisePreset.FRIENDLIER]:
    'Rewrite it in a warmer, more approachable and friendly tone.',
  [RevisePreset.MORE_FORMAL]: 'Rewrite it in a more formal, professional tone.',
  [RevisePreset.LESS_FORMAL]:
    'Rewrite it in a more casual, conversational tone.',
  [RevisePreset.SHORTER]:
    'Make it significantly shorter and more concise while keeping the key message.',
  [RevisePreset.LONGER]:
    'Expand it with more detail, examples or context while keeping the same core message.',
  [RevisePreset.SIMPLIFY]:
    'Simplify the language — shorter sentences, plainer words, easier to read.',
  [RevisePreset.PUNCHIER]:
    'Make the opening/hook more attention-grabbing and punchy, and tighten the rest.',
  [RevisePreset.FIX_GRAMMAR]:
    'Fix any grammar, spelling and clarity issues without changing the meaning or tone.',
  [RevisePreset.HUMANIZE]:
    'Rewrite it to remove common AI writing tells. Replace AI-tell vocabulary with plain words: ' +
    'delve, leverage, robust, seamless, testament to, underscores, meticulous, game-changer, ' +
    'cutting-edge, comprehensive, pivotal, and metaphors like landscape/realm/tapestry. Do not ' +
    'stack words like harness, elevate, unleash, streamline, empower, crucial or myriad together ' +
    'in one paragraph. Cut hedging and hollow intensifiers ("it\'s important to note", "to be ' +
    'honest", "genuinely", "truly", "worth checking out") and the "it\'s not X — it\'s Y" reveal ' +
    'pattern. Keep em dashes to at most one per 1,000 words. Vary sentence and paragraph length ' +
    'instead of a uniform rhythm, avoid compulsive rule-of-three lists, and prefer concrete ' +
    'specifics (numbers, names, examples) over vague superlatives. Use contractions and a ' +
    'distinct, direct voice. Keep the meaning, facts and key points unchanged.',
};

// `type`/`sourceType`/`targetType` are plain strings rather than the Prisma
// `PostType` enum, deliberately: the stateless `tools` module has its own
// content-type set (which includes 'EMAIL', a Tools-only concept that must
// never leak into Post/Project/StyleProfile's shared PostType), and a
// nominal Prisma enum can't be widened to accept it. Posts still pass real
// PostType values here — those are just strings from this service's view.
export interface ReviseContentParams {
  type: string;
  title?: string | null;
  hook?: string | null;
  body?: string | null;
  excerpt?: string | null;
  preset?: RevisePreset;
  instructions?: string;
}

export interface RepurposeContentParams {
  sourceType: string;
  targetType: string;
  title?: string | null;
  hook?: string | null;
  body?: string | null;
  excerpt?: string | null;
}

// Revise/repurpose prompt-building and AI calls shared by anything that
// edits post-shaped content (currently the persisted `posts` module and the
// stateless `tools` module) — this service only turns content +
// instructions into a draft; the caller decides what to do with it.
@Injectable()
export class AiContentAssistService {
  constructor(private readonly aiService: AiService) {}

  async reviseContent(params: ReviseContentParams): Promise<ReviseDraft> {
    const directions = [
      params.preset ? REVISE_PRESET_INSTRUCTIONS[params.preset] : null,
      params.instructions
        ? `Additional instructions: ${params.instructions}`
        : null,
    ]
      .filter(Boolean)
      .join(' ');

    const isLongForm = params.type === 'BLOG' || params.type === 'EMAIL';
    const shape = isLongForm
      ? '{ "title": string, "excerpt": string, "body": string }'
      : '{ "hook": string, "body": string }';

    const prompt = `Revise the following ${params.type} post. ${directions}

Return ONLY a raw JSON object (no markdown) shaped exactly like ${shape}. Preserve the author's core message and intent.

${isLongForm ? `Current title: ${params.title ?? 'n/a'}\nCurrent excerpt: ${params.excerpt ?? 'n/a'}\n` : params.hook ? `Current hook: ${params.hook}\n` : ''}Current body:
${params.body ?? ''}`;

    const { response } = await this.aiService.generateText({
      prompt,
      system:
        'You are an expert editor who revises social media and blog content on request.',
      temperature: 0.6,
    });

    return parseAiJson(response, ReviseDraftSchema);
  }

  async repurposeContent(
    params: RepurposeContentParams,
  ): Promise<RepurposeDraft> {
    const source = [params.title, params.hook, params.body]
      .filter(Boolean)
      .join('\n\n');

    const isTargetLongForm =
      params.targetType === 'BLOG' || params.targetType === 'EMAIL';
    const isTargetBlog = params.targetType === 'BLOG';
    const shape = isTargetBlog
      ? '{ "title": string, "excerpt": string, "body": string, "seo_title": string, "seo_description": string }'
      : isTargetLongForm
        ? '{ "title": string, "excerpt": string, "body": string }'
        : '{ "hook": string, "body": string }';
    const seoGuidance = isTargetBlog
      ? ' Also write "seo_title" (a search-optimized title, ideally under 60 characters) and "seo_description" (a compelling meta description, ideally under 160 characters).'
      : '';

    const { response } = await this.aiService.generateText({
      prompt: `Repurpose the following content into a single ${params.targetType} post. Return ONLY a raw JSON object (no markdown) shaped exactly like ${shape}.${seoGuidance}\n\nSource content:\n${source}`,
      system: 'You are an expert content repurposing assistant.',
      temperature: 0.7,
    });

    return parseAiJson(response, RepurposeDraftSchema);
  }
}
