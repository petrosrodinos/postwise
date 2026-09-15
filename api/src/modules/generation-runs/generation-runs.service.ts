import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AiService } from '@/integrations/ai/services/ai.service';
import { ProjectsService } from '@/modules/projects/projects.service';
import { parseAiJson } from '@/shared/utils/ai/parse-ai-json.util';
import { paginate, paginationMeta } from '@/shared/schemas/pagination.schema';
import {
  Automation,
  AutomationOutputStage,
  PostStatus,
  PostType,
  Project,
  StyleProfile,
} from 'generated/prisma';
import { CreateGenerationRunDto } from './dto/create-generation-run.dto';
import { GenerationRunsQueryType } from './dto/generation-runs-query.schema';
import { Draft, DraftsSchema } from './interfaces/draft.interface';
import { DEFAULT_GENERATION_LANGUAGE, GENERATION_LANGUAGES } from './constants/languages.constant';

@Injectable()
export class GenerationRunsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
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

    return this.persistRun({
      project,
      styleProfileId,
      automationId: null,
      label: dto.label,
      postsRequested,
      language,
      authorUserId: userId,
      drafts,
    });
  }

  // Entry point used by the Automations cron — no interactive user is
  // available, so the author defaults to the organisation's creator.
  async runForAutomation(automation: Automation & { project: Project }) {
    const project = automation.project;

    const styleProfileId = automation.style_profile_id ?? null;
    const styleProfile = styleProfileId
      ? await this.prisma.styleProfile.findUnique({ where: { id: styleProfileId } })
      : null;

    const postsRequested = automation.posts_per_run;
    const language = DEFAULT_GENERATION_LANGUAGE;
    const drafts = await this.generateDrafts(project, styleProfile, postsRequested, language);

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
  }) {
    const { project, styleProfileId, automationId, label, postsRequested, language, authorUserId, drafts, status } =
      params;

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
        drafts.map((draft) =>
          tx.post.create({
            data: {
              user_id: authorUserId,
              organisation_id: project.organisation_id,
              project_id: project.id,
              style_profile_id: styleProfileId,
              generation_run_id: run.id,
              type: project.platform,
              status: status ?? PostStatus.DRAFT,
              hook: draft.hook,
              body: draft.body,
              title: draft.title,
              excerpt: draft.excerpt,
            },
          }),
        ),
      );

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
      include: { posts: true },
    });
    if (!run) throw new NotFoundException('Generation run not found');

    await this.projectsService.findOwned(userId, run.project_id);

    return run;
  }
}
