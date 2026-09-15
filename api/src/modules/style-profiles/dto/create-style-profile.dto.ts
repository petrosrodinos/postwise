import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { PostType } from 'generated/prisma';

export class CreateStyleProfileDto {
  @ApiProperty({ description: 'Name of this style profile', example: 'My LinkedIn voice' })
  @IsString()
  name: string;

  @ApiProperty({ enum: PostType, example: PostType.LINKEDIN })
  @IsEnum(PostType)
  platform: PostType;

  @ApiProperty({ required: false, description: 'URL of the source profile/feed analyzed' })
  @IsOptional()
  @IsUrl()
  source_url?: string;

  @ApiProperty({ description: 'Organisation workspace that owns this profile' })
  @IsNotEmpty()
  @IsString()
  organisation_id: string;
}
