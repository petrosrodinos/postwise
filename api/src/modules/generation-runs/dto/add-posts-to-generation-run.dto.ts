import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { GENERATION_LANGUAGE_CODES } from '../constants/languages.constant';

export class AddPostsToGenerationRunDto {
  @ApiProperty({ required: false, minimum: 1, maximum: 10, default: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  posts_requested?: number;

  @ApiProperty({
    required: false,
    enum: GENERATION_LANGUAGE_CODES,
    description: 'Defaults to the language the run was created with',
  })
  @IsOptional()
  @IsIn(GENERATION_LANGUAGE_CODES)
  language?: string;

  @ApiProperty({
    required: false,
    default: false,
    description: 'Generate AI cover image candidates for each post',
  })
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
