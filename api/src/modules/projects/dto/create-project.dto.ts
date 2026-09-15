import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PostType } from 'generated/prisma';

export class CreateProjectDto {
  @ApiProperty({ description: 'Project title', example: 'Q1 Product Launch' })
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: PostType, example: PostType.LINKEDIN })
  @IsEnum(PostType)
  platform: PostType;

  @ApiProperty({ type: [String], required: false, description: 'Content pillars/themes' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pillars?: string[];

  @ApiProperty({ type: [String], required: false, description: 'Freeform content ideas' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ideas?: string[];

  @ApiProperty({ type: [String], required: false, description: 'Instructions the AI should follow' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  instructions?: string[];

  @ApiProperty({
    required: false,
    description: 'Freeform directions to guide AI generation for this project',
  })
  @IsOptional()
  @IsString()
  ai_directions?: string;

  @ApiProperty({ description: 'Organisation workspace that owns this project' })
  @IsNotEmpty()
  @IsString()
  organisation_id: string;
}
