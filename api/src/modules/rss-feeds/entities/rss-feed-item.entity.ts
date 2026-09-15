import { ApiProperty } from '@nestjs/swagger';

export class RssFeedItemEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  rss_feed_id: string;

  @ApiProperty()
  guid: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false, nullable: true })
  link?: string | null;

  @ApiProperty({ required: false, nullable: true })
  summary?: string | null;

  @ApiProperty({ required: false, nullable: true })
  content?: string | null;

  @ApiProperty({ required: false, nullable: true })
  published_at?: Date | null;

  @ApiProperty()
  is_used: boolean;

  @ApiProperty()
  fetched_at: Date;
}
