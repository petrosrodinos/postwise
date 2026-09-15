import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AttachStyleProfileDto {
  @ApiProperty()
  @IsString()
  style_profile_id: string;
}
