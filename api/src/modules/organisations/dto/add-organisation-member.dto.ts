import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
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
      'Password for the new account. Ignored if a user with this email already exists.',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: OrganisationRole, example: OrganisationRole.MEMBER })
  @IsEnum(OrganisationRole)
  role: OrganisationRole;
}
