import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { AiService } from '@/integrations/ai/services/ai.service';
import { AiUsageContext } from '@/integrations/ai/interfaces/ai.interface';
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

// Also used to steer initial generation (manual and automated) toward the
// same "sounds human" voice when a project has humanize_by_default enabled —
// see GenerationRunsService.
export const HUMANIZE_INSTRUCTIONS =
  'Rewrite it to remove common AI writing tells. Replace AI-tell vocabulary with plain words: ' +
  'delve, leverage, robust, seamless, testament to, underscores, meticulous, game-changer, ' +
  'cutting-edge, comprehensive, pivotal, and metaphors like landscape/realm/tapestry. Do not ' +
  'stack words like harness, elevate, unleash, streamline, empower, crucial or myriad together ' +
  'in one paragraph. Cut hedging and hollow intensifiers ("it\'s important to note", "to be ' +
  'honest", "genuinely", "truly", "worth checking out") and the "it\'s not X — it\'s Y" reveal ' +
  'pattern. Keep em dashes to at most one per 1,000 words. Vary sentence and paragraph length ' +
  'instead of a uniform rhythm, avoid compulsive rule-of-three lists, and prefer concrete ' +
  'specifics (numbers, names, examples) over vague superlatives. Use contractions and a ' +
  'distinct, direct voice. Keep the meaning, facts and key points unchanged. This is a rewrite, ' +
  'NOT a summary: keep every paragraph, argument, example, citation, name, number and ' +
  'heading, and keep the output about as long as the input (within roughly 10%). Apply all of this ' +
  'to every field and to the entire body from the first sentence to the last, not just the ' +
  'opening. Keep the same language as the rest of the content: do not translate, and adapt ' +
  'these English examples of AI-tell words to their natural equivalents in that language.';

// Appended to every prompt/system message in the AI tools so output stays in
// the language of the user's text (models otherwise drift to English because
// the instructions themselves are written in English).
export const SAME_LANGUAGE_RULE =
  'IMPORTANT: Detect the language of the provided content and write your entire ' +
  'output (every field, including titles, excerpts and SEO text) in that exact same ' +
  'language. Never translate it or switch to English, even though these instructions ' +
  'are in English. If the content mixes languages, keep each part in its original language.';

// Stops the model from only rewriting the opening or summarising the rest.
export const FULL_CONTENT_RULE =
  'Process the ENTIRE content from the first word to the last: every paragraph, list item ' +
  'and section must be present in the output. Do not skip, truncate, summarise or merge ' +
  'sections unless the instructions explicitly ask you to shorten it.';

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
  [RevisePreset.HUMANIZE]: HUMANIZE_INSTRUCTIONS,
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
  styleGuidance?: string;
  usageContext: AiUsageContext;
}

export interface RepurposeContentParams {
  sourceType: string;
  targetType: string;
  title?: string | null;
  hook?: string | null;
  body?: string | null;
  excerpt?: string | null;
  styleGuidance?: string;
  usageContext: AiUsageContext;
}

// Presets that must keep the text's length and coverage. Long inputs are
// revised chunk by chunk (in parallel) for these: a single call over a long
// document tends to condense it into a summary instead of rewriting all of it.
const LENGTH_PRESERVING_PRESETS = new Set<RevisePreset>([
  RevisePreset.HUMANIZE,
  RevisePreset.FIX_GRAMMAR,
  RevisePreset.FRIENDLIER,
  RevisePreset.MORE_FORMAL,
  RevisePreset.LESS_FORMAL,
  RevisePreset.SIMPLIFY,
]);
const CHUNK_THRESHOLD_CHARS = 3000;
const CHUNK_TARGET_CHARS = 2500;

