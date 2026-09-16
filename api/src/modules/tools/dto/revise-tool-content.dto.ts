import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ToolContentDto } from './tool-content.dto';
import { RevisePostDto } from '@/shared/dto/revise-content.dto';

export class ReviseToolContentDto extends IntersectionType(
  ToolContentDto,
  RevisePostDto,
) {
  @ApiProperty({
    required: false,
    description: 'Style profile to optionally steer the tone with',
  })
  @IsOptional()
  @IsString()
  style_profile_id?: string;
}
