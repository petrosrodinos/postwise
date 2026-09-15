// src/modules/auth/dto/register-email.dto.ts

import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterEmailDto {
    @ApiProperty({
        description: 'Full name',
        example: 'Jane Doe',
    })
    @IsString()
    @MinLength(1)
    name: string;

    @ApiProperty({
        description: 'User email address',
        example: 'user@example.com',
        format: 'email'
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User password (minimum 6 characters)',
        example: 'password123',
        minLength: 6
    })
    @IsString()
    @MinLength(6)
    password: string;

}
