import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LinkedInScraperConfig } from './config/linkedin-scraper.config';
import { LinkedInScraperService } from './services/linkedin-scraper.service';

@Module({
  imports: [ConfigModule],
  providers: [LinkedInScraperConfig, LinkedInScraperService],
  exports: [LinkedInScraperService],
})
export class LinkedInScraperModule {}
