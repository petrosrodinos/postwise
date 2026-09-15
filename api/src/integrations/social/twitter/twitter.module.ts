import { Module } from '@nestjs/common';
import { TwitterService } from './services/twitter.service';

@Module({
  providers: [TwitterService],
  exports: [TwitterService],
})
export class TwitterIntegrationModule {}
