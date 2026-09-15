import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class AcceptInvitationDto {
  @ApiProperty({ description: 'Invitation token from the email link' })
  @IsString()
  @MinLength(1)
  token: string;

  @ApiProperty({ description: 'New password (minimum 6 characters)', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Updated full name, if changed', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;
}
