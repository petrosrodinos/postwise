import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { RssService } from '@/integrations/rss/services/rss.service';
import { OwnershipService } from '@/shared/services/ownership/ownership.service';
import { paginate, paginationMeta } from '@/shared/schemas/pagination.schema';
import { OrganisationRole } from 'generated/prisma';
import { CreateRssFeedDto } from './dto/create-rss-feed.dto';
import { UpdateRssFeedDto } from './dto/update-rss-feed.dto';
import { FetchRssItemsDto } from './dto/fetch-rss-items.dto';
import { RssFeedItemsQueryType } from './dto/rss-feed-items-query.schema';
import { RssFeedsQueryType } from './dto/rss-feeds-query.schema';

const MANAGE_ROLES: OrganisationRole[] = [OrganisationRole.OWNER, OrganisationRole.ADMIN];

@Injectable()
export class RssFeedsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rssService: RssService,
    private readonly ownershipService: OwnershipService,
  ) {}

  private async assertManage(userId: string, feed: { organisation_id: string }) {
    const context = await this.ownershipService.resolveContext(userId, feed.organisation_id);
    this.ownershipService.assertRole(context, MANAGE_ROLES);
  }

  async create(userId: string, dto: CreateRssFeedDto) {
    const context = await this.ownershipService.resolveContext(userId, dto.organisation_id);
    this.ownershipService.assertRole(context, MANAGE_ROLES);

    return this.prisma.rssFeed.create({
      data: {
        organisation_id: context.organisation_id,
        name: dto.name,
        url: dto.url,
      },
    });
  }

  async findAll(userId: string, query: RssFeedsQueryType) {
    await this.ownershipService.resolveContext(userId, query.organisation_id);

    const where = { organisation_id: query.organisation_id };
    const { skip, take } = paginate(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.rssFeed.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.rssFeed.count({ where }),
    ]);

    return { data, pagination: paginationMeta(total, query.page, query.limit) };
  }

  async findOwned(userId: string, id: string) {
    const feed = await this.prisma.rssFeed.findUnique({ where: { id } });
    if (!feed) throw new NotFoundException('RSS feed not found');

    await this.ownershipService.resolveContext(userId, feed.organisation_id);

    return feed;
  }

  async findOne(userId: string, id: string) {
    return this.findOwned(userId, id);
  }

  async update(userId: string, id: string, dto: UpdateRssFeedDto) {
    const feed = await this.findOwned(userId, id);
    await this.assertManage(userId, feed);

    return this.prisma.rssFeed.update({
      where: { id },
      data: { name: dto.name, url: dto.url },
    });
  }

  async remove(userId: string, id: string) {
    const feed = await this.findOwned(userId, id);
    await this.assertManage(userId, feed);

    await this.prisma.rssFeed.delete({ where: { id } });
    return { message: 'RSS feed deleted successfully' };
  }

  // Fetches the feed, upserts every item by [rss_feed_id, guid] so re-fetches
  // stay idempotent, then returns the persisted items matching the filters.
  async fetchItems(userId: string, id: string, dto: FetchRssItemsDto) {
    const feed = await this.findOwned(userId, id);
    await this.assertManage(userId, feed);

    return this.refreshAndListItems(feed.id, feed.url, dto);
  }

  // Same as fetchItems but without the ownership check — used internally by
  // the automations cron, which has already validated the automation itself.
  async refreshAndListItems(
    feedId: string,
    feedUrl: string,
    filters: { limit?: number; since?: string; unused_only?: boolean },
  ) {
    try {
      const items = await this.rssService.parseFeed(feedUrl);

      await this.prisma.$transaction(
        items.map((item) =>
          this.prisma.rssFeedItem.upsert({
            where: { rss_feed_id_guid: { rss_feed_id: feedId, guid: item.guid } },
            create: {
              rss_feed_id: feedId,
              guid: item.guid,
              title: item.title,
              link: item.link,
              summary: item.summary,
              content: item.content,
              published_at: item.published_at,
            },
            update: {
              title: item.title,
              link: item.link,
              summary: item.summary,
              content: item.content,
              published_at: item.published_at,
            },
          }),
        ),
      );

      await this.prisma.rssFeed.update({
        where: { id: feedId },
        data: { last_fetched_at: new Date(), last_fetch_error: null },
      });
    } catch (error) {
      await this.prisma.rssFeed
        .update({
          where: { id: feedId },
          data: { last_fetched_at: new Date(), last_fetch_error: error.message },
        })
        .catch(() => undefined);
      throw error;
    }

    return this.listItems(feedId, {
      limit: filters.limit ?? 20,
      since: filters.since,
      unused_only: filters.unused_only ?? true,
    });
  }

  async listItems(feedId: string, query: RssFeedItemsQueryType) {
    return this.prisma.rssFeedItem.findMany({
      where: {
        rss_feed_id: feedId,
        ...(query.unused_only && { is_used: false }),
        ...(query.since && { published_at: { gte: new Date(query.since) } }),
      },
      orderBy: { published_at: 'desc' },
      take: query.limit,
    });
  }
}
