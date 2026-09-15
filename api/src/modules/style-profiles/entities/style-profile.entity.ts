import { ApiProperty } from '@nestjs/swagger';
import { PostType } from 'generated/prisma';

export class StyleProfileEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false, nullable: true })
  user_id?: string | null;

  @ApiProperty({ required: false, nullable: true })
  organisation_id?: string | null;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: PostType })
  platform: PostType;

  @ApiProperty({ required: false, nullable: true })
  source_url?: string | null;

  @ApiProperty()
  posts_analyzed: number;

  @ApiProperty({ required: false, nullable: true })
  tone_score?: number | null;

  @ApiProperty({ required: false, nullable: true })
  structure_score?: number | null;

  @ApiProperty({ required: false, nullable: true })
  hooks_score?: number | null;

  @ApiProperty({ required: false, nullable: true })
  vocabulary_score?: number | null;

  @ApiProperty({ required: false, nullable: true })
  rhythm_score?: number | null;

  @ApiProperty({ required: false, nullable: true })
  tone_description?: string | null;

  @ApiProperty({ required: false, nullable: true })
  dominant_hook?: string | null;

  @ApiProperty({ type: [String] })
  vocabulary: string[];

  @ApiProperty({ type: [String] })
  pillars: string[];

  @ApiProperty({ required: false, nullable: true })
  last_analyzed_at?: Date | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
