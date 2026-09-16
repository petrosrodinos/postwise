import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ToolContentDto } from './tool-content.dto';

export class GenerateTitleVariationsDto extends ToolContentDto {
  @ApiProperty({
    required: false,
    description: 'Style profile to optionally steer the tone with',
  })
  @IsOptional()
  @IsString()
  style_profile_id?: string;

  @ApiProperty({ required: false, default: 5, minimum: 1, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  count?: number;

  @ApiProperty({
    required: false,
    description: 'Freeform guidance for the title variations',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  instructions?: string;
}
