import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { z } from 'zod';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { OwnershipService } from '@/shared/services/ownership/ownership.service';
import {
  AiContentAssistService,
  FULL_CONTENT_RULE,
  SAME_LANGUAGE_RULE,
} from '@/shared/services/ai-content-assist/ai-content-assist.service';
import { AiService } from '@/integrations/ai/services/ai.service';
import {
  AiImageService,
  GeneratedImage,
} from '@/integrations/ai/services/ai-image.service';
import { parseAiJson } from '@/shared/utils/ai/parse-ai-json.util';
import { AiUsageFeature } from 'generated/prisma';
import { ReviseToolContentDto } from './dto/revise-tool-content.dto';
import { RepurposeToolContentDto } from './dto/repurpose-tool-content.dto';
import { GenerateTitleVariationsDto } from './dto/generate-title-variations.dto';
import { GenerateMetaTagsDto } from './dto/generate-meta-tags.dto';
import { FormatToolContentDto } from './dto/format-tool-content.dto';
import { GenerateToolImagesDto } from './dto/generate-tool-images.dto';

const TitleVariationsSchema = z.object({
  titles: z.array(z.string()).min(1),
});

const FormattedContentSchema = z.object({
  body: z.string(),
});

const MetaTagsSchema = z.object({
  seo_title: z.string(),
  seo_description: z.string(),
});

