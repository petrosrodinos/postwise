import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { RssIntegrationModule } from '@/integrations/rss/rss.module';
import { OwnershipModule } from '@/shared/services/ownership/ownership.module';
import { RssFeedsController } from './rss-feeds.controller';
import { RssFeedsService } from './rss-feeds.service';

@Module({
  imports: [PrismaModule, RssIntegrationModule, OwnershipModule],
  controllers: [RssFeedsController],
  providers: [RssFeedsService],
  exports: [RssFeedsService],
})
export class RssFeedsModule {}
