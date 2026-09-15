import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ProjectsService } from '@/modules/projects/projects.service';
import { OwnershipService } from '@/shared/services/ownership/ownership.service';
import { computeNextRun } from '@/shared/utils/automations/next-run.util';
import { paginate, paginationMeta } from '@/shared/schemas/pagination.schema';
import { OrganisationRole } from 'generated/prisma';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';
import { AutomationsQueryType } from './dto/automations-query.schema';

const MANAGE_ROLES: OrganisationRole[] = [OrganisationRole.OWNER, OrganisationRole.ADMIN];

@Injectable()
export class AutomationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
    private readonly ownershipService: OwnershipService,
  ) {}

  private async assertManage(userId: string, project: { organisation_id: string }) {
    const context = await this.ownershipService.resolveContext(userId, project.organisation_id);
    this.ownershipService.assertRole(context, MANAGE_ROLES);
  }

  private async assertRssFeedAttached(projectId: string, rssFeedId: string | undefined) {
    if (!rssFeedId) return;

    const link = await this.prisma.projectRssFeed.findUnique({
      where: { project_id_rss_feed_id: { project_id: projectId, rss_feed_id: rssFeedId } },
    });
    if (!link) {
      throw new BadRequestException('RSS feed must be attached to this project first');
    }
  }

  async create(userId: string, dto: CreateAutomationDto) {
    const project = await this.projectsService.findOwned(userId, dto.project_id);
    await this.assertManage(userId, project);
    await this.assertRssFeedAttached(dto.project_id, dto.rss_feed_id);

    const daysOfWeek = dto.days_of_week ?? [];
    const timezone = dto.timezone ?? 'UTC';

    const nextRunAt = computeNextRun({
      frequency: dto.frequency,
      days_of_week: daysOfWeek,
      time_of_day: dto.time_of_day,
      timezone,
    });

    return this.prisma.automation.create({
      data: {
        project_id: dto.project_id,
        style_profile_id: dto.style_profile_id,
        rss_feed_id: dto.rss_feed_id,
        name: dto.name,
        is_active: dto.is_active ?? true,
        frequency: dto.frequency,
        days_of_week: daysOfWeek,
        time_of_day: dto.time_of_day,
        timezone,
        posts_per_run: dto.posts_per_run ?? 1,
        output_stage: dto.output_stage,
        generate_images: dto.generate_images ?? false,
        image_count: dto.image_count ?? 1,
        next_run_at: nextRunAt,
      },
    });
  }

  async findAll(userId: string, query: AutomationsQueryType) {
    await this.projectsService.findOwned(userId, query.project_id);

    const where = { project_id: query.project_id };
    const { skip, take } = paginate(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.automation.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.automation.count({ where }),
    ]);

    return { data, pagination: paginationMeta(total, query.page, query.limit) };
  }

  private async findOwned(userId: string, id: string) {
    const automation = await this.prisma.automation.findUnique({ where: { id } });
    if (!automation) throw new NotFoundException('Automation not found');

    const project = await this.projectsService.findOwned(userId, automation.project_id);
    return { automation, project };
  }

  async findOne(userId: string, id: string) {
    const { automation } = await this.findOwned(userId, id);
    return automation;
  }

  async update(userId: string, id: string, dto: UpdateAutomationDto) {
    const { automation, project } = await this.findOwned(userId, id);
    await this.assertManage(userId, project);
    if (dto.rss_feed_id !== undefined) {
      await this.assertRssFeedAttached(automation.project_id, dto.rss_feed_id);
    }

    const scheduleChanged =
      dto.frequency !== undefined ||
      dto.days_of_week !== undefined ||
      dto.time_of_day !== undefined ||
      dto.timezone !== undefined;

    const nextRunAt = scheduleChanged
      ? computeNextRun({
          frequency: dto.frequency ?? automation.frequency,
          days_of_week: dto.days_of_week ?? automation.days_of_week,
          time_of_day: dto.time_of_day ?? automation.time_of_day,
          timezone: dto.timezone ?? automation.timezone,
        })
      : undefined;

    return this.prisma.automation.update({
      where: { id },
      data: {
        style_profile_id: dto.style_profile_id,
        rss_feed_id: dto.rss_feed_id,
        name: dto.name,
        is_active: dto.is_active,
        frequency: dto.frequency,
        days_of_week: dto.days_of_week,
        time_of_day: dto.time_of_day,
        timezone: dto.timezone,
        posts_per_run: dto.posts_per_run,
        output_stage: dto.output_stage,
        generate_images: dto.generate_images,
        image_count: dto.image_count,
        ...(nextRunAt && { next_run_at: nextRunAt }),
      },
    });
  }

  async remove(userId: string, id: string) {
    const { project } = await this.findOwned(userId, id);
    await this.assertManage(userId, project);

    await this.prisma.automation.delete({ where: { id } });
    return { message: 'Automation deleted successfully' };
  }
}
