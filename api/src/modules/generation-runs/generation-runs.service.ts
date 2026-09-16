import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AiService } from '@/integrations/ai/services/ai.service';
import { AiImageService } from '@/integrations/ai/services/ai-image.service';
import { DocumentsService } from '@/modules/documents/documents.service';
import { RssFeedsService } from '@/modules/rss-feeds/rss-feeds.service';
import { ProjectsService } from '@/modules/projects/projects.service';
import { ActivityLogsService } from '@/modules/activity-logs/activity-logs.service';
import { parseAiJson } from '@/shared/utils/ai/parse-ai-json.util';
import { paginate, paginationMeta } from '@/shared/schemas/pagination.schema';
import {
  ActivityLogAction,
  ActivityLogEntityType,
  Automation,
  AutomationOutputStage,
  DocumentType,
  PostStatus,
  PostType,
  Project,
  RssFeedItem,
  StyleProfile,
} from 'generated/prisma';
import { AddPostsToGenerationRunDto } from './dto/add-posts-to-generation-run.dto';
import { CreateGenerationRunDto } from './dto/create-generation-run.dto';
import { CreateRssGenerationRunDto } from './dto/create-rss-generation-run.dto';
import { GenerationRunsQueryType } from './dto/generation-runs-query.schema';
import {
  BlogChannelDraftVariant,
  buildMultiChannelDraftsSchema,
  ChannelDraftVariant,
  Draft,
  DraftSchema,
  MultiChannelDraft,
} from './interfaces/draft.interface';
import {
  DEFAULT_GENERATION_LANGUAGE,
  GENERATION_LANGUAGES,
} from './constants/languages.constant';

type OwnedProject = Awaited<ReturnType<ProjectsService['findOwned']>>;

