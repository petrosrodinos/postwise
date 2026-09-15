import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateRssFeedDto } from './create-rss-feed.dto';

export class UpdateRssFeedDto extends PartialType(
  OmitType(CreateRssFeedDto, ['organisation_id'] as const),
) {}
