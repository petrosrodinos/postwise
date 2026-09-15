import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { GENERATION_LANGUAGE_CODES } from '../constants/languages.constant';

export class CreateGenerationRunDto {
  @ApiProperty({ description: 'Project to generate drafts for' })
  @IsString()
  project_id: string;

  @ApiProperty({
    required: false,
    description: 'Style profile to steer the AI drafting. Defaults to the first profile attached to the project.',
  })
  @IsOptional()
  @IsString()
  style_profile_id?: string;

  @ApiProperty({ required: false, minimum: 1, maximum: 10, default: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  posts_requested?: number;

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
}