// Splits on paragraph boundaries (HTML block ends, or line breaks for plain
// text) and packs them into chunks of roughly CHUNK_TARGET_CHARS.
function splitIntoChunks(body: string, isHtml: boolean): string[] {
  const units = isHtml
    ? body.split(/(?<=<\/(?:p|h2|h3|ul|ol|blockquote)>)/i)
    : body.split(/(?<=\n)/);
  const chunks: string[] = [];
  let current = '';
  for (const unit of units) {
    if (current && current.length + unit.length > CHUNK_TARGET_CHARS) {
      chunks.push(current);
      current = '';
    }
    current += unit;
  }
  if (current.trim()) chunks.push(current);
  return chunks;
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
      params.styleGuidance ? `Voice to write in: ${params.styleGuidance}` : null,
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
    const bodyFormatGuidance = isLongForm
      ? ' "body" must be simple HTML using only <p>, <h2>, <h3>, <ul>, <ol>, <li>, <blockquote>, <strong>, <em>, <a> tags — no other markup.'
      : '';

    const body = params.body ?? '';
    if (
      params.preset &&
      LENGTH_PRESERVING_PRESETS.has(params.preset) &&
      body.length > CHUNK_THRESHOLD_CHARS
    ) {
      const chunks = splitIntoChunks(body, isLongForm);
      if (chunks.length > 1) {
        return this.reviseInChunks(params, chunks, directions, isLongForm);
      }
    }

    const prompt = `Revise the following ${params.type} post. ${directions}

Return ONLY a raw JSON object (no markdown) shaped exactly like ${shape}.${bodyFormatGuidance} Preserve the author's core message and intent.

${isLongForm ? `Current title: ${params.title ?? 'n/a'}\nCurrent excerpt: ${params.excerpt ?? 'n/a'}\n` : params.hook ? `Current hook: ${params.hook}\n` : ''}Current body:
${params.body ?? ''}`;

    const { response } = await this.aiService.generateText({
      prompt,
      system:
        `You are an expert editor who revises social media and blog content on request. ${SAME_LANGUAGE_RULE}`,
      temperature: 0.6,
      usage: params.usageContext,
    });

    return parseAiJson(response, ReviseDraftSchema);
  }

  private async reviseInChunks(
    params: ReviseContentParams,
    chunks: string[],
    directions: string,
    isLongForm: boolean,
  ): Promise<ReviseDraft> {
    const system = `You are an expert editor who revises social media and blog content on request. ${SAME_LANGUAGE_RULE}`;
    const htmlGuidance = isLongForm
      ? ' Keep the passage as simple HTML using only <p>, <h2>, <h3>, <ul>, <ol>, <li>, <blockquote>, <strong>, <em>, <a> tags.'
      : ' Keep it plain text with the same line breaks.';

    const revised = await Promise.all(
      chunks.map(async (chunk, index) => {
        const isFirst = index === 0;
        const header = isFirst
          ? isLongForm
            ? `Also revise the title and excerpt. Current title: ${params.title ?? 'n/a'}
Current excerpt: ${params.excerpt ?? 'n/a'}
`
            : params.hook
              ? `Also revise the hook. Current hook: ${params.hook}
`
              : ''
          : '';
        const shape = isFirst
          ? isLongForm
            ? '{ "title": string, "excerpt": string, "body": string }'
            : '{ "hook": string, "body": string }'
          : '{ "body": string }';

        const { response } = await this.aiService.generateText({
          prompt: `Revise the following ${params.type} content. ${directions}

This is part ${index + 1} of ${chunks.length} of one longer document. Revise ONLY this part, completely, from its first word to its last: do not summarise, condense, skip or drop anything (keep every sentence's ideas, examples, citations, names and numbers) and keep it about the same length as the original. Do not add an introduction or conclusion, and do not repeat content from other parts.${htmlGuidance}

Return ONLY a raw JSON object (no markdown) shaped exactly like ${shape}.

${header}Part ${index + 1} body:
${chunk}`,
          system,
          temperature: 0.6,
          usage: params.usageContext,
        });
        return parseAiJson(response, ReviseDraftSchema);
      }),
    );

    const separator = isLongForm ? '' : '\n';
    return {
      ...revised[0],
      body: revised.map((r) => r.body.trim()).join(separator),
    };
  }

  async repurposeContent(
    params: RepurposeContentParams,
  ): Promise<RepurposeDraft> {
    const source = [params.title, params.hook, params.excerpt, params.body]
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
    const bodyFormatGuidance = isTargetLongForm
      ? ' "body" must be simple HTML using only <p>, <h2>, <h3>, <ul>, <ol>, <li>, <blockquote>, <strong>, <em>, <a> tags — no other markup.'
      : '';

    const voiceGuidance = params.styleGuidance
      ? ` Voice to write in: ${params.styleGuidance}`
      : '';

    const { response } = await this.aiService.generateText({
      prompt: `Repurpose the following content into a single ${params.targetType} post. Return ONLY a raw JSON object (no markdown) shaped exactly like ${shape}.${seoGuidance}${bodyFormatGuidance}${voiceGuidance}\n\nSource content:\n${source}`,
      system: `You are an expert content repurposing assistant. ${SAME_LANGUAGE_RULE}`,
      temperature: 0.7,
      usage: params.usageContext,
    });

    return parseAiJson(response, RepurposeDraftSchema);
  }
}
