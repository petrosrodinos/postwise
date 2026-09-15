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

    // rss-parser has an easy-to-miss quirk: `<content:encoded>` (the full
    // article body many blog feeds provide) is NOT copied onto `item.content`
    // — it's stashed under the literal key `content:encoded`. `item.content`
    // is always just the `<description>` excerpt instead, even when a fuller
    // body is also present. Read the encoded field explicitly so feeds that
    // provide it aren't silently downgraded to their short excerpt.
    const encodedContent = (item as unknown as Record<string, string | undefined>)['content:encoded'];

    return {
      guid: item.guid?.trim() || this.fallbackGuid(item.link, title, item.pubDate),
      title,
      link: item.link,
      summary: (item.summary ?? item.contentSnippet)?.trim(),
      content: (encodedContent ?? item.content)?.trim(),
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
