import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { OrganisationMemberStatus, OrganisationRole } from 'generated/prisma';
import { AuthRoles } from '@/modules/auth/interfaces/auth.interface';
import { CreateJwtService } from '@/shared/utils/jwt/jwt.service';
import { ResendMailService } from '@/integrations/notifications/resend/services/mail.service';
import { EmailConfig } from '@/shared/constants/email';
import { AppUrls } from '@/shared/config/app-urls';
import { OrganisationsService } from './organisations.service';
import { AddOrganisationMemberDto } from './dto/add-organisation-member.dto';
import { UpdateOrganisationMemberDto } from './dto/update-organisation-member.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { ErrorCodes } from '@/shared/config/error-codes';

const MANAGE_ROLES: OrganisationRole[] = [OrganisationRole.OWNER, OrganisationRole.ADMIN];
const INVITE_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
const MEMBER_USER_SELECT = { id: true, name: true, email: true, created_at: true } as const;

@Injectable()
export class OrganisationMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organisationsService: OrganisationsService,
    private readonly mailService: ResendMailService,
    private readonly jwtService: CreateJwtService,
  ) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

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
    const { membership, organisation } = await this.organisationsService.getMembership(
      organisationId,
      userId,
    );
    this.assertCanManageMembers(membership.role);

    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });

    const assertNoExistingMembership = async (targetUserId: string) => {
      const existingMembership = await this.prisma.organisationMember.findUnique({
        where: {
          organisation_id_user_id: { organisation_id: organisationId, user_id: targetUserId },
        },
      });
      if (existingMembership) {
        throw new ConflictException({
          message: 'This user is already a member of the organisation',
          code: ErrorCodes.Organisations.MEMBER_ALREADY_EXISTS,
        });
      }
    };

    // An email that already belongs to a real account already has working
    // login credentials, so there's nothing to invite them to set — just
    // grant access immediately and let them know.
    if (existingUser) {
      await assertNoExistingMembership(existingUser.id);

      const created = await this.prisma.organisationMember.create({
        data: {
          organisation_id: organisationId,
          user_id: existingUser.id,
          role: dto.role,
          status: OrganisationMemberStatus.ACTIVE,
        },
        include: { user: { select: MEMBER_USER_SELECT } },
      });

      setImmediate(async () => {
        try {
          await this.mailService.sendEmail({
            to: existingUser.email,
            from: EmailConfig.email_addresses.postwise,
            subject: EmailConfig.templates.organisation_member_added.subject,
            template_id: EmailConfig.templates.organisation_member_added.template_id,
            dynamic_template_data: {
              organisationName: organisation.name,
              signInUrl: AppUrls.signIn,
            },
          });
        } catch {}
      });

      return created;
    }

    const wantsInvite = dto.send_invite !== false;

    if (!wantsInvite) {
      if (!dto.password) {
        throw new BadRequestException('Password is required when not sending an invitation');
      }

      const hashed = await bcrypt.hash(dto.password, 10);
      const newUser = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashed,
          role: AuthRoles.USER,
        },
      });

      return this.prisma.organisationMember.create({
        data: {
          organisation_id: organisationId,
          user_id: newUser.id,
          role: dto.role,
          status: OrganisationMemberStatus.ACTIVE,
        },
        include: { user: { select: MEMBER_USER_SELECT } },
      });
    }

    // Placeholder password: a random bcrypt hash nobody can ever produce by
    // logging in with it — the real password is set when the invite is
    // accepted. Safer than an empty string against bcrypt.compare edge cases.
    const placeholderPassword = await bcrypt.hash(randomBytes(32).toString('hex'), 10);
    const newUser = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: placeholderPassword,
        role: AuthRoles.USER,
      },
    });

    const member = await this.prisma.organisationMember.create({
      data: {
        organisation_id: organisationId,
        user_id: newUser.id,
        role: dto.role,
        status: OrganisationMemberStatus.PENDING,
      },
      include: { user: { select: MEMBER_USER_SELECT } },
    });

    const token = randomBytes(32).toString('hex');
    await this.prisma.organisationInviteToken.create({
      data: {
        token_hash: this.hashToken(token),
        organisation_member_id: member.id,
        invited_by_user_id: userId,
        expires_at: new Date(Date.now() + INVITE_TOKEN_EXPIRY_MS),
      },
    });

    setImmediate(async () => {
      try {
        await this.mailService.sendEmail({
          to: newUser.email,
          from: EmailConfig.email_addresses.postwise,
          subject: EmailConfig.templates.organisation_invite.subject,
          template_id: EmailConfig.templates.organisation_invite.template_id,
          dynamic_template_data: {
            organisationName: organisation.name,
            acceptUrl: AppUrls.acceptOrganisationInvite(token),
          },
        });
      } catch {}
    });

    return member;
  }

  async resendInvitation(userId: string, organisationId: string, memberId: string) {
    const { membership } = await this.organisationsService.getMembership(
      organisationId,
      userId,
    );
    this.assertCanManageMembers(membership.role);

    const target = await this.prisma.organisationMember.findUnique({
      where: { id: memberId },
      include: {
        user: { select: MEMBER_USER_SELECT },
        organisation: { select: { name: true } },
      },
    });
    if (!target || target.organisation_id !== organisationId) {
      throw new NotFoundException('Member not found');
    }
    if (target.status !== OrganisationMemberStatus.PENDING) {
      throw new BadRequestException('This member has already accepted their invitation');
    }

    await this.prisma.organisationInviteToken.updateMany({
      where: { organisation_member_id: memberId, used_at: null },
      data: { used_at: new Date() },
    });

    const token = randomBytes(32).toString('hex');
    await this.prisma.organisationInviteToken.create({
      data: {
        token_hash: this.hashToken(token),
        organisation_member_id: memberId,
        invited_by_user_id: userId,
        expires_at: new Date(Date.now() + INVITE_TOKEN_EXPIRY_MS),
      },
    });

    await this.mailService.sendEmail({
      to: target.user.email,
      from: EmailConfig.email_addresses.postwise,
      subject: EmailConfig.templates.organisation_invite.subject,
      template_id: EmailConfig.templates.organisation_invite.template_id,
      dynamic_template_data: {
        organisationName: target.organisation.name,
        acceptUrl: AppUrls.acceptOrganisationInvite(token),
      },
    });

    return { message: 'Invitation resent' };
  }

  async getInvitationByToken(token: string) {
    const tokenHash = this.hashToken(token);

    const inviteToken = await this.prisma.organisationInviteToken.findUnique({
      where: { token_hash: tokenHash },
      include: {
        organisation_member: {
          include: {
            user: { select: { name: true, email: true } },
            organisation: { select: { name: true } },
          },
        },
      },
    });

    if (
      !inviteToken ||
      inviteToken.used_at ||
      inviteToken.expires_at < new Date()
    ) {
      throw new BadRequestException('Invalid or expired invitation');
    }

    return {
      name: inviteToken.organisation_member.user.name,
      email: inviteToken.organisation_member.user.email,
      organisation_name: inviteToken.organisation_member.organisation.name,
    };
  }

  async acceptInvitation(dto: AcceptInvitationDto) {
    const tokenHash = this.hashToken(dto.token);

    const inviteToken = await this.prisma.organisationInviteToken.findUnique({
      where: { token_hash: tokenHash },
    });

    if (
      !inviteToken ||
      inviteToken.used_at ||
      inviteToken.expires_at < new Date()
    ) {
      throw new BadRequestException('Invalid or expired invitation');
    }

    const member = await this.prisma.organisationMember.findUnique({
      where: { id: inviteToken.organisation_member_id },
    });
    if (!member) {
      throw new BadRequestException('Invalid or expired invitation');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: member.user_id },
        data: {
          password: hashedPassword,
          ...(dto.name ? { name: dto.name } : {}),
        },
      }),
      this.prisma.organisationMember.update({
        where: { id: member.id },
        data: { status: OrganisationMemberStatus.ACTIVE },
      }),
      this.prisma.organisationInviteToken.update({
        where: { id: inviteToken.id },
        data: { used_at: new Date() },
      }),
      this.prisma.organisationInviteToken.updateMany({
        where: {
          organisation_member_id: member.id,
          used_at: null,
          id: { not: inviteToken.id },
        },
        data: { used_at: new Date() },
      }),
    ]);

    const user = await this.prisma.user.findUnique({ where: { id: member.user_id } });

    const token = await this.jwtService.signToken({ id: user.id, role: user.role });
    const expires_in = this.jwtService.getExpirationTime(token);

    delete user.password;

    return { access_token: token, expires_in, user };
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