// Every method here is stateless: it authorizes the user against the
// organisation they claim, then turns whatever content they typed into the
// Tools page into an AI result — nothing is read from or written to a
// database row. The caller applies the result in the browser and discards
// it, or types more and calls another tool.
@Injectable()
export class ToolsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownershipService: OwnershipService,
    private readonly aiContentAssistService: AiContentAssistService,
    private readonly aiService: AiService,
    private readonly aiImageService: AiImageService,
  ) {}

  async revise(userId: string, dto: ReviseToolContentDto) {
    if (!dto.preset && !dto.instructions) {
      throw new BadRequestException(
        'Provide a preset or instructions to revise this content',
      );
    }

    await this.ownershipService.resolveContext(userId, dto.organisation_id);

    const styleGuidance = await this.styleGuidance(
      dto.organisation_id,
      dto.style_profile_id,
    );

    return this.aiContentAssistService.reviseContent({
      type: dto.type,
      title: dto.title,
      hook: dto.hook,
      body: dto.body,
      excerpt: dto.excerpt,
      preset: dto.preset,
      instructions: dto.instructions,
      styleGuidance: styleGuidance || undefined,
      usageContext: {
        organisation_id: dto.organisation_id,
        user_id: userId,
        feature: AiUsageFeature.TOOLS_REVISE,
      },
    });
  }

  async repurpose(userId: string, dto: RepurposeToolContentDto) {
    await this.ownershipService.resolveContext(userId, dto.organisation_id);

    const styleGuidance = await this.styleGuidance(
      dto.organisation_id,
      dto.style_profile_id,
    );

    const drafts = await Promise.all(
      dto.target_types.map(async (targetType) => ({
        type: targetType,
        draft: await this.aiContentAssistService.repurposeContent({
          sourceType: dto.type,
          targetType,
          title: dto.title,
          hook: dto.hook,
          body: dto.body,
          excerpt: dto.excerpt,
          styleGuidance: styleGuidance || undefined,
          usageContext: {
            organisation_id: dto.organisation_id,
            user_id: userId,
            feature: AiUsageFeature.TOOLS_REPURPOSE,
          },
        }),
      })),
    );

    return drafts;
  }

  private async styleGuidance(
    organisationId: string,
    styleProfileId?: string,
  ): Promise<string> {
    if (!styleProfileId) return '';

    const profile = await this.prisma.styleProfile.findUnique({
      where: { id: styleProfileId },
    });
    if (!profile) throw new NotFoundException('Style profile not found');
    if (profile.organisation_id !== organisationId) {
      throw new BadRequestException(
        'Style profile must belong to the same organisation',
      );
    }

    return [
      profile.tone_description ? `Tone: ${profile.tone_description}.` : null,
      profile.dominant_hook
        ? `Favor hooks like: ${profile.dominant_hook}.`
        : null,
      profile.vocabulary.length
        ? `Signature vocabulary: ${profile.vocabulary.join(', ')}.`
        : null,
    ]
      .filter(Boolean)
      .join(' ');
  }

  async generateTitleVariations(
    userId: string,
    dto: GenerateTitleVariationsDto,
  ) {
    await this.ownershipService.resolveContext(userId, dto.organisation_id);

    const count = dto.count ?? 5;
    const styleGuidance = await this.styleGuidance(
      dto.organisation_id,
      dto.style_profile_id,
    );
    const content = [dto.title, dto.hook, dto.body]
      .filter(Boolean)
      .join('\n\n');

    const prompt = `Write ${count} alternative titles for the following ${dto.type} content. ${styleGuidance} ${dto.instructions ? `Additional instructions: ${dto.instructions}` : ''}

Return ONLY a raw JSON object (no markdown) shaped exactly like { "titles": string[] } with exactly ${count} distinct options. ${SAME_LANGUAGE_RULE}

Content:
${content}`;

    const { response } = await this.aiService.generateText({
      prompt,
      system:
        `You are an expert copywriter who writes punchy, varied title options. ${SAME_LANGUAGE_RULE}`,
      temperature: 0.8,
      usage: {
        organisation_id: dto.organisation_id,
        user_id: userId,
        feature: AiUsageFeature.TOOLS_TITLE_VARIATIONS,
      },
    });

    return parseAiJson(response, TitleVariationsSchema).titles;
  }

  async generateMetaTags(userId: string, dto: GenerateMetaTagsDto) {
    await this.ownershipService.resolveContext(userId, dto.organisation_id);

    const content = [dto.title, dto.hook, dto.body, dto.excerpt]
      .filter(Boolean)
      .join('\n\n');

    const prompt = `Write SEO meta tags for the following ${dto.type} content. Return ONLY a raw JSON object (no markdown) shaped exactly like { "seo_title": string, "seo_description": string } — seo_title under 60 characters, seo_description under 160 characters. ${SAME_LANGUAGE_RULE}

Content:
${content}`;

    const { response } = await this.aiService.generateText({
      prompt,
      system: `You are an expert SEO copywriter. ${SAME_LANGUAGE_RULE}`,
      temperature: 0.5,
      usage: {
        organisation_id: dto.organisation_id,
        user_id: userId,
        feature: AiUsageFeature.TOOLS_META_TAGS,
      },
    });

    return parseAiJson(response, MetaTagsSchema);
  }

  // Restructures text only: adds headings, paragraphs, lists, emphasis. The
  // wording must stay exactly as written, so this never rewrites the content.
  async formatContent(userId: string, dto: FormatToolContentDto) {
    await this.ownershipService.resolveContext(userId, dto.organisation_id);

    const isLongForm = dto.type === 'BLOG' || dto.type === 'EMAIL';
    const source = [dto.hook, dto.body].filter(Boolean).join('\n\n');
    if (!source.trim()) {
      throw new BadRequestException('Add some content to format first');
    }

    const outputRules = isLongForm
      ? '"body" must be simple HTML using only <p>, <h2>, <h3>, <ul>, <ol>, <li>, <blockquote>, <strong>, <em>, <a> tags — no other markup. Use <h2>/<h3> for section headings (the title is handled separately, do not add an <h1>), <p> for paragraphs, <ul>/<ol> for lists of items or steps, <strong> for key terms, and <blockquote> for quotations.'
      : '"body" must be plain text (no HTML, no markdown symbols like # or **). Separate paragraphs with a blank line, put each list item on its own line starting with "- " (or "1. " for ordered steps), and keep short-form punchy line breaks where they help readability.';

    const prompt = `Format the following ${dto.type} document so it is well structured and easy to read: split walls of text into logical paragraphs, add headings for distinct sections where the length justifies it, turn enumerations and steps into lists, and emphasise key terms sparingly. ${dto.instructions ? `Additional instructions: ${dto.instructions}` : ''}

Rules: this is FORMATTING ONLY. Keep every word, sentence, fact and link exactly as written. Do not rewrite, rephrase, translate, summarise, add or remove content (only minimal heading text may be added, in the same language as the document). ${FULL_CONTENT_RULE} ${SAME_LANGUAGE_RULE}

Return ONLY a raw JSON object (no markdown fences) shaped exactly like { "body": string }. ${outputRules}

Document:
${source}`;

    const { response } = await this.aiService.generateText({
      prompt,
      system: `You are a meticulous document formatter. You change structure and layout only, never the wording. ${SAME_LANGUAGE_RULE}`,
      temperature: 0.2,
      usage: {
        organisation_id: dto.organisation_id,
        user_id: userId,
        // Formatting is a kind of revision; reusing this feature avoids a DB enum migration.
        feature: AiUsageFeature.TOOLS_REVISE,
      },
    });

    return parseAiJson(response, FormattedContentSchema);
  }

  async generateImages(
    userId: string,
    dto: GenerateToolImagesDto,
  ): Promise<GeneratedImage[]> {
    await this.ownershipService.resolveContext(userId, dto.organisation_id);

    const label = dto.title || dto.body?.slice(0, 80) || 'social media post';
    const prompt =
      dto.prompt ??
      `A cover image for a post titled "${label}". ${dto.body?.slice(0, 500) ?? ''}`;

    return this.aiImageService.generateImages({
      prompt,
      count: dto.count,
      size: dto.size,
      usage: {
        organisation_id: dto.organisation_id,
        user_id: userId,
        feature: AiUsageFeature.TOOLS_IMAGE,
      },
    });
  }
}
