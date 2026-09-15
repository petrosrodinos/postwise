import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import * as Parser from 'rss-parser';
import { ParsedFeedItem } from '../interfaces/rss.interfaces';

@Injectable()
export class RssService {
  private readonly logger = new Logger(RssService.name);
  private readonly parser = new Parser({ timeout: 15000 });

  async parseFeed(url: string): Promise<ParsedFeedItem[]> {
    try {
      const feed = await this.parser.parseURL(url);
      return (feed.items ?? []).map((item) => this.normalize(item));
    } catch (error) {
      this.logger.error(`Failed to fetch/parse RSS feed (${url}): ${error.message}`);
      throw new InternalServerErrorException(`Failed to fetch RSS feed: ${error.message}`);
    }
  }

  private normalize(item: Parser.Item): ParsedFeedItem {
    const title = item.title?.trim() || 'Untitled';
    const publishedAt = this.parseDate(item.isoDate ?? item.pubDate);

    return {
      guid: item.guid?.trim() || this.fallbackGuid(item.link, title, item.pubDate),
      title,
      link: item.link,
      summary: item.summary ?? item.contentSnippet,
      content: item.content,
      published_at: publishedAt,
    };
  }

  private parseDate(value?: string): Date | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  }

  // Not every feed reliably sets <guid> — fall back to a deterministic hash
  // of the link (or title+pubDate) so the same item dedupes across re-fetches
  // instead of creating duplicate RssFeedItem rows every time.
  private fallbackGuid(link?: string, title?: string, pubDate?: string): string {
    const basis = link || `${title ?? ''}:${pubDate ?? ''}`;
    return createHash('sha1').update(basis).digest('hex');
  }
}
