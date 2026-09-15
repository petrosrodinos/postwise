import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SocialChannel } from 'generated/prisma';

export class CreateSocialChannelConnectionDto {
  @ApiProperty({ enum: SocialChannel, example: SocialChannel.TWITTER })
  @IsEnum(SocialChannel)
  channel: SocialChannel;

  @ApiProperty({ description: 'The account id on the external platform' })
  @IsString()
  external_account_id: string;

  @ApiProperty({ required: false, description: 'Display name / handle on the external platform' })
  @IsOptional()
  @IsString()
  external_account_name?: string;

  @ApiProperty({ description: 'OAuth access token used to publish on behalf of this account' })
  @IsString()
  access_token: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  refresh_token?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  token_expires_at?: string;

  @ApiProperty({ description: 'Organisation workspace that owns this connection' })
  @IsNotEmpty()
  @IsString()
  organisation_id: string;
}
