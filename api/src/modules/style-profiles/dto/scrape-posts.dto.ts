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

export class ScrapePostsDto {
  @ApiProperty({
    required: false,
    description:
      "Profile/company URL to scrape, or the RSS feed URL for Blog profiles. Defaults to the style profile's stored source_url.",
  })
  @IsOptional()
  @IsUrl()
  source_url?: string;

  // LinkedIn-only fields (harvestapi/linkedin-profile-posts)
  @ApiProperty({
    required: false,
    description: 'LinkedIn/Blog: max posts to fetch. Default 20.',
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
    description: 'LinkedIn: fetch posts no older than this window.',
  })
  @IsOptional()
  @IsIn(POSTED_LIMIT_OPTIONS)
  posted_limit?: PostedLimit;

  @ApiProperty({
    required: false,
    description: 'LinkedIn: include reposts (shared posts without comments).',
  })
  @IsOptional()
  @IsBoolean()
  include_reposts?: boolean;

  @ApiProperty({
    required: false,
    description: 'LinkedIn: include quote posts (shared posts with comments).',
  })
  @IsOptional()
  @IsBoolean()
  include_quote_posts?: boolean;

  // Twitter/X-only fields (scraper_one/x-profile-posts-scraper)
  @ApiProperty({
    required: false,
    description: 'Twitter/X: max posts to scrape. Default 30.',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  results_limit?: number;

  @ApiProperty({
    required: false,
    description: 'Twitter/X: skip pinned posts.',
  })
  @IsOptional()
  @IsBoolean()
  skip_pinned_posts?: boolean;
}
