import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AiService } from '@/integrations/ai/services/ai.service';
import { AiImageService } from '@/integrations/ai/services/ai-image.service';
import { DocumentsService } from '@/modules/documents/documents.service';
import { RssFeedsService } from '@/modules/rss-feeds/rss-feeds.service';
import { ProjectsService } from '@/modules/projects/projects.service';
import { parseAiJson } from '@/shared/utils/ai/parse-ai-json.util';
import { paginate, paginationMeta } from '@/shared/schemas/pagination.schema';
import {
  Automation,
  AutomationOutputStage,
  DocumentType,
  PostStatus,
  PostType,
  Project,
  RssFeedItem,
  StyleProfile,
} from 'generated/prisma';
import { CreateGenerationRunDto } from './dto/create-generation-run.dto';
import { CreateRssGenerationRunDto } from './dto/create-rss-generation-run.dto';
import { GenerationRunsQueryType } from './dto/generation-runs-query.schema';
import { Draft, DraftSchema, DraftsSchema } from './interfaces/draft.interface';
import { DEFAULT_GENERATION_LANGUAGE, GENERATION_LANGUAGES } from './constants/languages.constant';

@Injectable()
export class GenerationRunsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly aiImageService: AiImageService,
    private readonly documentsService: DocumentsService,
    private readonly rssFeedsService: RssFeedsService,
    private readonly projectsService: ProjectsService,
  ) {}

  private buildPrompt(
    project: Pick<Project, 'title' | 'description' | 'platform' | 'pillars' | 'ideas' | 'instructions'>,
    styleProfile: StyleProfile | null,
    postsRequested: number,
    language: string,
  ) {
    const shape =
      project.platform === PostType.BLOG
        ? '{ "title": string, "excerpt": string, "body": string }'
        : '{ "hook": string, "body": string }';
    const languageName = GENERATION_LANGUAGES[language] ?? GENERATION_LANGUAGES[DEFAULT_GENERATION_LANGUAGE];

    return `Generate ${postsRequested} distinct ${project.platform} post drafts for the following project. Return ONLY a raw JSON array (no markdown) of ${postsRequested} objects, each shaped exactly like ${shape}. Write every field in ${languageName}.

Project title: ${project.title}
Project description: ${project.description ?? 'n/a'}
Content pillars: ${project.pillars.join(', ') || 'n/a'}
Ideas to draw from: ${project.ideas.join('; ') || 'n/a'}
Instructions the AI must follow: ${project.instructions.join('; ') || 'n/a'}
${
  styleProfile
    ? `Voice to emulate: ${styleProfile.tone_description ?? 'n/a'}. Dominant hook style: ${styleProfile.dominant_hook ?? 'n/a'}. Signature vocabulary: ${styleProfile.vocabulary.join(', ') || 'n/a'}.`
    : 'No specific voice profile provided — use a clear, engaging, professional tone.'
}`;
  }

  private buildRssPrompt(
    item: Pick<RssFeedItem, 'title' | 'link' | 'summary' | 'content'>,
    styleProfile: StyleProfile | null,
    language: string,
  ) {
    const languageName = GENERATION_LANGUAGES[language] ?? GENERATION_LANGUAGES[DEFAULT_GENERATION_LANGUAGE];
    const sourceText = item.content || item.summary || 'n/a';

    return `Write a full, original BLOG post inspired by the following source article. Do not copy it verbatim — rewrite and expand on it in your own words. Return ONLY a raw JSON object (no markdown) shaped exactly like { "title": string, "excerpt": string, "body": string, "seo_title": string, "seo_description": string }. Write every field in ${languageName}.

Source title: ${item.title}
Source URL: ${item.link ?? 'n/a'}
Source content: ${sourceText}
${
  styleProfile
    ? `Voice to emulate: ${styleProfile.tone_description ?? 'n/a'}. Dominant hook style: ${styleProfile.dominant_hook ?? 'n/a'}. Signature vocabulary: ${styleProfile.vocabulary.join(', ') || 'n/a'}.`
    : 'No specific voice profile provided — use a clear, engaging, professional tone.'
}`;
  }

  private async generateDrafts(
    project: Pick<Project, 'title' | 'description' | 'platform' | 'pillars' | 'ideas' | 'instructions'>,
    styleProfile: StyleProfile | null,
    postsRequested: number,
    language: string,
  ): Promise<Draft[]> {
    const prompt = this.buildPrompt(project, styleProfile, postsRequested, language);

    const { response } = await this.aiService.generateText({
      prompt,
      system: 'You are an expert social media and content ghostwriter.',
      temperature: 0.8,
    });

    return parseAiJson(response, DraftsSchema);
  }

  private async generateRssDraft(
    item: Pick<RssFeedItem, 'title' | 'link' | 'summary' | 'content'>,
    styleProfile: StyleProfile | null,
    language: string,
  ): Promise<Draft> {
    const prompt = this.buildRssPrompt(item, styleProfile, language);

    const { response } = await this.aiService.generateText({
      prompt,
      system: 'You are an expert content ghostwriter turning source articles into original blog posts.',
      temperature: 0.7,
    });

    return parseAiJson(response, DraftSchema);
  }

  private buildImagePrompt(draft: Draft, project: Pick<Project, 'title'>): string {
    const subject = draft.title ?? draft.hook ?? draft.body.slice(0, 160);
    return `A professional, high-quality cover image representing a post titled "${subject}" for "${project.title}". No text overlay, no watermarks, no logos.`;
  }

  // Generates cover-image candidates for every draft that needs them and
  // persists them as Documents ahead of time — external I/O (AI image calls,
  // GCS uploads) must not happen inside the persistRun $transaction.
  // Returns, per draft, the list of created Document ids (empty if none).
  private async generateImagesForDrafts(
    drafts: Draft[],
    project: Pick<Project, 'title' | 'organisation_id'>,
    generateImages: boolean | undefined,
    imageCount: number | undefined,
  ): Promise<string[][]> {
    if (!generateImages) return [];
    const count = imageCount ?? 1;

    return Promise.all(
      drafts.map(async (draft) => {
        const prompt = this.buildImagePrompt(draft, project);
        const images = await this.aiImageService.generateImages({ prompt, count });

        const documents = await Promise.all(
          images.map((image, index) =>
            this.documentsService.createFromGenerated({
              organisationId: project.organisation_id,
              base64Data: image.base64,
              filename: `cover-${randomUUID()}-${index + 1}.png`,
              mimetype: image.mimeType,
              type: DocumentType.IMAGE,
            }),
          ),
        );

        return documents.map((document) => document.id);
      }),
    );
  }

  async create(userId: string, dto: CreateGenerationRunDto) {
    const project = await this.projectsService.findOwned(userId, dto.project_id);

    const styleProfileId =
      dto.style_profile_id ?? project.style_profiles[0]?.style_profile_id ?? null;

    const styleProfile = styleProfileId
      ? await this.prisma.styleProfile.findUnique({ where: { id: styleProfileId } })
      : null;
    if (styleProfileId && !styleProfile) throw new NotFoundException('Style profile not found');

    const postsRequested = dto.posts_requested ?? 3;
    const language = dto.language ?? DEFAULT_GENERATION_LANGUAGE;
    const drafts = await this.generateDrafts(project, styleProfile, postsRequested, language);

    const draftDocumentIds = await this.generateImagesForDrafts(
      drafts,
      project,
      dto.generate_images,
      dto.image_count,
    );

    return this.persistRun({
      project,
      styleProfileId,
      automationId: null,
      label: dto.label,
      postsRequested,
      language,
      authorUserId: userId,
      drafts,
      draftDocumentIds,
    });
  }

  // Generates one blog post per selected RssFeedItem, using the item's own
  // title/summary/content as source material instead of project ideas.
  async createFromRssItems(userId: string, dto: CreateRssGenerationRunDto) {
    const project = await this.projectsService.findOwned(userId, dto.project_id);

    const styleProfileId =
      dto.style_profile_id ?? project.style_profiles[0]?.style_profile_id ?? null;
    const styleProfile = styleProfileId
      ? await this.prisma.styleProfile.findUnique({ where: { id: styleProfileId } })
      : null;
    if (styleProfileId && !styleProfile) throw new NotFoundException('Style profile not found');

    const attachedFeedIds = new Set(project.rss_feeds.map((link) => link.rss_feed_id));

    const items = await this.prisma.rssFeedItem.findMany({
      where: { id: { in: dto.rss_feed_item_ids } },
    });
    if (items.length !== dto.rss_feed_item_ids.length) {
      throw new NotFoundException('One or more RSS feed items were not found');
    }
    for (const item of items) {
      if (!attachedFeedIds.has(item.rss_feed_id)) {
        throw new BadRequestException(
          'RSS feed item does not belong to a feed attached to this project',
        );
      }
      if (item.is_used) {
        throw new ConflictException(`RSS feed item "${item.title}" has already been used`);
      }
    }

    const language = dto.language ?? DEFAULT_GENERATION_LANGUAGE;
    const drafts = await Promise.all(
      items.map((item) => this.generateRssDraft(item, styleProfile, language)),
    );

    const draftDocumentIds = await this.generateImagesForDrafts(
      drafts,
      project,
      dto.generate_images,
      dto.image_count,
    );

    return this.persistRun({
      project,
      styleProfileId,
      automationId: null,
      label: dto.label,
      postsRequested: items.length,
      language,
      authorUserId: userId,
      drafts,
      draftDocumentIds,
      rssFeedItemIds: items.map((item) => item.id),
    });
  }

  // Entry point used by the Automations cron — no interactive user is
  // available, so the author defaults to the organisation's creator.
  async runForAutomation(automation: Automation & { project: Project }) {
    if (automation.rss_feed_id) {
      return this.runRssAutomation(automation);
    }

    const project = automation.project;

    const styleProfileId = automation.style_profile_id ?? null;
    const styleProfile = styleProfileId
      ? await this.prisma.styleProfile.findUnique({ where: { id: styleProfileId } })
      : null;

    const postsRequested = automation.posts_per_run;
    const language = DEFAULT_GENERATION_LANGUAGE;
    const drafts = await this.generateDrafts(project, styleProfile, postsRequested, language);

    const draftDocumentIds = await this.generateImagesForDrafts(
      drafts,
      project,
      automation.generate_images,
      automation.image_count,
    );

    const { created_by_user_id: authorUserId } = await this.prisma.organisation.findUniqueOrThrow({
      where: { id: project.organisation_id },
    });

    return this.persistRun({
      project,
      styleProfileId,
      automationId: automation.id,
      label: `Automation: ${automation.name}`,
      postsRequested,
      language,
      authorUserId,
      drafts,
      draftDocumentIds,
      status:
        automation.output_stage === AutomationOutputStage.PUBLISH
          ? PostStatus.READY
          : automation.output_stage === AutomationOutputStage.REVIEW
            ? PostStatus.REVIEW
            : PostStatus.DRAFT,
    });
  }

  // Pulls up to `posts_per_run` unused items from the automation's attached
  // feed and generates one blog post per item. Returns undefined (no run
  // created) when there's nothing new since the last tick — a normal
  // outcome, not an error.
  private async runRssAutomation(automation: Automation & { project: Project }) {
    const project = automation.project;

    const feed = await this.prisma.rssFeed.findUnique({ where: { id: automation.rss_feed_id! } });
    if (!feed) return undefined;

    const items = await this.rssFeedsService.refreshAndListItems(feed.id, feed.url, {
      limit: automation.posts_per_run,
      unused_only: true,
    });
    if (!items.length) return undefined;

    const styleProfileId = automation.style_profile_id ?? null;
    const styleProfile = styleProfileId
      ? await this.prisma.styleProfile.findUnique({ where: { id: styleProfileId } })
      : null;

    const language = DEFAULT_GENERATION_LANGUAGE;
    const drafts = await Promise.all(
      items.map((item) => this.generateRssDraft(item, styleProfile, language)),
    );

    const draftDocumentIds = await this.generateImagesForDrafts(
      drafts,
      project,
      automation.generate_images,
      automation.image_count,
    );

    const { created_by_user_id: authorUserId } = await this.prisma.organisation.findUniqueOrThrow({
      where: { id: project.organisation_id },
    });

    return this.persistRun({
      project,
      styleProfileId,
      automationId: automation.id,
      label: `Automation: ${automation.name}`,
      postsRequested: items.length,
      language,
      authorUserId,
      drafts,
      draftDocumentIds,
      rssFeedItemIds: items.map((item) => item.id),
      status:
        automation.output_stage === AutomationOutputStage.PUBLISH
          ? PostStatus.READY
          : automation.output_stage === AutomationOutputStage.REVIEW
            ? PostStatus.REVIEW
            : PostStatus.DRAFT,
    });
  }

  private async persistRun(params: {
    project: Project;
    styleProfileId: string | null;
    automationId: string | null;
    label?: string | null;
    postsRequested: number;
    language: string;
    authorUserId: string;
    drafts: Draft[];
    status?: PostStatus;
    draftDocumentIds?: string[][];
    rssFeedItemIds?: string[];
  }) {
    const {
      project,
      styleProfileId,
      automationId,
      label,
      postsRequested,
      language,
      authorUserId,
      drafts,
      status,
      draftDocumentIds,
      rssFeedItemIds,
    } = params;

    return this.prisma.$transaction(async (tx) => {
      const run = await tx.generationRun.create({
        data: {
          project_id: project.id,
          style_profile_id: styleProfileId,
          automation_id: automationId,
          label,
          posts_requested: postsRequested,
          language,
        },
      });

      const posts = await Promise.all(
        drafts.map(async (draft, index) => {
          const post = await tx.post.create({
            data: {
              user_id: authorUserId,
              organisation_id: project.organisation_id,
              project_id: project.id,
              style_profile_id: styleProfileId,
              generation_run_id: run.id,
              rss_feed_item_id: rssFeedItemIds?.[index] ?? null,
              type: project.platform,
              status: status ?? PostStatus.DRAFT,
              hook: draft.hook,
              body: draft.body,
              title: draft.title,
              excerpt: draft.excerpt,
              seo_title: draft.seo_title,
              seo_description: draft.seo_description,
            },
          });

          const documentIds = draftDocumentIds?.[index] ?? [];
          if (documentIds.length) {
            await tx.postAttachment.createMany({
              data: documentIds.map((documentId, order) => ({
                post_id: post.id,
                document_id: documentId,
                order,
              })),
            });
          }

          return post;
        }),
      );

      if (rssFeedItemIds?.length) {
        await tx.rssFeedItem.updateMany({
          where: { id: { in: rssFeedItemIds } },
          data: { is_used: true },
        });
      }

      return { ...run, posts };
    });
  }

  async findAll(userId: string, query: GenerationRunsQueryType) {
    if (!query.project_id) {
      throw new BadRequestException('project_id query parameter is required');
    }

    await this.projectsService.findOwned(userId, query.project_id);

    const where = { project_id: query.project_id };
    const { skip, take } = paginate(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.generationRun.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.generationRun.count({ where }),
    ]);

    return { data, pagination: paginationMeta(total, query.page, query.limit) };
  }

  async findOne(userId: string, id: string) {
    const run = await this.prisma.generationRun.findUnique({
      where: { id },
      include: {
        posts: { include: { attachments: { include: { document: true } } } },
      },
    });
    if (!run) throw new NotFoundException('Generation run not found');

    await this.projectsService.findOwned(userId, run.project_id);

    return run;
  }
}
