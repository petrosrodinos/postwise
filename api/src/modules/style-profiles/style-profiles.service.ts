import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AiService } from '@/integrations/ai/services/ai.service';
import { LinkedInScraperService } from '@/integrations/apify/linkedin-scraper/services/linkedin-scraper.service';
import { OwnershipService } from '@/shared/services/ownership/ownership.service';
import { parseAiJson } from '@/shared/utils/ai/parse-ai-json.util';
import { ActivityLogsService } from '@/modules/activity-logs/activity-logs.service';
import { diffFields } from '@/modules/activity-logs/utils/activity-log.utils';
import { ActivityLogAction, ActivityLogEntityType, OrganisationRole, PostType } from 'generated/prisma';
import { CreateStyleProfileDto } from './dto/create-style-profile.dto';
import { UpdateStyleProfileDto } from './dto/update-style-profile.dto';
import { AnalyzeStyleProfileDto } from './dto/analyze-style-profile.dto';
import { ScrapeLinkedInPostsDto } from './dto/scrape-linkedin-posts.dto';
import { StyleProfilesQueryType } from './dto/style-profiles-query.schema';
import { paginate, paginationMeta } from '@/shared/schemas/pagination.schema';
import { ScrapedLinkedInPost } from './interfaces/style-profiles.interface';

const MANAGE_ROLES: OrganisationRole[] = [
  OrganisationRole.OWNER,
  OrganisationRole.ADMIN,
];

const AnalysisSchema = z.object({
  tone_score: z.number().min(0).max(100),
  structure_score: z.number().min(0).max(100),
  hooks_score: z.number().min(0).max(100),
  vocabulary_score: z.number().min(0).max(100),
  rhythm_score: z.number().min(0).max(100),
  tone_description: z.string(),
  dominant_hook: z.string(),
  vocabulary: z.array(z.string()),
  pillars: z.array(z.string()),
});

