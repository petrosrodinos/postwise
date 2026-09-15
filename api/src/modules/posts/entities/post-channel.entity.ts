import { ApiProperty } from '@nestjs/swagger';
import { PostChannelStatus } from 'generated/prisma';

export class PostChannelEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  post_id: string;

  @ApiProperty()
  channel_connection_id: string;

  @ApiProperty({ enum: PostChannelStatus })
  status: PostChannelStatus;

  @ApiProperty({ required: false, nullable: true })
  external_post_id?: string | null;

  @ApiProperty({ required: false, nullable: true })
  external_post_url?: string | null;

  @ApiProperty({ required: false, nullable: true })
  published_at?: Date | null;

  @ApiProperty({ required: false, nullable: true })
  failed_reason?: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
