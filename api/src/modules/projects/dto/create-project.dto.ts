import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PostType, SocialChannel } from 'generated/prisma';

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

  @ApiProperty({
    enum: SocialChannel,
    isArray: true,
    required: false,
    description:
      'Target social channels to generate/publish for (ignored for BLOG projects). Defaults to [platform] when omitted.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(SocialChannel, { each: true })
  channels?: SocialChannel[];

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
