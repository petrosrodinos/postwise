import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { TwitterScraperConfig } from '../config/twitter-scraper.config';
import {
  ApifyRunInfo,
  ApifyRunResponse,
  TwitterScrapedPost,
  TwitterScraperInput,
} from '../interfaces/twitter-scraper.interfaces';

type ApifyEndpoint = 'run-sync-get-dataset-items' | 'runs' | 'run-sync';

@Injectable()
export class TwitterScraperService {
  private readonly logger = new Logger(TwitterScraperService.name);

  constructor(private readonly config: TwitterScraperConfig) {}

  /** Runs the actor, waits for completion, and returns the scraped posts directly. */
  async scrapeProfilePosts(
    input: TwitterScraperInput,
  ): Promise<TwitterScrapedPost[]> {
    return this.request<TwitterScrapedPost[]>(
      'run-sync-get-dataset-items',
      input,
    );
  }

  /** Starts the actor asynchronously; use `getDatasetItems` with the returned dataset id once it finishes. */
  async runActor(input: TwitterScraperInput): Promise<ApifyRunInfo> {
    const response = await this.request<ApifyRunResponse>('runs', input);
    return response.data;
  }

  /** Runs the actor, waits for completion, and returns the raw OUTPUT record from the key-value store. */
  async runActorSync(input: TwitterScraperInput): Promise<unknown> {
    return this.request<unknown>('run-sync', input);
  }

  async getDatasetItems<T = TwitterScrapedPost>(
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
        `Failed to fetch Twitter scraper results: ${error.message}`,
      );
    }
  }

  private async request<T>(
    endpoint: ApifyEndpoint,
    input: TwitterScraperInput,
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
        `Failed to run Twitter scraper actor (${endpoint}): ${error.message}`,
      );
      throw new InternalServerErrorException(
        `Failed to run Twitter scraper: ${error.message}`,
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
