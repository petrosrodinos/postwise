import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IntegrationProvider } from 'generated/prisma';

export class CreateIntegrationDto {
  @ApiProperty({
    enum: IntegrationProvider,
    example: IntegrationProvider.SANITY,
  })
  @IsEnum(IntegrationProvider)
  provider: IntegrationProvider;

  @ApiProperty({ description: 'Display name for this connection' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Organisation workspace that owns this integration',
  })
  @IsNotEmpty()
  @IsString()
  organisation_id: string;

  @ApiProperty({
    required: false,
    description: 'Sanity project ID (SANITY only)',
  })
  @IsOptional()
  @IsString()
  external_project_id?: string;

  @ApiProperty({
    required: false,
    description: 'Sanity dataset, e.g. "production" (SANITY only)',
  })
  @IsOptional()
  @IsString()
  external_dataset?: string;

  @ApiProperty({
    required: false,
    description:
      'Sanity document type to publish into, default "post" (SANITY only)',
  })
  @IsOptional()
  @IsString()
  document_type?: string;

  @ApiProperty({
    required: false,
    description: 'Sanity API token (SANITY only)',
  })
  @IsOptional()
  @IsString()
  api_token?: string;

  @ApiProperty({
    required: false,
    description:
      'The account id on the external platform (TWITTER/LINKEDIN only)',
  })
  @IsOptional()
  @IsString()
  external_account_id?: string;

  @ApiProperty({
    required: false,
    description:
      'Display name / handle on the external platform (TWITTER/LINKEDIN only)',
  })
  @IsOptional()
  @IsString()
  external_account_name?: string;

  @ApiProperty({
    required: false,
    description:
      'OAuth access token used to publish on behalf of this account (TWITTER/LINKEDIN only)',
  })
  @IsOptional()
  @IsString()
  access_token?: string;

  @ApiProperty({ required: false, description: 'TWITTER/LINKEDIN only' })
  @IsOptional()
  @IsString()
  refresh_token?: string;

  @ApiProperty({ required: false, description: 'TWITTER/LINKEDIN only' })
  @IsOptional()
  @IsDateString()
  token_expires_at?: string;
}
