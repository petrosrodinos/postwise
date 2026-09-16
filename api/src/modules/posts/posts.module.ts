import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { AiContentAssistModule } from '@/shared/services/ai-content-assist/ai-content-assist.module';
import { TwitterIntegrationModule } from '@/integrations/social/twitter/twitter.module';
import { LinkedInIntegrationModule } from '@/integrations/social/linkedin/linkedin.module';
import { SanityIntegrationModule } from '@/integrations/cms/sanity/sanity.module';
import { OwnershipModule } from '@/shared/services/ownership/ownership.module';
import { EncryptionModule } from '@/shared/services/encryption/encryption.module';
import { ActivityLogsModule } from '@/modules/activity-logs/activity-logs.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [
    PrismaModule,
    AiContentAssistModule,
    TwitterIntegrationModule,
    LinkedInIntegrationModule,
    SanityIntegrationModule,
    OwnershipModule,
    EncryptionModule,
    ActivityLogsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
