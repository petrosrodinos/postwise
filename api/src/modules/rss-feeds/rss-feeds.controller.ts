import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { RssFeedsService } from './rss-feeds.service';
import { CreateRssFeedDto } from './dto/create-rss-feed.dto';
import { UpdateRssFeedDto } from './dto/update-rss-feed.dto';
import { FetchRssItemsDto } from './dto/fetch-rss-items.dto';
import { RssFeedsQuerySchema, RssFeedsQueryType } from './dto/rss-feeds-query.schema';
import { RssFeedItemsQuerySchema, RssFeedItemsQueryType } from './dto/rss-feed-items-query.schema';
import { RssFeedEntity } from './entities/rss-feed.entity';

@ApiTags('rss-feeds')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('rss-feeds')
export class RssFeedsController {
  constructor(private readonly rssFeedsService: RssFeedsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a blog RSS feed source' })
  @ApiResponse({ status: 201, type: RssFeedEntity })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateRssFeedDto) {
    return this.rssFeedsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List RSS feeds' })
  @ApiQuery({ name: 'organisation_id', required: true })
  @ApiResponse({ status: 200 })
  findAll(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(RssFeedsQuerySchema)) query: RssFeedsQueryType,
  ) {
    return this.rssFeedsService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an RSS feed' })
  @ApiResponse({ status: 200, type: RssFeedEntity })
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.rssFeedsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an RSS feed' })
  @ApiResponse({ status: 200, type: RssFeedEntity })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRssFeedDto,
  ) {
    return this.rssFeedsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an RSS feed' })
  @ApiResponse({ status: 200 })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.rssFeedsService.remove(userId, id);
  }

  @Post(':id/fetch-items')
  @ApiOperation({ summary: 'Fetch the feed now and return items matching the given filters' })
  @ApiResponse({ status: 200 })
  fetchItems(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: FetchRssItemsDto,
  ) {
    return this.rssFeedsService.fetchItems(userId, id, dto);
  }

  @Get(':id/items')
  @ApiOperation({ summary: 'List previously fetched items for a feed, without re-fetching' })
  @ApiResponse({ status: 200 })
  async listItems(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Query(new ZodValidationPipe(RssFeedItemsQuerySchema)) query: RssFeedItemsQueryType,
  ) {
    await this.rssFeedsService.findOwned(userId, id);
    return this.rssFeedsService.listItems(id, query);
  }
}
