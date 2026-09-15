import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { CreateJwtServiceModule } from '@/shared/utils/jwt/jwt.module';
import { ResendModule } from '@/integrations/notifications/resend/resend.module';
import { ActivityLogsModule } from '@/modules/activity-logs/activity-logs.module';
import { OrganisationsController } from './organisations.controller';
import { OrganisationsService } from './organisations.service';
import { OrganisationMembersController } from './organisation-members.controller';
import { OrganisationInvitationsController } from './organisation-invitations.controller';
import { OrganisationMembersService } from './organisation-members.service';

@Module({
  imports: [PrismaModule, CreateJwtServiceModule, ResendModule, ActivityLogsModule],
  controllers: [
    OrganisationsController,
    OrganisationMembersController,
    OrganisationInvitationsController,
  ],
  providers: [OrganisationsService, OrganisationMembersService],
  exports: [OrganisationsService],
})
export class OrganisationsModule {}
