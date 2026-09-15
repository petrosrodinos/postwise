import { ApiProperty } from '@nestjs/swagger';
import { ActivityLogAction, ActivityLogEntityType } from 'generated/prisma';

class ActivityLogUserEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

export class ActivityLogEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true })
  organisation_id: string | null;

  @ApiProperty({ type: ActivityLogUserEntity, nullable: true })
  user: ActivityLogUserEntity | null;

  @ApiProperty({ enum: ActivityLogAction })
  action: ActivityLogAction;

  @ApiProperty({ enum: ActivityLogEntityType, nullable: true })
  entity_type: ActivityLogEntityType | null;

  @ApiProperty({ nullable: true })
  entity_id: string | null;

  @ApiProperty()
  description: string;

  @ApiProperty({ nullable: true })
  metadata: Record<string, unknown> | null;

  @ApiProperty()
  created_at: Date;
}
