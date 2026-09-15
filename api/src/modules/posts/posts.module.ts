import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { AiIntegrationModule } from '@/integrations/ai/ai.module';
import { TwitterIntegrationModule } from '@/integrations/social/twitter/twitter.module';
import { LinkedInIntegrationModule } from '@/integrations/social/linkedin/linkedin.module';
import { OwnershipModule } from '@/shared/services/ownership/ownership.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [
    PrismaModule,
    AiIntegrationModule,
    TwitterIntegrationModule,
    LinkedInIntegrationModule,
    OwnershipModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
