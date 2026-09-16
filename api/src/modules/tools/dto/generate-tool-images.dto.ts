import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const IMAGE_SIZES = ['1024x1024', '1024x1536', '1536x1024'] as const;

export class GenerateToolImagesDto {
  @ApiProperty({ description: 'Organisation workspace to run this tool under' })
  @IsNotEmpty()
  @IsString()
  organisation_id: string;

  @ApiProperty({
    required: false,
    description: 'Override the auto-built prompt derived from the title/body',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  prompt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiProperty({ default: 1, minimum: 1, maximum: 4 })
  @IsInt()
  @Min(1)
  @Max(4)
  count: number;

  @ApiProperty({ required: false, enum: IMAGE_SIZES })
  @IsOptional()
  @IsIn(IMAGE_SIZES)
  size?: (typeof IMAGE_SIZES)[number];
}
