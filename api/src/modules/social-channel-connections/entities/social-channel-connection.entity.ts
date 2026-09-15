import { ApiProperty } from '@nestjs/swagger';
import { SocialChannel, SocialChannelConnectionStatus } from 'generated/prisma';

export class SocialChannelConnectionEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false, nullable: true })
  user_id?: string | null;

  @ApiProperty({ required: false, nullable: true })
  organisation_id?: string | null;

  @ApiProperty({ enum: SocialChannel })
  channel: SocialChannel;

  @ApiProperty({ enum: SocialChannelConnectionStatus })
  status: SocialChannelConnectionStatus;

  @ApiProperty()
  external_account_id: string;

  @ApiProperty({ required: false, nullable: true })
  external_account_name?: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
