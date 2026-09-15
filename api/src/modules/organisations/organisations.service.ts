import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { OrganisationRole } from 'generated/prisma';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { ErrorCodes } from '@/shared/config/error-codes';

@Injectable()
export class OrganisationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertSlugAvailable(slug: string, excludeId?: string) {
    const existing = await this.prisma.organisation.findUnique({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException({
        message: 'This slug is already in use',
        code: ErrorCodes.Organisations.SLUG_ALREADY_IN_USE,
      });
    }
  }

  // Fetches an organisation and asserts the user is a member, returning the
  // organisation and the caller's membership row together.
  async getMembership(organisationId: string, userId: string) {
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
    });
    if (!organisation) throw new NotFoundException('Organisation not found');

    const membership = await this.prisma.organisationMember.findUnique({
      where: {
        organisation_id_user_id: { organisation_id: organisationId, user_id: userId },
      },
    });
    if (!membership) {
      throw new ForbiddenException({
        message: 'You are not a member of this organisation',
        code: ErrorCodes.Organisations.NOT_A_MEMBER,
      });
    }

    return { organisation, membership };
  }

  // Slugifies `base`, then appends a numeric suffix until the slug is free.
  private async generateUniqueSlug(base: string) {
    const root =
      base
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'workspace';

    let slug = root;
    let suffix = 1;
    while (await this.prisma.organisation.findUnique({ where: { slug } })) {
      suffix += 1;
      slug = `${root}-${suffix}`;
    }
    return slug;
  }

  // Every user gets a personal default organisation on registration, with
  // themselves as an Admin member (§ default workspace) — this keeps them
  // functional without going through the manual create-organisation flow.
  async createDefault(userId: string, userName: string) {
    const slug = await this.generateUniqueSlug(userName);

    return this.prisma.$transaction(async (tx) => {
      const organisation = await tx.organisation.create({
        data: {
          name: `${userName}'s Workspace`,
          slug,
          created_by_user_id: userId,
        },
      });

      await tx.organisationMember.create({
        data: {
          organisation_id: organisation.id,
          user_id: userId,
          role: OrganisationRole.ADMIN,
        },
      });

      return organisation;
    });
  }

  async create(userId: string, dto: CreateOrganisationDto) {
    await this.assertSlugAvailable(dto.slug);

    return this.prisma.$transaction(async (tx) => {
      const organisation = await tx.organisation.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          created_by_user_id: userId,
        },
      });

      await tx.organisationMember.create({
        data: {
          organisation_id: organisation.id,
          user_id: userId,
          role: OrganisationRole.OWNER,
        },
      });

      return organisation;
    });
  }

  async findAll(userId: string) {
    return this.prisma.organisation.findMany({
      where: { members: { some: { user_id: userId } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(userId: string, organisationId: string) {
    const { organisation } = await this.getMembership(organisationId, userId);
    return organisation;
  }

  async update(userId: string, organisationId: string, dto: UpdateOrganisationDto) {
    const { membership } = await this.getMembership(organisationId, userId);

    const canUpdate: OrganisationRole[] = [OrganisationRole.OWNER, OrganisationRole.ADMIN];
    if (!canUpdate.includes(membership.role)) {
      throw new ForbiddenException('Only the owner or an admin can update the organisation');
    }

    if (dto.slug) {
      await this.assertSlugAvailable(dto.slug, organisationId);
    }

    return this.prisma.organisation.update({
      where: { id: organisationId },
      data: { name: dto.name, slug: dto.slug },
    });
  }

  async remove(userId: string, organisationId: string) {
    const { membership } = await this.getMembership(organisationId, userId);

    if (membership.role !== OrganisationRole.OWNER) {
      throw new ForbiddenException('Only the owner can delete the organisation');
    }

    await this.prisma.organisation.delete({ where: { id: organisationId } });
    return { message: 'Organisation deleted successfully' };
  }
}
