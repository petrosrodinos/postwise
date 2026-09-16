import { ApiProperty } from '@nestjs/swagger';
import { PostType } from 'generated/prisma';

export class ProjectEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organisation_id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty({ enum: PostType })
  platform: PostType;

  @ApiProperty({ enum: PostType, isArray: true })
  channels: PostType[];

  @ApiProperty({ type: [String] })
  pillars: string[];

  @ApiProperty({ type: [String] })
  ideas: string[];

  @ApiProperty({ type: [String] })
  instructions: string[];

  @ApiProperty({ required: false, nullable: true })
  ai_directions?: string | null;

  @ApiProperty()
  is_archived: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty({
    required: false,
    description:
      'Count of posts by status, keyed by PostStatus (list/detail responses only)',
  })
  post_status_counts?: Record<string, number>;
}
