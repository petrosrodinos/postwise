import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ToolContentDto } from './tool-content.dto';

export class FormatToolContentDto extends ToolContentDto {
  @ApiProperty({
    required: false,
    description:
      'Optional extra formatting wishes (e.g. "use a numbered list for the steps")',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  instructions?: string;
}
