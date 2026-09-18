import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { OwnershipModule } from '@/shared/services/ownership/ownership.module';
import { AiIntegrationModule } from '@/integrations/ai/ai.module';
import { ActivityLogsModule } from '@/modules/activity-logs/activity-logs.module';
import { GcsIntegrationModule } from '@/integrations/storage/gcs/gcs.module';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [
    PrismaModule,
    OwnershipModule,
    AiIntegrationModule,
    ActivityLogsModule,
    GcsIntegrationModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
