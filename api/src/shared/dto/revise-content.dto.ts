import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

// Shared between the `posts` and `tools` modules — both revise a piece of
// content via the same quick-action presets.
export enum RevisePreset {
  FRIENDLIER = 'FRIENDLIER',
  MORE_FORMAL = 'MORE_FORMAL',
  LESS_FORMAL = 'LESS_FORMAL',
  SHORTER = 'SHORTER',
  LONGER = 'LONGER',
  SIMPLIFY = 'SIMPLIFY',
  PUNCHIER = 'PUNCHIER',
  FIX_GRAMMAR = 'FIX_GRAMMAR',
  HUMANIZE = 'HUMANIZE',
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
    description:
      'Freeform instructions describing how the AI should change the content',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  instructions?: string;
}
