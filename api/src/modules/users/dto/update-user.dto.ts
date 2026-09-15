import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ required: false, description: 'Full name', example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiProperty({ required: false, description: 'Email address', example: 'jane@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, description: 'Phone number', example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;
}
