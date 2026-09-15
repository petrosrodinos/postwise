import { ApiProperty } from '@nestjs/swagger';
import { PostType } from 'generated/prisma';

export class ProjectEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false, nullable: true })
  user_id?: string | null;

  @ApiProperty({ required: false, nullable: true })
  organisation_id?: string | null;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty({ enum: PostType })
  platform: PostType;

  @ApiProperty({ type: [String] })
  pillars: string[];

  @ApiProperty({ type: [String] })
  ideas: string[];

  @ApiProperty({ type: [String] })
  instructions: string[];

  @ApiProperty()
  is_archived: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty({
    required: false,
    description: 'Count of posts by status, keyed by PostStatus (list/detail responses only)',
  })
  post_status_counts?: Record<string, number>;
}
