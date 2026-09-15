import { ApiProperty } from '@nestjs/swagger';
import { PostStatus, PostType } from 'generated/prisma';

export class PostEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty({ required: false, nullable: true })
  organisation_id?: string | null;

  @ApiProperty({ required: false, nullable: true })
  project_id?: string | null;

  @ApiProperty({ required: false, nullable: true })
  style_profile_id?: string | null;

  @ApiProperty({ required: false, nullable: true })
  generation_run_id?: string | null;

  @ApiProperty({ required: false, nullable: true })
  source_post_id?: string | null;

  @ApiProperty({ enum: PostType })
  type: PostType;

  @ApiProperty({ enum: PostStatus })
  status: PostStatus;

  @ApiProperty({ required: false, nullable: true })
  hook?: string | null;

  @ApiProperty({ required: false, nullable: true })
  body?: string | null;

  @ApiProperty({ required: false, nullable: true })
  title?: string | null;

  @ApiProperty({ required: false, nullable: true })
  excerpt?: string | null;

  @ApiProperty({ required: false, nullable: true })
  cover_document_id?: string | null;

  @ApiProperty({ required: false, nullable: true })
  seo_title?: string | null;

  @ApiProperty({ required: false, nullable: true })
  seo_description?: string | null;

  @ApiProperty({ required: false, nullable: true })
  canonical_url?: string | null;

  @ApiProperty({ required: false, nullable: true })
  scheduled_at?: Date | null;

  @ApiProperty({ required: false, nullable: true })
  published_at?: Date | null;

  @ApiProperty({ required: false, nullable: true })
  failed_reason?: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
