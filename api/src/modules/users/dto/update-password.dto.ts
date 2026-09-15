import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsString()
  current_password: string;

  @ApiProperty({ description: 'New password (minimum 6 characters)', minLength: 6 })
  @IsString()
  @MinLength(6)
  new_password: string;
}
