import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LinkedInScraperConfig {
  private readonly logger = new Logger(LinkedInScraperConfig.name);
  private readonly baseUrl = 'https://api.apify.com/v2';
  private readonly defaultActorId = 'harvestapi/linkedin-profile-posts';

  constructor(private readonly configService: ConfigService) {
    if (!this.getToken()) {
      this.logger.warn(
        'APIFY_TOKEN is not configured; LinkedIn scraping will fail',
      );
    }
  }

  getToken(): string | undefined {
    return this.configService.get<string>('APIFY_TOKEN');
  }

  getActorId(): string {
    return (
      this.configService.get<string>('APIFY_LINKEDIN_ACTOR_ID') ||
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
