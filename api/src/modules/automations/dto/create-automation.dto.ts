import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { AutomationFrequency, AutomationOutputStage } from 'generated/prisma';

export class CreateAutomationDto {
  @ApiProperty({ description: 'Project this automation generates content for' })
  @IsString()
  project_id: string;

  @ApiProperty({ required: false, description: 'Style profile to steer generation' })
  @IsOptional()
  @IsString()
  style_profile_id?: string;

  @ApiProperty({
    required: false,
    description: 'RSS feed (must already be attached to the project) to pull new items from each run',
  })
  @IsOptional()
  @IsString()
  rss_feed_id?: string;

  @ApiProperty({ description: 'Name of the automation', example: 'Weekly LinkedIn drafts' })
  @IsString()
  name: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ enum: AutomationFrequency, default: AutomationFrequency.WEEKLY })
  @IsEnum(AutomationFrequency)
  frequency: AutomationFrequency;

  @ApiProperty({
    type: [Number],
    required: false,
    description: 'Days of week (0=Sunday..6=Saturday), used when frequency is WEEKLY',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  days_of_week?: number[];

  @ApiProperty({ description: 'Time of day to run, 24h HH:mm', example: '09:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'time_of_day must be in HH:mm format' })
  time_of_day: string;

  @ApiProperty({ required: false, default: 'UTC', description: 'IANA timezone' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ required: false, default: 1, minimum: 1, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  posts_per_run?: number;

  @ApiProperty({ enum: AutomationOutputStage, default: AutomationOutputStage.DRAFT })
  @IsOptional()
  @IsEnum(AutomationOutputStage)
  output_stage?: AutomationOutputStage;

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
