import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';
import { PostType } from 'generated/prisma';

export class CreatePostDto {
  @ApiProperty({ enum: PostType })
  @IsEnum(PostType)
  type: PostType;

  @ApiProperty({ description: 'Organisation workspace that owns this post' })
  @IsNotEmpty()
  @IsString()
  organisation_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  project_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  style_profile_id?: string;

  @ApiProperty({ required: false, description: 'Opening hook / short-form copy' })
  @IsOptional()
  @IsString()
  hook?: string;

  @ApiProperty({ required: false, description: 'Main body content' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiProperty({ required: false, description: 'Blog title (BLOG posts only)' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false, description: 'Blog excerpt (BLOG posts only)' })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({ required: false, description: 'Cover document id (BLOG posts only)' })
  @IsOptional()
  @IsString()
  cover_document_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  seo_title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  seo_description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateIf((o) => o.canonical_url !== '')
  @IsUrl()
  canonical_url?: string;

  @ApiProperty({ required: false, description: 'Arbitrary structured metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
