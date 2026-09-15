import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { GENERATION_LANGUAGE_CODES } from '../constants/languages.constant';

export class CreateRssGenerationRunDto {
  @ApiProperty({ description: 'Project to generate blog posts for' })
  @IsString()
  project_id: string;

  @ApiProperty({ type: [String], description: 'RssFeedItem ids selected for generation' })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  rss_feed_item_ids: string[];

  @ApiProperty({
    required: false,
    description: 'Style profile to steer the AI drafting. Defaults to the first profile attached to the project.',
  })
  @IsOptional()
  @IsString()
  style_profile_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({
    required: false,
    enum: GENERATION_LANGUAGE_CODES,
    default: 'en',
    description: 'Language the drafts should be written in',
  })
  @IsOptional()
  @IsIn(GENERATION_LANGUAGE_CODES)
  language?: string;

  @ApiProperty({ required: false, default: false, description: 'Generate AI cover image candidates for each post' })
  @IsOptional()
  @IsBoolean()
  generate_images?: boolean;

  @ApiProperty({ required: false, minimum: 1, maximum: 4, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  image_count?: number;
}
