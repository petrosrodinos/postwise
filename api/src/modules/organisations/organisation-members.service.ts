import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { OrganisationRole } from 'generated/prisma';
import { AuthRoles } from '@/modules/auth/interfaces/auth.interface';
import { OrganisationsService } from './organisations.service';
import { AddOrganisationMemberDto } from './dto/add-organisation-member.dto';
import { UpdateOrganisationMemberDto } from './dto/update-organisation-member.dto';
import { ErrorCodes } from '@/shared/config/error-codes';

const MANAGE_ROLES: OrganisationRole[] = [OrganisationRole.OWNER, OrganisationRole.ADMIN];

@Injectable()
export class OrganisationMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organisationsService: OrganisationsService,
  ) {}

  private assertCanManageMembers(role: OrganisationRole) {
    if (!MANAGE_ROLES.includes(role)) {
      throw new ForbiddenException('Only the owner or an admin can manage members');
    }
  }

  async findAll(userId: string, organisationId: string) {
    await this.organisationsService.getMembership(organisationId, userId);

    return this.prisma.organisationMember.findMany({
      where: { organisation_id: organisationId },
      include: {
        user: { select: { id: true, name: true, email: true, created_at: true } },
      },
      orderBy: { created_at: 'asc' },
    });
  }

  async add(userId: string, organisationId: string, dto: AddOrganisationMemberDto) {
    const { membership } = await this.organisationsService.getMembership(
      organisationId,
      userId,
    );
    this.assertCanManageMembers(membership.role);

    let member = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!member) {
      const hashed = await bcrypt.hash(dto.password, 10);
      member = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashed,
          role: AuthRoles.USER,
        },
      });
    }

    const existingMembership = await this.prisma.organisationMember.findUnique({
      where: {
        organisation_id_user_id: { organisation_id: organisationId, user_id: member.id },
      },
    });
    if (existingMembership) {
      throw new ConflictException({
        message: 'This user is already a member of the organisation',
        code: ErrorCodes.Organisations.MEMBER_ALREADY_EXISTS,
      });
    }

    return this.prisma.organisationMember.create({
      data: {
        organisation_id: organisationId,
        user_id: member.id,
        role: dto.role,
      },
      include: {
        user: { select: { id: true, name: true, email: true, created_at: true } },
      },
    });
  }

  private async assertNotLastOwner(organisationId: string, memberId: string) {
    const target = await this.prisma.organisationMember.findUnique({
      where: { id: memberId },
    });
    if (!target || target.organisation_id !== organisationId) {
      throw new NotFoundException('Member not found');
    }

    if (target.role === OrganisationRole.OWNER) {
      const ownerCount = await this.prisma.organisationMember.count({
        where: { organisation_id: organisationId, role: OrganisationRole.OWNER },
      });
      if (ownerCount <= 1) {
        throw new BadRequestException({
          message: 'An organisation must have at least one owner',
          code: ErrorCodes.Organisations.LAST_OWNER,
        });
      }
    }

    return target;
  }

  async updateRole(
    userId: string,
    organisationId: string,
    memberId: string,
    dto: UpdateOrganisationMemberDto,
  ) {
    const { membership } = await this.organisationsService.getMembership(
      organisationId,
      userId,
    );
    this.assertCanManageMembers(membership.role);

    if (dto.role !== OrganisationRole.OWNER) {
      await this.assertNotLastOwner(organisationId, memberId);
    } else {
      const target = await this.prisma.organisationMember.findUnique({
        where: { id: memberId },
      });
      if (!target || target.organisation_id !== organisationId) {
        throw new NotFoundException('Member not found');
      }
    }

    return this.prisma.organisationMember.update({
      where: { id: memberId },
      data: { role: dto.role },
      include: {
        user: { select: { id: true, name: true, email: true, created_at: true } },
      },
    });
  }

  async remove(userId: string, organisationId: string, memberId: string) {
    const { membership } = await this.organisationsService.getMembership(
      organisationId,
      userId,
    );
    this.assertCanManageMembers(membership.role);

    await this.assertNotLastOwner(organisationId, memberId);

    await this.prisma.organisationMember.delete({ where: { id: memberId } });
    return { message: 'Member removed successfully' };
  }
}
