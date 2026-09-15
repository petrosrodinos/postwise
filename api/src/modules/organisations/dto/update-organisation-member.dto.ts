import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrganisationRole } from 'generated/prisma';

export class UpdateOrganisationMemberDto {
  @ApiProperty({ enum: OrganisationRole, example: OrganisationRole.ADMIN })
  @IsEnum(OrganisationRole)
  role: OrganisationRole;
}
