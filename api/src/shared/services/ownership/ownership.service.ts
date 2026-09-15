import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { OrganisationRole } from 'generated/prisma';
import { OwnerContext } from './ownership.interface';

@Injectable()
export class OwnershipService {
  constructor(private readonly prisma: PrismaService) {}

  // Resolves whether a request acts under the user's personal account or an
  // Organisation workspace, verifying membership when an organisation is given.
  async resolveContext(
    userId: string,
    organisationId?: string | null,
  ): Promise<OwnerContext> {
    if (!organisationId) {
      return { user_id: userId };
    }

    const member = await this.prisma.organisationMember.findUnique({
      where: {
        organisation_id_user_id: {
          organisation_id: organisationId,
          user_id: userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this organisation');
    }

    return { organisation_id: organisationId, role: member.role };
  }

  // Personal-account contexts always pass — role restrictions only apply
  // inside an Organisation workspace.
  assertRole(context: OwnerContext, allowed: OrganisationRole[]) {
    if (!context.organisation_id) return;

    if (!context.role || !allowed.includes(context.role)) {
      throw new ForbiddenException(
        'Insufficient organisation role for this action',
      );
    }
  }

  toWhere(context: OwnerContext): { user_id?: string; organisation_id?: string } {
    return context.organisation_id
      ? { organisation_id: context.organisation_id }
      : { user_id: context.user_id };
  }
}
