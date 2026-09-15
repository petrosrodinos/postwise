import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export const POSTED_LIMIT_OPTIONS = [
  'any',
  '1h',
  '24h',
  'week',
  'month',
  '3months',
  '6months',
  'year',
] as const;

export type PostedLimit = (typeof POSTED_LIMIT_OPTIONS)[number];

export class ScrapeLinkedInPostsDto {
  @ApiProperty({
    required: false,
    description:
      "LinkedIn profile/company URL to scrape. Defaults to the style profile's stored source_url.",
  })
  @IsOptional()
  @IsUrl()
  source_url?: string;

  @ApiProperty({
    required: false,
    description: 'Max posts to scrape. Default 20.',
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  max_posts?: number;

  @ApiProperty({
    required: false,
    enum: POSTED_LIMIT_OPTIONS,
    description: 'Fetch posts no older than this window.',
  })
  @IsOptional()
  @IsIn(POSTED_LIMIT_OPTIONS)
  posted_limit?: PostedLimit;

  @ApiProperty({
    required: false,
    description: 'Include reposts (shared posts without comments).',
  })
  @IsOptional()
  @IsBoolean()
  include_reposts?: boolean;

  @ApiProperty({
    required: false,
    description: 'Include quote posts (shared posts with comments).',
  })
  @IsOptional()
  @IsBoolean()
  include_quote_posts?: boolean;
}
