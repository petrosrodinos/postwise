import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { IntegrationStatus } from 'generated/prisma';
import { CreateIntegrationDto } from './create-integration.dto';

export class UpdateIntegrationDto extends PartialType(
  OmitType(CreateIntegrationDto, ['provider', 'organisation_id'] as const),
) {
  @ApiProperty({ required: false, enum: IntegrationStatus })
  @IsOptional()
  @IsEnum(IntegrationStatus)
  status?: IntegrationStatus;
}
