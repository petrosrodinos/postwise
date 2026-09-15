import { Injectable, Logger } from '@nestjs/common';
import {
  PublishLinkedInPostRequest,
  PublishLinkedInPostResponse,
} from '../interfaces/linkedin.interfaces';

@Injectable()
export class LinkedInService {
  private readonly logger = new Logger(LinkedInService.name);

  async publishPost(request: PublishLinkedInPostRequest): Promise<PublishLinkedInPostResponse> {
    try {
      const author = request.authorUrn.startsWith('urn:li:')
        ? request.authorUrn
        : `urn:li:person:${request.authorUrn}`;

      const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${request.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          author,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: request.text },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
          },
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`LinkedIn API responded with ${response.status}: ${body}`);
      }

      const postId = response.headers.get('x-restli-id') ?? (await response.json())?.id;

      return {
        external_post_id: postId,
        external_post_url: `https://www.linkedin.com/feed/update/${postId}/`,
      };
    } catch (error) {
      this.logger.error(`Failed to publish LinkedIn post: ${error.message}`);
      throw new Error(`Failed to publish LinkedIn post: ${error.message}`);
    }
  }
}
