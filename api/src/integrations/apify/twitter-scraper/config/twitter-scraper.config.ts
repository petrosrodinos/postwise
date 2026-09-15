import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwitterScraperConfig {
  private readonly logger = new Logger(TwitterScraperConfig.name);
  private readonly baseUrl = 'https://api.apify.com/v2';
  private readonly defaultActorId = 'scraper_one/x-profile-posts-scraper';

  constructor(private readonly configService: ConfigService) {
    if (!this.getToken()) {
      this.logger.warn(
        'APIFY_TOKEN is not configured; Twitter scraping will fail',
      );
    }
  }

  getToken(): string | undefined {
    return this.configService.get<string>('APIFY_TOKEN');
  }

  getActorId(): string {
    return (
      this.configService.get<string>('APIFY_TWITTER_ACTOR_ID') ||
      this.defaultActorId
    );
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getActorPath(): string {
    return this.getActorId().replace('/', '~');
  }
}
