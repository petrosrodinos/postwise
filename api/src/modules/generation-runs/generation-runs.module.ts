import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { AiIntegrationModule } from '@/integrations/ai/ai.module';
import { ProjectsModule } from '@/modules/projects/projects.module';
import { DocumentsModule } from '@/modules/documents/documents.module';
import { RssFeedsModule } from '@/modules/rss-feeds/rss-feeds.module';
import { GenerationRunsController } from './generation-runs.controller';
import { GenerationRunsService } from './generation-runs.service';

@Module({
  imports: [PrismaModule, AiIntegrationModule, ProjectsModule, DocumentsModule, RssFeedsModule],
  controllers: [GenerationRunsController],
  providers: [GenerationRunsService],
  exports: [GenerationRunsService],
})
export class GenerationRunsModule {}
