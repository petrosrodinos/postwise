import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TwitterScraperConfig } from './config/twitter-scraper.config';
import { TwitterScraperService } from './services/twitter-scraper.service';

@Module({
  imports: [ConfigModule],
  providers: [TwitterScraperConfig, TwitterScraperService],
  exports: [TwitterScraperService],
})
export class TwitterScraperModule {}
