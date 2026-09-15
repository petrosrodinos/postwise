import { ApiProperty } from '@nestjs/swagger';
import { OrganisationMemberStatus, OrganisationRole } from 'generated/prisma';

export class OrganisationMemberEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organisation_id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty({ enum: OrganisationRole })
  role: OrganisationRole;

  @ApiProperty({ enum: OrganisationMemberStatus })
  status: OrganisationMemberStatus;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