@Injectable()
export class StyleProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly linkedInScraperService: LinkedInScraperService,
    private readonly ownershipService: OwnershipService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async create(userId: string, dto: CreateStyleProfileDto) {
    const context = await this.ownershipService.resolveContext(
      userId,
      dto.organisation_id,
    );
    this.ownershipService.assertRole(context, MANAGE_ROLES);

    const profile = await this.prisma.styleProfile.create({
      data: {
        organisation_id: context.organisation_id,
        name: dto.name,
        platform: dto.platform,
        source_url: dto.source_url,
      },
    });

    this.activityLogsService.log({
      organisation_id: context.organisation_id,
      user_id: userId,
      action: ActivityLogAction.STYLE_PROFILE_CREATED,
      entity_type: ActivityLogEntityType.STYLE_PROFILE,
      entity_id: profile.id,
      description: `Created style profile "${profile.name}"`,
    });

    return profile;
  }

  async findAll(userId: string, query: StyleProfilesQueryType) {
    await this.ownershipService.resolveContext(userId, query.organisation_id);

    const where = {
      organisation_id: query.organisation_id,
      ...(query.platform && { platform: query.platform }),
    };

    const { skip, take } = paginate(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.styleProfile.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.styleProfile.count({ where }),
    ]);

    return { data, pagination: paginationMeta(total, query.page, query.limit) };
  }

  async findOwned(userId: string, id: string) {
    const profile = await this.prisma.styleProfile.findUnique({
      where: { id },
    });
    if (!profile) throw new NotFoundException('Style profile not found');

    await this.ownershipService.resolveContext(userId, profile.organisation_id);

    return profile;
  }

  async findOne(userId: string, id: string) {
    return this.findOwned(userId, id);
  }

  private async assertManage(userId: string, profile: { organisation_id: string }) {
    const context = await this.ownershipService.resolveContext(
      userId,
      profile.organisation_id,
    );
    this.ownershipService.assertRole(context, MANAGE_ROLES);
  }

  async update(userId: string, id: string, dto: UpdateStyleProfileDto) {
    const profile = await this.findOwned(userId, id);
    await this.assertManage(userId, profile);

    const updated = await this.prisma.styleProfile.update({
      where: { id },
      data: {
        name: dto.name,
        platform: dto.platform,
        source_url: dto.source_url,
        tone_score: dto.tone_score,
        structure_score: dto.structure_score,
        hooks_score: dto.hooks_score,
        vocabulary_score: dto.vocabulary_score,
        rhythm_score: dto.rhythm_score,
        tone_description: dto.tone_description,
        dominant_hook: dto.dominant_hook,
        vocabulary: dto.vocabulary,
        pillars: dto.pillars,
      },
    });

    this.activityLogsService.log({
      organisation_id: profile.organisation_id,
      user_id: userId,
      action: ActivityLogAction.STYLE_PROFILE_UPDATED,
      entity_type: ActivityLogEntityType.STYLE_PROFILE,
      entity_id: profile.id,
      description: `Updated style profile "${updated.name}"`,
      metadata: {
        changes: diffFields(profile, updated, [
          'name',
          'platform',
          'source_url',
          'tone_score',
          'structure_score',
          'hooks_score',
          'vocabulary_score',
          'rhythm_score',
          'tone_description',
          'dominant_hook',
          'vocabulary',
          'pillars',
        ]),
      },
    });

    return updated;
  }

  async remove(userId: string, id: string) {
    const profile = await this.findOwned(userId, id);
    await this.assertManage(userId, profile);

    await this.prisma.styleProfile.delete({ where: { id } });

    this.activityLogsService.log({
      organisation_id: profile.organisation_id,
      user_id: userId,
      action: ActivityLogAction.STYLE_PROFILE_DELETED,
      entity_type: ActivityLogEntityType.STYLE_PROFILE,
      entity_id: profile.id,
      description: `Deleted style profile "${profile.name}"`,
    });

    return { message: 'Style profile deleted successfully' };
  }

  async analyze(userId: string, id: string, dto: AnalyzeStyleProfileDto) {
    const profile = await this.findOwned(userId, id);
    await this.assertManage(userId, profile);

    const prompt = `Analyze the writing style of the following ${profile.platform} posts and return ONLY a raw JSON object (no markdown) with this exact shape:
{
  "tone_score": number (0-100),
  "structure_score": number (0-100),
  "hooks_score": number (0-100),
  "vocabulary_score": number (0-100),
  "rhythm_score": number (0-100),
  "tone_description": string,
  "dominant_hook": string,
  "vocabulary": string[] (10-20 signature words/phrases),
  "pillars": string[] (3-6 recurring content themes)
}

Posts:
${dto.sample_posts.map((post, i) => `[${i + 1}] ${post}`).join('\n\n')}`;

    const { response } = await this.aiService.generateText({
      prompt,
      system:
        'You are an expert content strategist who fingerprints writing style for AI drafting.',
      temperature: 0.4,
    });

    const analysis = parseAiJson(response, AnalysisSchema);

    const updated = await this.prisma.styleProfile.update({
      where: { id },
      data: {
        ...analysis,
        posts_analyzed: profile.posts_analyzed + dto.sample_posts.length,
        last_analyzed_at: new Date(),
      },
    });

    this.activityLogsService.log({
      organisation_id: profile.organisation_id,
      user_id: userId,
      action: ActivityLogAction.STYLE_PROFILE_ANALYZED,
      entity_type: ActivityLogEntityType.STYLE_PROFILE,
      entity_id: profile.id,
      description: `Analyzed ${dto.sample_posts.length} sample post${dto.sample_posts.length === 1 ? '' : 's'} for style profile "${updated.name}"`,
      metadata: {
        changes: diffFields(profile, updated, [
          'tone_score',
          'structure_score',
          'hooks_score',
          'vocabulary_score',
          'rhythm_score',
          'posts_analyzed',
        ]),
      },
    });

    return updated;
  }

  async scrapeLinkedInPosts(
    userId: string,
    id: string,
    dto: ScrapeLinkedInPostsDto,
  ): Promise<ScrapedLinkedInPost[]> {
    const profile = await this.findOwned(userId, id);
    await this.assertManage(userId, profile);

    if (profile.platform !== PostType.LINKEDIN) {
      throw new BadRequestException(
        'Scraping is only supported for LinkedIn style profiles',
      );
    }

    const sourceUrl = dto.source_url ?? profile.source_url;
    if (!sourceUrl) {
      throw new BadRequestException(
        'Provide a source_url to scrape posts from',
      );
    }

    const posts = await this.linkedInScraperService.scrapeProfilePosts({
      targetUrls: [sourceUrl],
      maxPosts: dto.max_posts ?? 20,
      postedLimit: dto.posted_limit,
      includeReposts: dto.include_reposts,
      includeQuotePosts: dto.include_quote_posts,
    });

    return posts
      .filter((post) => post.content?.trim())
      .map((post, index) => ({
        id: post.id ?? post.linkedinUrl ?? `${id}-${index}`,
        url: post.linkedinUrl,
        text: post.content!.trim(),
        posted_at: post.postedAt?.date,
        author_name: post.author?.name,
        likes: post.engagement?.likes,
        comments: post.engagement?.comments,
      }));
  }
}
