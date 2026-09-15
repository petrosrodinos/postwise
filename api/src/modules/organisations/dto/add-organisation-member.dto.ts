import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { OrganisationRole } from 'generated/prisma';

export class AddOrganisationMemberDto {
  @ApiProperty({ description: 'Full name of the member', example: 'Jane Doe' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ description: 'Email address of the member', example: 'jane@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'Whether to send an invitation email so the new member can set their own password. Defaults to true. Ignored if a user with this email already exists (they are added as Active and notified instead).',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  send_invite?: boolean;

  @ApiProperty({
    description:
      'Password for the new account. Required only when send_invite is false. Ignored if a user with this email already exists.',
    required: false,
    minLength: 6,
  })
  @ValidateIf((o) => o.send_invite === false)
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ enum: OrganisationRole, example: OrganisationRole.MEMBER })
  @IsEnum(OrganisationRole)
  role: OrganisationRole;
}
