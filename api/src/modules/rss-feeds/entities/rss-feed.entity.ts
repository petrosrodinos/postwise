import { ApiProperty } from '@nestjs/swagger';

export class RssFeedEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organisation_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  url: string;

  @ApiProperty({ required: false, nullable: true })
  last_fetched_at?: Date | null;

  @ApiProperty({ required: false, nullable: true })
  last_fetch_error?: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
