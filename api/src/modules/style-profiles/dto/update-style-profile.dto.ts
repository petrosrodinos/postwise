import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { CreateStyleProfileDto } from './create-style-profile.dto';

export class UpdateStyleProfileDto extends PartialType(
  OmitType(CreateStyleProfileDto, ['organisation_id'] as const),
) {
  @ApiProperty({ required: false, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tone_score?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  structure_score?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  hooks_score?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  vocabulary_score?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  rhythm_score?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tone_description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dominant_hook?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vocabulary?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pillars?: string[];
}
