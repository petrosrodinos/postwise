import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { OwnershipService } from '@/shared/services/ownership/ownership.service';
import { OrganisationRole } from 'generated/prisma';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AttachStyleProfileDto } from './dto/attach-style-profile.dto';
import { ProjectsQueryType } from './dto/projects-query.schema';
import { paginate, paginationMeta } from '@/shared/schemas/pagination.schema';

const MANAGE_ROLES: OrganisationRole[] = [OrganisationRole.OWNER, OrganisationRole.ADMIN];

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownershipService: OwnershipService,
  ) {}

  async create(userId: string, dto: CreateProjectDto) {
    const context = await this.ownershipService.resolveContext(userId, dto.organisation_id);
    this.ownershipService.assertRole(context, MANAGE_ROLES);

    return this.prisma.project.create({
      data: {
        user_id: context.user_id,
        organisation_id: context.organisation_id,
        title: dto.title,
        description: dto.description,
        platform: dto.platform,
        pillars: dto.pillars ?? [],
        ideas: dto.ideas ?? [],
        instructions: dto.instructions ?? [],
      },
    });
  }

  async findAll(userId: string, query: ProjectsQueryType) {
    if (query.organisation_id) {
      await this.ownershipService.resolveContext(userId, query.organisation_id);
    }

    const where = {
      ...(query.organisation_id
        ? { organisation_id: query.organisation_id }
        : { user_id: userId }),
      ...(query.platform && { platform: query.platform }),
      ...(query.is_archived !== undefined && { is_archived: query.is_archived }),
    };

    const { skip, take } = paginate(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    return { data, pagination: paginationMeta(total, query.page, query.limit) };
  }

  async findOwned(userId: string, id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { style_profiles: { include: { style_profile: true } } },
    });
    if (!project) throw new NotFoundException('Project not found');

    if (project.organisation_id) {
      await this.ownershipService.resolveContext(userId, project.organisation_id);
    } else if (project.user_id !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async findOne(userId: string, id: string) {
    return this.findOwned(userId, id);
  }

  private async assertManage(userId: string, project: { organisation_id?: string | null }) {
    if (project.organisation_id) {
      const context = await this.ownershipService.resolveContext(userId, project.organisation_id);
      this.ownershipService.assertRole(context, MANAGE_ROLES);
    }
  }

  async update(userId: string, id: string, dto: UpdateProjectDto) {
    const project = await this.findOwned(userId, id);
    await this.assertManage(userId, project);

    return this.prisma.project.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        platform: dto.platform,
        pillars: dto.pillars,
        ideas: dto.ideas,
        instructions: dto.instructions,
        is_archived: dto.is_archived,
      },
    });
  }

  async remove(userId: string, id: string) {
    const project = await this.findOwned(userId, id);
    await this.assertManage(userId, project);

    await this.prisma.project.delete({ where: { id } });
    return { message: 'Project deleted successfully' };
  }

  async attachStyleProfile(userId: string, id: string, dto: AttachStyleProfileDto) {
    const project = await this.findOwned(userId, id);
    await this.assertManage(userId, project);

    const styleProfile = await this.prisma.styleProfile.findUnique({
      where: { id: dto.style_profile_id },
    });
    if (!styleProfile) throw new NotFoundException('Style profile not found');

    const sameOwner =
      (project.organisation_id && styleProfile.organisation_id === project.organisation_id) ||
      (!project.organisation_id && styleProfile.user_id === project.user_id);
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

    return this.prisma.projectStyleProfile.create({
      data: { project_id: id, style_profile_id: dto.style_profile_id },
      include: { style_profile: true },
    });
  }

  async detachStyleProfile(userId: string, id: string, styleProfileId: string) {
    const project = await this.findOwned(userId, id);
    await this.assertManage(userId, project);

    const link = await this.prisma.projectStyleProfile.findUnique({
      where: {
        project_id_style_profile_id: { project_id: id, style_profile_id: styleProfileId },
      },
    });
    if (!link) throw new NotFoundException('This style profile is not attached to the project');

    await this.prisma.projectStyleProfile.delete({ where: { id: link.id } });
    return { message: 'Style profile detached successfully' };
  }
}
