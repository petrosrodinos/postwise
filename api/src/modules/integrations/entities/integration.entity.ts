import { ApiProperty } from '@nestjs/swagger';
import { IntegrationProvider, IntegrationStatus } from 'generated/prisma';

export class IntegrationEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organisation_id: string;

  @ApiProperty({ enum: IntegrationProvider })
  provider: IntegrationProvider;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: IntegrationStatus })
  status: IntegrationStatus;

  @ApiProperty({ required: false, nullable: true })
  external_project_id?: string | null;

  @ApiProperty({ required: false, nullable: true })
  external_dataset?: string | null;

  @ApiProperty({ required: false, nullable: true })
  document_type?: string | null;

  @ApiProperty({ required: false, nullable: true })
  external_account_id?: string | null;

  @ApiProperty({ required: false, nullable: true })
  external_account_name?: string | null;

  @ApiProperty({ required: false, nullable: true })
  token_expires_at?: Date | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
