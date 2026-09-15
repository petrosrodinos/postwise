import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SocialChannelConnectionStatus } from 'generated/prisma';
import { CreateSocialChannelConnectionDto } from './create-social-channel-connection.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateSocialChannelConnectionDto extends PartialType(
  OmitType(CreateSocialChannelConnectionDto, ['channel', 'organisation_id'] as const),
) {
  @ApiProperty({ required: false, enum: SocialChannelConnectionStatus })
  @IsOptional()
  @IsEnum(SocialChannelConnectionStatus)
  status?: SocialChannelConnectionStatus;
}
