import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PostType } from 'generated/prisma';

export class GenerateProjectDetailsStyleProfileDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: PostType })
  @IsEnum(PostType)
  platform: PostType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tone_description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dominant_hook?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vocabulary?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pillars?: string[];
}

export class GenerateProjectDetailsDto {
  @ApiProperty({ description: 'Working project title', example: 'Q1 Product Launch' })
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: PostType,
    isArray: true,
    required: false,
    description: 'Content channels this project generates for',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PostType, { each: true })
  channels?: PostType[];

  @ApiProperty({
    required: false,
    description: 'Freeform directions to guide the AI while planning this content strategy',
  })
  @IsOptional()
  @IsString()
  ai_directions?: string;

  @ApiProperty({
    type: [String],
    required: false,
    description: 'Content pillars already set on the project, to build on rather than repeat',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pillars?: string[];

  @ApiProperty({
    type: [String],
    required: false,
    description: 'Content ideas already set on the project, to build on rather than repeat',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ideas?: string[];

  @ApiProperty({
    type: [String],
    required: false,
    description: 'Instructions already set on the project, to build on rather than repeat',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  instructions?: string[];

  @ApiProperty({
    type: [GenerateProjectDetailsStyleProfileDto],
    required: false,
    description: 'Style profiles attached to the project, describing the voice to plan for',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GenerateProjectDetailsStyleProfileDto)
  style_profiles?: GenerateProjectDetailsStyleProfileDto[];
}
