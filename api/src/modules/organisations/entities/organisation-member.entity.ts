import { ApiProperty } from '@nestjs/swagger';
import { OrganisationRole } from 'generated/prisma';

export class OrganisationMemberEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organisation_id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty({ enum: OrganisationRole })
  role: OrganisationRole;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
