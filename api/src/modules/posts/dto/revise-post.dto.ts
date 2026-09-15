import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum RevisePreset {
  FRIENDLIER = 'FRIENDLIER',
  MORE_FORMAL = 'MORE_FORMAL',
  LESS_FORMAL = 'LESS_FORMAL',
  SHORTER = 'SHORTER',
  LONGER = 'LONGER',
  SIMPLIFY = 'SIMPLIFY',
  PUNCHIER = 'PUNCHIER',
  FIX_GRAMMAR = 'FIX_GRAMMAR',
}

export class RevisePostDto {
  @ApiProperty({
    enum: RevisePreset,
    required: false,
    description: 'A quick-action preset to guide the revision',
  })
  @IsOptional()
  @IsEnum(RevisePreset)
  preset?: RevisePreset;

  @ApiProperty({
    required: false,
    description: 'Freeform instructions describing how the AI should change the post',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  instructions?: string;
}
