import { IntersectionType } from '@nestjs/swagger';
import { ToolContentDto } from './tool-content.dto';
import { RevisePostDto } from '@/shared/dto/revise-content.dto';

export class ReviseToolContentDto extends IntersectionType(
  ToolContentDto,
  RevisePostDto,
) {}
