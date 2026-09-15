import { Module } from '@nestjs/common';
import { RssService } from './services/rss.service';

@Module({
  providers: [RssService],
  exports: [RssService],
})
export class RssIntegrationModule {}
