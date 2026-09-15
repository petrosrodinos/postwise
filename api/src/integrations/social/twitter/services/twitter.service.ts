import { Injectable, Logger } from '@nestjs/common';
import { TwitterApi } from 'twitter-api-v2';
import { PublishTweetRequest, PublishTweetResponse } from '../interfaces/twitter.interfaces';

@Injectable()
export class TwitterService {
  private readonly logger = new Logger(TwitterService.name);

  async publishTweet(request: PublishTweetRequest): Promise<PublishTweetResponse> {
    try {
      const client = new TwitterApi(request.accessToken);
      const { data } = await client.v2.tweet(request.text);

      return {
        external_post_id: data.id,
        external_post_url: `https://x.com/i/web/status/${data.id}`,
      };
    } catch (error) {
      this.logger.error(`Failed to publish tweet: ${error.message}`);
      throw new Error(`Failed to publish tweet: ${error.message}`);
    }
  }
}
