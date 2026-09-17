import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { AiIntegrationModule } from '@/integrations/ai/ai.module';
import { LinkedInScraperModule } from '@/integrations/apify/linkedin-scraper/linkedin-scraper.module';
import { TwitterScraperModule } from '@/integrations/apify/twitter-scraper/twitter-scraper.module';
import { RssIntegrationModule } from '@/integrations/rss/rss.module';
import { OwnershipModule } from '@/shared/services/ownership/ownership.module';
import { ActivityLogsModule } from '@/modules/activity-logs/activity-logs.module';
import { StyleProfilesController } from './style-profiles.controller';
import { StyleProfilesService } from './style-profiles.service';

@Module({
  imports: [
    PrismaModule,
    AiIntegrationModule,
    LinkedInScraperModule,
    TwitterScraperModule,
    RssIntegrationModule,
    OwnershipModule,
    ActivityLogsModule,
  ],
  controllers: [StyleProfilesController],
  providers: [StyleProfilesService],
  exports: [StyleProfilesService],
})
export class StyleProfilesModule {}
