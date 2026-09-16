import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsIn } from 'class-validator';
import {
  TOOL_CONTENT_TYPES,
  ToolContentDto,
  type ToolContentType,
} from './tool-content.dto';

// Deliberately its own DTO rather than reusing the shared
// `RepurposePostDto` (posts/tool-content.dto.ts) — that one validates
// against Prisma's PostType, which doesn't include EMAIL.
export class RepurposeToolContentDto extends ToolContentDto {
  @ApiProperty({
    enum: TOOL_CONTENT_TYPES,
    isArray: true,
    description: 'Content types to repurpose this content into',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(TOOL_CONTENT_TYPES, { each: true })
  target_types: ToolContentType[];
}
