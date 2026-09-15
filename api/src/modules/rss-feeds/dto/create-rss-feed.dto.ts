import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateRssFeedDto {
  @ApiProperty({ description: 'Name of this feed', example: 'Company blog' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'RSS/Atom feed URL' })
  @IsUrl()
  url: string;

  @ApiProperty({ description: 'Organisation workspace that owns this feed' })
  @IsNotEmpty()
  @IsString()
  organisation_id: string;
}
