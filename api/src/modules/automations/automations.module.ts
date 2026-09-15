import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { ProjectsModule } from '@/modules/projects/projects.module';
import { OwnershipModule } from '@/shared/services/ownership/ownership.module';
import { ActivityLogsModule } from '@/modules/activity-logs/activity-logs.module';
import { AutomationsController } from './automations.controller';
import { AutomationsService } from './automations.service';

@Module({
  imports: [PrismaModule, ProjectsModule, OwnershipModule, ActivityLogsModule],
  controllers: [AutomationsController],
  providers: [AutomationsService],
  exports: [AutomationsService],
})
export class AutomationsModule {}
