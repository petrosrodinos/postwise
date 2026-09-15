import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { OrganisationsController } from './organisations.controller';
import { OrganisationsService } from './organisations.service';
import { OrganisationMembersController } from './organisation-members.controller';
import { OrganisationMembersService } from './organisation-members.service';

@Module({
  imports: [PrismaModule],
  controllers: [OrganisationsController, OrganisationMembersController],
  providers: [OrganisationsService, OrganisationMembersService],
  exports: [OrganisationsService],
})
export class OrganisationsModule {}
