import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { OwnershipService } from '@/shared/services/ownership/ownership.service';
import { AiService } from '@/integrations/ai/services/ai.service';
import { parseAiJson } from '@/shared/utils/ai/parse-ai-json.util';
import { ActivityLogsService } from '@/modules/activity-logs/activity-logs.service';
import { diffFields } from '@/modules/activity-logs/utils/activity-log.utils';
import { ActivityLogAction, ActivityLogEntityType, OrganisationRole } from 'generated/prisma';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AttachStyleProfileDto } from './dto/attach-style-profile.dto';
import { AttachRssFeedDto } from './dto/attach-rss-feed.dto';
import { GenerateProjectDetailsDto } from './dto/generate-project-details.dto';
import { ProjectsQueryType } from './dto/projects-query.schema';
import { paginate, paginationMeta } from '@/shared/schemas/pagination.schema';
import { ProjectAiSuggestionsSchema } from './interfaces/project-ai-suggestions.interface';

const MANAGE_ROLES: OrganisationRole[] = [OrganisationRole.OWNER, OrganisationRole.ADMIN];

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownershipService: OwnershipService,
    private readonly aiService: AiService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async generateDetails(dto: GenerateProjectDetailsDto) {
    const prompt = `Plan a content strategy for the following project. Return ONLY a raw JSON object (no markdown) with this exact shape:
{
  "pillars": string[] (3-6 short, recurring content themes/topics for this project),
  "ideas": string[] (5-8 concrete post ideas or angles to draw from),
  "instructions": string[] (3-6 short rules the AI should always follow when drafting for this project, e.g. tone, formatting or things to avoid)
}

Project title: ${dto.title}
Project description: ${dto.description ?? 'n/a'}
Platform: ${dto.platform ?? 'general social media'}
Additional directions from the user: ${dto.ai_directions ?? 'n/a'}`;

    const { response } = await this.aiService.generateText({
      prompt,
      system: 'You are an expert content strategist who plans social media and blog content.',
      temperature: 0.7,
    });

    return parseAiJson(response, ProjectAiSuggestionsSchema);
  }

  async create(userId: string, dto: CreateProjectDto) {
    const context = await this.ownershipService.resolveContext(userId, dto.organisation_id);
    this.ownershipService.assertRole(context, MANAGE_ROLES);

    const project = await this.prisma.project.create({
      data: {
        organisation_id: context.organisation_id,
        title: dto.title,
        description: dto.description,
        platform: dto.platform,
        pillars: dto.pillars ?? [],
        ideas: dto.ideas ?? [],
        instructions: dto.instructions ?? [],
        ai_directions: dto.ai_directions,
      },
    });

    this.activityLogsService.log({
      organisation_id: context.organisation_id,
      user_id: userId,
      action: ActivityLogAction.PROJECT_CREATED,
      entity_type: ActivityLogEntityType.PROJECT,
      entity_id: project.id,
      description: `Created project "${project.title}"`,
    });

    return project;
  }

  async findAll(userId: string, query: ProjectsQueryType) {
    await this.ownershipService.resolveContext(userId, query.organisation_id);

    const where = {
      organisation_id: query.organisation_id,
      ...(query.platform && { platform: query.platform }),
      ...(query.is_archived !== undefined && { is_archived: query.is_archived }),
    };

    const { skip, take } = paginate(query.page, query.limit);

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
        include: {
          style_profiles: { include: { style_profile: true } },
          rss_feeds: { include: { rss_feed: true } },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    const projectIds = projects.map((project) => project.id);
    const statusGroups = projectIds.length
      ? await this.prisma.post.groupBy({
          by: ['project_id', 'status'],
          where: { project_id: { in: projectIds } },
          _count: true,
        })
      : [];

    const countsByProject = new Map<string, Record<string, number>>();
    for (const group of statusGroups) {
      if (!group.project_id) continue;
      const counts = countsByProject.get(group.project_id) ?? {};
      counts[group.status] = group._count;
      countsByProject.set(group.project_id, counts);
    }

    const data = projects.map((project) => ({
      ...project,
      post_status_counts: countsByProject.get(project.id) ?? {},
    }));

    return { data, pagination: paginationMeta(total, query.page, query.limit) };
  }

  async findOwned(userId: string, id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        style_profiles: { include: { style_profile: true } },
        rss_feeds: { include: { rss_feed: true } },
      },
    });
    if (!project) throw new NotFoundException('Project not found');

    await this.ownershipService.resolveContext(userId, project.organisation_id);

    return project;
  }

  async findOne(userId: string, id: string) {
    const project = await this.findOwned(userId, id);

    const statusGroups = await this.prisma.post.groupBy({
      by: ['status'],
      where: { project_id: id },
      _count: true,
    });
    const post_status_counts: Record<string, number> = {};
    for (const group of statusGroups) {
      post_status_counts[group.status] = group._count;
    }

    return { ...project, post_status_counts };
  }

  private async assertManage(userId: string, project: { organisation_id: string }) {
    const context = await this.ownershipService.resolveContext(userId, project.organisation_id);
    this.ownershipService.assertRole(context, MANAGE_ROLES);
  }

  async update(userId: string, id: string, dto: UpdateProjectDto) {
    const project = await this.findOwned(userId, id);
    await this.assertManage(userId, project);

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        platform: dto.platform,
        pillars: dto.pillars,
        ideas: dto.ideas,
        instructions: dto.instructions,
        ai_directions: dto.ai_directions,
        is_archived: dto.is_archived,
      },
    });

    this.activityLogsService.log({
      organisation_id: project.organisation_id,
      user_id: userId,
      action: ActivityLogAction.PROJECT_UPDATED,
      entity_type: ActivityLogEntityType.PROJECT,
      entity_id: project.id,
      description: `Updated project "${updated.title}"`,
      metadata: {
        changes: diffFields(project, updated, [
          'title',
          'description',
          'platform',
          'pillars',
          'ideas',
          'instructions',
          'ai_directions',
          'is_archived',
        ]),
      },
    });

    return updated;
  }

  async remove(userId: string, id: string) {
    const project = await this.findOwned(userId, id);
    await this.assertManage(userId, project);

    await this.prisma.project.delete({ where: { id } });

    this.activityLogsService.log({
      organisation_id: project.organisation_id,
      user_id: userId,
      action: ActivityLogAction.PROJECT_DELETED,
      entity_type: ActivityLogEntityType.PROJECT,
      entity_id: project.id,
      description: `Deleted project "${project.title}"`,
    });

    return { message: 'Project deleted successfully' };
  }

  async attachStyleProfile(userId: string, id: string, dto: AttachStyleProfileDto) {
    const project = await this.findOwned(userId, id);
    await this.assertManage(userId, project);

    const styleProfile = await this.prisma.styleProfile.findUnique({
      where: { id: dto.style_profile_id },
    });
    if (!styleProfile) throw new NotFoundException('Style profile not found');

    const sameOwner = styleProfile.organisation_id === project.organisation_id;
    if (!sameOwner) {
      throw new BadRequestException(
        'Style profile must belong to the same owner context as the project',
      );
    }

    const existing = await this.prisma.projectStyleProfile.findUnique({
      where: {
        project_id_style_profile_id: {
          project_id: id,
          style_profile_id: dto.style_profile_id,
        },
      },
    });
    if (existing) {
      throw new ConflictException('This style profile is already attached to the project');
    }

    const link = await this.prisma.projectStyleProfile.create({
      data: { project_id: id, style_profile_id: dto.style_profile_id },
      include: { style_profile: true },
    });

    this.activityLogsService.log({
      organisation_id: project.organisation_id,
      user_id: userId,
      action: ActivityLogAction.PROJECT_STYLE_PROFILE_ATTACHED,
      entity_type: ActivityLogEntityType.PROJECT,
      entity_id: project.id,
      description: `Attached style profile "${link.style_profile.name}" to "${project.title}"`,
    });

    return link;
  }

  async detachStyleProfile(userId: string, id: string, styleProfileId: string) {
    const project = await this.findOwned(userId, id);
    await this.assertManage(userId, project);

    const link = await this.prisma.projectStyleProfile.findUnique({
      where: {
        project_id_style_profile_id: { project_id: id, style_profile_id: styleProfileId },
      },
      include: { style_profile: true },
    });
    if (!link) throw new NotFoundException('This style profile is not attached to the project');

    await this.prisma.projectStyleProfile.delete({ where: { id: link.id } });

    this.activityLogsService.log({
      organisation_id: project.organisation_id,
      user_id: userId,
      action: ActivityLogAction.PROJECT_STYLE_PROFILE_DETACHED,
      entity_type: ActivityLogEntityType.PROJECT,
      entity_id: project.id,
      description: `Detached style profile "${link.style_profile.name}" from "${project.title}"`,
    });

    return { message: 'Style profile detached successfully' };
  }

  async attachRssFeed(userId: string, id: string, dto: AttachRssFeedDto) {
    const project = await this.findOwned(userId, id);
    await this.assertManage(userId, project);

    const rssFeed = await this.prisma.rssFeed.findUnique({
      where: { id: dto.rss_feed_id },
    });
    if (!rssFeed) throw new NotFoundException('RSS feed not found');

    const sameOwner = rssFeed.organisation_id === project.organisation_id;
    if (!sameOwner) {
      throw new BadRequestException(
        'RSS feed must belong to the same owner context as the project',
      );
    }

    const existing = await this.prisma.projectRssFeed.findUnique({
      where: {
        project_id_rss_feed_id: { project_id: id, rss_feed_id: dto.rss_feed_id },
      },
    });
    if (existing) {
      throw new ConflictException('This RSS feed is already attached to the project');
    }

    const link = await this.prisma.projectRssFeed.create({
      data: { project_id: id, rss_feed_id: dto.rss_feed_id },
      include: { rss_feed: true },
    });

    this.activityLogsService.log({
      organisation_id: project.organisation_id,
      user_id: userId,
      action: ActivityLogAction.PROJECT_RSS_FEED_ATTACHED,
      entity_type: ActivityLogEntityType.PROJECT,
      entity_id: project.id,
      description: `Attached RSS feed "${link.rss_feed.name}" to "${project.title}"`,
    });

    return link;
  }

  async detachRssFeed(userId: string, id: string, rssFeedId: string) {
    const project = await this.findOwned(userId, id);
    await this.assertManage(userId, project);

    const link = await this.prisma.projectRssFeed.findUnique({
      where: { project_id_rss_feed_id: { project_id: id, rss_feed_id: rssFeedId } },
      include: { rss_feed: true },
    });
    if (!link) throw new NotFoundException('This RSS feed is not attached to the project');

    await this.prisma.projectRssFeed.delete({ where: { id: link.id } });

    this.activityLogsService.log({
      organisation_id: project.organisation_id,
      user_id: userId,
      action: ActivityLogAction.PROJECT_RSS_FEED_DETACHED,
      entity_type: ActivityLogEntityType.PROJECT,
      entity_id: project.id,
      description: `Detached RSS feed "${link.rss_feed.name}" from "${project.title}"`,
    });

    return { message: 'RSS feed detached successfully' };
  }
}
