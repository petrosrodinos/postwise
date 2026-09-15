import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { OrganisationRole } from 'generated/prisma';
import { OwnerContext } from './ownership.interface';

@Injectable()
export class OwnershipService {
  constructor(private readonly prisma: PrismaService) {}

  // Verifies the user is a member of the organisation and returns their role.
  async resolveContext(userId: string, organisationId: string): Promise<OwnerContext> {
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

  assertRole(context: OwnerContext, allowed: OrganisationRole[]) {
    if (!allowed.includes(context.role)) {
      throw new ForbiddenException(
        'Insufficient organisation role for this action',
      );
    }
  }

  toWhere(context: OwnerContext): { organisation_id: string } {
    return { organisation_id: context.organisation_id };
  }
}
