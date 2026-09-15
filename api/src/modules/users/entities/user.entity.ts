import { ApiProperty } from '@nestjs/swagger';
import { AuthRole } from 'generated/prisma';

export class UserEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false, nullable: true })
  phone?: string | null;

  @ApiProperty({ enum: ['USER', 'ADMIN', 'SUPER_ADMIN', 'SUPPORT'] })
  role: AuthRole;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
