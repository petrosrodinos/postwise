import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddPostChannelDto {
  @ApiProperty()
  @IsString()
  channel_connection_id: string;
}
