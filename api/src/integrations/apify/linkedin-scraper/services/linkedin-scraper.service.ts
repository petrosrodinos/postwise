import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { LinkedInScraperConfig } from '../config/linkedin-scraper.config';
import {
  ApifyRunInfo,
  ApifyRunResponse,
  LinkedInScrapedPost,
  LinkedInScraperInput,
} from '../interfaces/linkedin-scraper.interfaces';

type ApifyEndpoint = 'run-sync-get-dataset-items' | 'runs' | 'run-sync';

@Injectable()
export class LinkedInScraperService {
  private readonly logger = new Logger(LinkedInScraperService.name);

  constructor(private readonly config: LinkedInScraperConfig) {}

  /** Runs the actor, waits for completion, and returns the scraped posts directly. */
  async scrapeProfilePosts(
    input: LinkedInScraperInput,
  ): Promise<LinkedInScrapedPost[]> {
    return this.request<LinkedInScrapedPost[]>(
      'run-sync-get-dataset-items',
      input,
    );
  }

  /** Starts the actor asynchronously; use `getDatasetItems` with the returned dataset id once it finishes. */
  async runActor(input: LinkedInScraperInput): Promise<ApifyRunInfo> {
    const response = await this.request<ApifyRunResponse>('runs', input);
    return response.data;
  }

  /** Runs the actor, waits for completion, and returns the raw OUTPUT record from the key-value store. */
  async runActorSync(input: LinkedInScraperInput): Promise<unknown> {
    return this.request<unknown>('run-sync', input);
  }

  async getDatasetItems<T = LinkedInScrapedPost>(
    datasetId: string,
  ): Promise<T[]> {
    const token = this.requireToken();
    const url = `${this.config.getBaseUrl()}/datasets/${datasetId}/items`;

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `Apify dataset request failed with ${response.status}: ${body}`,
        );
      }

      return await response.json();
    } catch (error) {
      this.logger.error(
        `Failed to fetch Apify dataset items (${datasetId}): ${error.message}`,
      );
      throw new InternalServerErrorException(
        `Failed to fetch LinkedIn scraper results: ${error.message}`,
      );
    }
  }

  private async request<T>(
    endpoint: ApifyEndpoint,
    input: LinkedInScraperInput,
  ): Promise<T> {
    const token = this.requireToken();
    const url = `${this.config.getBaseUrl()}/acts/${this.config.getActorPath()}/${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `Apify actor request (${endpoint}) failed with ${response.status}: ${body}`,
        );
      }

      return await response.json();
    } catch (error) {
      this.logger.error(
        `Failed to run LinkedIn scraper actor (${endpoint}): ${error.message}`,
      );
      throw new InternalServerErrorException(
        `Failed to run LinkedIn scraper: ${error.message}`,
      );
    }
  }

  private requireToken(): string {
    const token = this.config.getToken();
    if (!token) {
      throw new InternalServerErrorException('APIFY_TOKEN is not configured');
    }
    return token;
  }
}
