import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AttachRssFeedDto {
  @ApiProperty()
  @IsString()
  rss_feed_id: string;
}
