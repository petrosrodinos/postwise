import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { GenerationRunsModule } from '@/modules/generation-runs/generation-runs.module';
import { PostsModule } from '@/modules/posts/posts.module';
import { ActivityLogsModule } from '@/modules/activity-logs/activity-logs.module';
import { AutomationsCronService } from './automations/automations.cron';
import { PostsPublisherCronService } from './posts/posts-publisher.cron';

@Module({
  imports: [PrismaModule, GenerationRunsModule, PostsModule, ActivityLogsModule],
  providers: [AutomationsCronService, PostsPublisherCronService],
})
export class BackgroundModule {}
