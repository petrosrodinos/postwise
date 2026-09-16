import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { AiContentAssistModule } from '@/shared/services/ai-content-assist/ai-content-assist.module';
import { TwitterIntegrationModule } from '@/integrations/social/twitter/twitter.module';
import { LinkedInIntegrationModule } from '@/integrations/social/linkedin/linkedin.module';
import { OwnershipModule } from '@/shared/services/ownership/ownership.module';
import { ActivityLogsModule } from '@/modules/activity-logs/activity-logs.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [
    PrismaModule,
    AiContentAssistModule,
    TwitterIntegrationModule,
    LinkedInIntegrationModule,
    OwnershipModule,
    ActivityLogsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