@Injectable()
export class GenerationRunsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly aiImageService: AiImageService,
    private readonly documentsService: DocumentsService,
    private readonly rssFeedsService: RssFeedsService,
    private readonly projectsService: ProjectsService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  private channelShape(channel: PostType): string {
    return channel === PostType.BLOG
      ? '{ "title": string, "excerpt": string, "body": string, "seo_title": string, "seo_description": string }'
      : '{ "hook": string, "body": string }';
  }

  // Asks for `postsRequested` idea objects in a single AI call, each idea
  // written once per target channel, e.g.
  // { "topic": string, "LINKEDIN": { "hook", "body" }, "BLOG": { "title", ... } }.
  // A project's channels can be any mix of LINKEDIN/TWITTER/BLOG — the shape
  // requested per channel differs (BLOG gets the fuller article shape).
  private buildMultiChannelPrompt(
    project: Pick<
      Project,
      | 'title'
      | 'description'
      | 'pillars'
      | 'ideas'
      | 'instructions'
      | 'ai_directions'
    >,
    channels: PostType[],
    styleProfiles: Partial<Record<PostType, StyleProfile | null>>,
    postsRequested: number,
    language: string,
  ) {
    const languageName =
      GENERATION_LANGUAGES[language] ??
      GENERATION_LANGUAGES[DEFAULT_GENERATION_LANGUAGE];
    const channelShapes = channels
      .map((channel) => `"${channel}": ${this.channelShape(channel)}`)
      .join(', ');
    const shape = `{ "topic": string, ${channelShapes} }`;
    const voiceGuidance = channels
      .map((channel) => {
        const profile = styleProfiles[channel];
        return profile
          ? `For ${channel}, emulate this voice: ${profile.tone_description ?? 'n/a'}. Dominant hook style: ${profile.dominant_hook ?? 'n/a'}. Signature vocabulary: ${profile.vocabulary.join(', ') || 'n/a'}.`
          : `For ${channel}, use a clear, engaging, professional tone.`;
      })
      .join('\n');

    return `Generate ${postsRequested} distinct post ideas for the following project. Write each idea once for every one of these channels: ${channels.join(', ')} — keep the same underlying idea across channels but tailor it to each channel's conventions: BLOG should be a fuller, well-structured article with its own SEO title/description; TWITTER should be concise and punchy; LINKEDIN should be more narrative and professional. Return ONLY a raw JSON array (no markdown) of ${postsRequested} objects, each shaped exactly like ${shape}. Write every field in ${languageName}.

Project title: ${project.title}
Project description: ${project.description ?? 'n/a'}
Content pillars: ${project.pillars.join(', ') || 'n/a'}
Ideas to draw from: ${project.ideas.join('; ') || 'n/a'}
Instructions the AI must follow: ${project.instructions.join('; ') || 'n/a'}
Additional directions from the user: ${project.ai_directions ?? 'n/a'}
${voiceGuidance}`;
  }

  private buildRssPrompt(
    item: Pick<RssFeedItem, 'title' | 'link' | 'summary' | 'content'>,
    styleProfile: StyleProfile | null,
    language: string,
  ) {
    const languageName =
      GENERATION_LANGUAGES[language] ??
      GENERATION_LANGUAGES[DEFAULT_GENERATION_LANGUAGE];
    const sourceText = item.content || item.summary || 'n/a';

    return `Write a full, original BLOG post inspired by the following source article. Do not copy it verbatim — rewrite and expand on it in your own words. Return ONLY a raw JSON object (no markdown) shaped exactly like { "title": string, "excerpt": string, "body": string, "seo_title": string, "seo_description": string }. Write every field in ${languageName}. "seo_title" should be a search-optimized title (ideally under 60 characters) and "seo_description" a compelling meta description (ideally under 160 characters).

Source title: ${item.title}
Source URL: ${item.link ?? 'n/a'}
Source content: ${sourceText}
${
  styleProfile
    ? `Voice to emulate: ${styleProfile.tone_description ?? 'n/a'}. Dominant hook style: ${styleProfile.dominant_hook ?? 'n/a'}. Signature vocabulary: ${styleProfile.vocabulary.join(', ') || 'n/a'}.`
    : 'No specific voice profile provided — use a clear, engaging, professional tone.'
}`;
  }

  private async generateMultiChannelDrafts(
    project: Pick<
      Project,
      | 'title'
      | 'description'
      | 'pillars'
      | 'ideas'
      | 'instructions'
      | 'ai_directions'
    >,
    channels: PostType[],
    styleProfiles: Partial<Record<PostType, StyleProfile | null>>,
    postsRequested: number,
    language: string,
  ): Promise<MultiChannelDraft[]> {
    const prompt = this.buildMultiChannelPrompt(
      project,
      channels,
      styleProfiles,
      postsRequested,
      language,
    );

    const { response } = await this.aiService.generateText({
      prompt,
      system:
        'You are an expert content ghostwriter who adapts one idea across multiple platforms, including full-length blog articles.',
      temperature: 0.8,
    });

    return parseAiJson(
      response,
      buildMultiChannelDraftsSchema(channels),
    ) as unknown as MultiChannelDraft[];
  }

  private async generateRssDraft(
    item: Pick<RssFeedItem, 'title' | 'link' | 'summary' | 'content'>,
    styleProfile: StyleProfile | null,
    language: string,
  ): Promise<Draft> {
    const prompt = this.buildRssPrompt(item, styleProfile, language);

    const { response } = await this.aiService.generateText({
      prompt,
      system:
        'You are an expert content ghostwriter turning source articles into original blog posts.',
      temperature: 0.7,
    });

    return parseAiJson(response, DraftSchema);
  }

  // For each channel a project targets (including BLOG), finds the project's
  // attached style profile trained for that channel's platform, if any
  // (auto-match — no manual per-channel selection).
  private resolveChannelStyleProfiles(
    project: OwnedProject,
    channels: PostType[],
  ): Partial<Record<PostType, StyleProfile | null>> {
    const result: Partial<Record<PostType, StyleProfile | null>> = {};
    for (const channel of channels) {
      const link = project.style_profiles.find(
        (link) => link.style_profile.platform === channel,
      );
      result[channel] = link?.style_profile ?? null;
    }
    return result;
  }

  private buildImagePrompt(
    subject: string,
    project: Pick<Project, 'title'>,
  ): string {
    return `A professional, high-quality cover image representing a post titled "${subject}" for "${project.title}". No text overlay, no watermarks, no logos.`;
  }

  // Generates cover-image candidates for every idea that needs them and
  // persists them as Documents ahead of time — external I/O (AI image calls,
  // GCS uploads) must not happen inside the persistRun $transaction.
  // Returns, per idea (by index), the list of created Document ids (empty if
  // none) — shared across every channel-variant Post created for that idea.
  private async generateImagesForIdeas(
    count: number,
    subjectFor: (index: number) => string,
    project: Pick<Project, 'title' | 'organisation_id'>,
    generateImages: boolean | undefined,
    imageCount: number | undefined,
  ): Promise<string[][]> {
    if (!generateImages) return [];
    const imagesPerIdea = imageCount ?? 1;

    return Promise.all(
      Array.from({ length: count }, async (_, index) => {
        const prompt = this.buildImagePrompt(subjectFor(index), project);
        const images = await this.aiImageService.generateImages({
          prompt,
          count: imagesPerIdea,
        });

        const documents = await Promise.all(
          images.map((image, imageIndex) =>
            this.documentsService.createFromGenerated({
              organisationId: project.organisation_id,
              base64Data: image.base64,
              filename: `cover-${randomUUID()}-${imageIndex + 1}.png`,
              mimetype: image.mimeType,
              type: DocumentType.IMAGE,
            }),
          ),
        );

        return documents.map((document) => document.id);
      }),
    );
  }

  private draftSubject(draft: Draft): string {
    return draft.title ?? draft.hook ?? draft.body.slice(0, 160);
  }

  private multiChannelDraftSubject(
    draft: MultiChannelDraft,
    channels: PostType[],
  ): string {
    if (draft.topic) return draft.topic;
    for (const channel of channels) {
      const variant = draft[channel];
      if (!variant) continue;
      if (channel === PostType.BLOG)
        return (variant as BlogChannelDraftVariant).title;
      const social = variant as ChannelDraftVariant;
      return social.hook ?? social.body.slice(0, 160);
    }
    return 'Untitled idea';
  }

  // Every ideas-based generation call (manual or automated) always fans out
  // across the project's channels, whatever mix of LINKEDIN/TWITTER/BLOG that
  // is — there's no longer a separate single-channel BLOG path.
  private async generateForChannels(
    project: OwnedProject,
    postsRequested: number,
    language: string,
    generateImages: boolean | undefined,
    imageCount: number | undefined,
  ) {
    const channels = project.channels;
    const channelStyleProfiles = this.resolveChannelStyleProfiles(
      project,
      channels,
    );
    const drafts = await this.generateMultiChannelDrafts(
      project,
      channels,
      channelStyleProfiles,
      postsRequested,
      language,
    );
    const draftDocumentIds = await this.generateImagesForIdeas(
      drafts.length,
      (index) => this.multiChannelDraftSubject(drafts[index], channels),
      project,
      generateImages,
      imageCount,
    );
    return { channels, channelStyleProfiles, drafts, draftDocumentIds };
  }

  async create(userId: string, dto: CreateGenerationRunDto) {
    const project = await this.projectsService.findOwned(
      userId,
      dto.project_id,
    );
    const postsRequested = dto.posts_requested ?? 3;
    const language = dto.language ?? DEFAULT_GENERATION_LANGUAGE;

    const { channels, channelStyleProfiles, drafts, draftDocumentIds } =
      await this.generateForChannels(
        project,
        postsRequested,
        language,
        dto.generate_images,
        dto.image_count,
      );

    return this.persistRun({
      project,
      channels,
      channelStyleProfiles,
      runStyleProfileId: null,
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
  // title/summary/content as source material instead of project ideas — a
  // distinct, BLOG-only feature unrelated to the channel picker.
  async createFromRssItems(userId: string, dto: CreateRssGenerationRunDto) {
    const project = await this.projectsService.findOwned(
      userId,
      dto.project_id,
    );

    const styleProfileId =
      dto.style_profile_id ??
      project.style_profiles[0]?.style_profile_id ??
      null;
    const styleProfile = styleProfileId
      ? await this.prisma.styleProfile.findUnique({
          where: { id: styleProfileId },
        })
      : null;
    if (styleProfileId && !styleProfile)
      throw new NotFoundException('Style profile not found');

    const attachedFeedIds = new Set(
      project.rss_feeds.map((link) => link.rss_feed_id),
    );

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
        throw new ConflictException(
          `RSS feed item "${item.title}" has already been used`,
        );
      }
    }

    const language = dto.language ?? DEFAULT_GENERATION_LANGUAGE;
    const drafts = await Promise.all(
      items.map((item) => this.generateRssDraft(item, styleProfile, language)),
    );

    const draftDocumentIds = await this.generateImagesForIdeas(
      drafts.length,
      (index) => this.draftSubject(drafts[index]),
      project,
      dto.generate_images,
      dto.image_count,
    );

    return this.persistRun({
      project,
      channels: [],
      runStyleProfileId: styleProfileId,
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

  // Generates more drafts into an existing run instead of starting a new
  // batch — used when the user is already viewing a run's results and asks
  // for more posts in the same batch.
  async addPosts(
    userId: string,
    runId: string,
    dto: AddPostsToGenerationRunDto,
  ) {
    const run = await this.prisma.generationRun.findUnique({
      where: { id: runId },
    });
    if (!run) throw new NotFoundException('Generation run not found');

    const project = await this.projectsService.findOwned(
      userId,
      run.project_id,
    );
    const postsRequested = dto.posts_requested ?? 3;
    const language = dto.language ?? run.language;

    const { channels, channelStyleProfiles, drafts, draftDocumentIds } =
      await this.generateForChannels(
        project,
        postsRequested,
        language,
        dto.generate_images,
        dto.image_count,
      );

    return this.persistRun({
      project,
      channels,
      channelStyleProfiles,
      runStyleProfileId: null,
      automationId: run.automation_id,
      label: run.label,
      postsRequested: (run.posts_requested ?? 0) + postsRequested,
      language,
      authorUserId: userId,
      drafts,
      draftDocumentIds,
      existingRunId: run.id,
    });
  }

  // Entry point used by the Automations cron — no interactive user is
  // available, so the author defaults to the organisation's creator.
  async runForAutomation(automation: Automation & { project: Project }) {
    if (automation.rss_feed_id) {
      return this.runRssAutomation(automation);
    }

    const bareProject = automation.project;
    const postsRequested = automation.posts_per_run;
    const language = DEFAULT_GENERATION_LANGUAGE;
    const status =
      automation.output_stage === AutomationOutputStage.PUBLISH
        ? PostStatus.READY
        : automation.output_stage === AutomationOutputStage.REVIEW
          ? PostStatus.REVIEW
          : PostStatus.DRAFT;

    const { created_by_user_id: authorUserId } =
      await this.prisma.organisation.findUniqueOrThrow({
        where: { id: bareProject.organisation_id },
      });

    const project = await this.projectsService.findOwned(
      authorUserId,
      bareProject.id,
    );
    const { channels, channelStyleProfiles, drafts, draftDocumentIds } =
      await this.generateForChannels(
        project,
        postsRequested,
        language,
        automation.generate_images,
        automation.image_count,
      );

    return this.persistRun({
      project,
      channels,
      channelStyleProfiles,
      runStyleProfileId: null,
      automationId: automation.id,
      label: `Automation: ${automation.name}`,
      postsRequested,
      language,
      authorUserId,
      drafts,
      draftDocumentIds,
      status,
    });
  }

  // Pulls up to `posts_per_run` unused items from the automation's attached
  // feed and generates one blog post per item. Returns undefined (no run
  // created) when there's nothing new since the last tick — a normal
  // outcome, not an error.
  private async runRssAutomation(
    automation: Automation & { project: Project },
  ) {
    const project = automation.project;

    const feed = await this.prisma.rssFeed.findUnique({
      where: { id: automation.rss_feed_id! },
    });
    if (!feed) return undefined;

    const items = await this.rssFeedsService.refreshAndListItems(
      feed.id,
      feed.url,
      {
        limit: automation.posts_per_run,
        unused_only: true,
      },
    );
    if (!items.length) return undefined;

    const styleProfileId = automation.style_profile_id ?? null;
    const styleProfile = styleProfileId
      ? await this.prisma.styleProfile.findUnique({
          where: { id: styleProfileId },
        })
      : null;

    const language = DEFAULT_GENERATION_LANGUAGE;
    const drafts = await Promise.all(
      items.map((item) => this.generateRssDraft(item, styleProfile, language)),
    );

    const draftDocumentIds = await this.generateImagesForIdeas(
      drafts.length,
      (index) => this.draftSubject(drafts[index]),
      project,
      automation.generate_images,
      automation.image_count,
    );

    const { created_by_user_id: authorUserId } =
      await this.prisma.organisation.findUniqueOrThrow({
        where: { id: project.organisation_id },
      });

    return this.persistRun({
      project,
      channels: [],
      runStyleProfileId: styleProfileId,
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
    // Non-empty = the unified multi-channel path (may include BLOG); []
    // signals the RSS "one flat blog draft per source item" path.
    channels: PostType[];
    channelStyleProfiles?: Partial<Record<PostType, StyleProfile | null>>;
    // GenerationRun.style_profile_id — meaningful only for the RSS path
    // (manual/first-attached selection); null for the multi-channel path,
    // where every post's style_profile_id is resolved per channel instead.
    runStyleProfileId: string | null;
    automationId: string | null;
    label?: string | null;
    postsRequested: number;
    language: string;
    authorUserId: string;
    drafts: (Draft | MultiChannelDraft)[];
    status?: PostStatus;
    draftDocumentIds?: string[][];
    rssFeedItemIds?: string[];
    existingRunId?: string;
  }) {
    const {
      project,
      channels,
      channelStyleProfiles,
      runStyleProfileId,
      automationId,
      label,
      postsRequested,
      language,
      authorUserId,
      drafts,
      status,
      draftDocumentIds,
      rssFeedItemIds,
      existingRunId,
    } = params;
    const isMultiChannel = channels.length > 0;

    return this.prisma.$transaction(async (tx) => {
      const run = existingRunId
        ? await tx.generationRun.update({
            where: { id: existingRunId },
            data: { posts_requested: postsRequested },
          })
        : await tx.generationRun.create({
            data: {
              project_id: project.id,
              style_profile_id: runStyleProfileId,
              automation_id: automationId,
              label,
              posts_requested: postsRequested,
              language,
            },
          });

      const postsPerIdea = await Promise.all(
        drafts.map(async (draft, index) => {
          const item = await tx.generationItem.create({
            data: {
              generation_run_id: run.id,
              order: index,
              topic: isMultiChannel
                ? ((draft as MultiChannelDraft).topic ?? null)
                : null,
            },
          });

          const documentIds = draftDocumentIds?.[index] ?? [];

          const createPost = async (data: {
            type: PostType;
            style_profile_id: string | null;
            hook?: string;
            body?: string;
            title?: string;
            excerpt?: string;
            seo_title?: string;
            seo_description?: string;
          }) => {
            const post = await tx.post.create({
              data: {
                user_id: authorUserId,
                organisation_id: project.organisation_id,
                project_id: project.id,
                style_profile_id: data.style_profile_id,
                generation_run_id: run.id,
                generation_item_id: item.id,
                rss_feed_item_id: rssFeedItemIds?.[index] ?? null,
                automation_id: automationId,
                type: data.type,
                status: status ?? PostStatus.DRAFT,
                hook: data.hook,
                body: data.body,
                title: data.title,
                excerpt: data.excerpt,
                seo_title: data.seo_title,
                seo_description: data.seo_description,
              },
            });

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
          };

          if (!isMultiChannel) {
            const blogDraft = draft as Draft;
            return [
              await createPost({
                type: PostType.BLOG,
                style_profile_id: runStyleProfileId,
                hook: blogDraft.hook,
                body: blogDraft.body,
                title: blogDraft.title,
                excerpt: blogDraft.excerpt,
                seo_title: blogDraft.seo_title,
                seo_description: blogDraft.seo_description,
              }),
            ];
          }

          const multiDraft = draft as MultiChannelDraft;
          return Promise.all(
            channels.map((channel) => {
              const variant = multiDraft[channel];
              const isBlogChannel = channel === PostType.BLOG;
              const blogVariant = isBlogChannel
                ? (variant as BlogChannelDraftVariant | undefined)
                : undefined;
              const socialVariant = !isBlogChannel
                ? (variant as ChannelDraftVariant | undefined)
                : undefined;

              return createPost({
                type: channel,
                style_profile_id: channelStyleProfiles?.[channel]?.id ?? null,
                hook: socialVariant?.hook,
                body: variant?.body,
                title: blogVariant?.title,
                excerpt: blogVariant?.excerpt,
                seo_title: blogVariant?.seo_title,
                seo_description: blogVariant?.seo_description,
              });
            }),
          );
        }),
      );

      const posts = postsPerIdea.flat();

      if (rssFeedItemIds?.length) {
        await tx.rssFeedItem.updateMany({
          where: { id: { in: rssFeedItemIds } },
          data: { is_used: true },
        });
      }

      const isAutomationRun = !!automationId;
      this.activityLogsService.log({
        organisation_id: project.organisation_id,
        user_id: isAutomationRun ? null : authorUserId,
        action: isAutomationRun
          ? ActivityLogAction.AUTOMATION_RAN
          : ActivityLogAction.GENERATION_RUN_CREATED,
        entity_type: ActivityLogEntityType.GENERATION_RUN,
        entity_id: run.id,
        description: isAutomationRun
          ? `${label} — generated ${posts.length} post${posts.length === 1 ? '' : 's'}`
          : `Generated ${posts.length} post${posts.length === 1 ? '' : 's'} for "${project.title}"`,
        metadata: {
          project_id: project.id,
          posts_requested: postsRequested,
          posts_created: posts.length,
        },
      });

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
        items: {
          orderBy: { order: 'asc' },
          include: {
            posts: {
              include: { attachments: { include: { document: true } } },
            },
          },
        },
      },
    });
    if (!run) throw new NotFoundException('Generation run not found');

    await this.projectsService.findOwned(userId, run.project_id);

    return run;
  }
}
