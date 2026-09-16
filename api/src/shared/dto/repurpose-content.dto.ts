import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEnum } from 'class-validator';
import { PostType } from 'generated/prisma';

// Shared between the `posts` and `tools` modules — both repurpose a piece
// of content into one or more other channel types the same way.
export class RepurposePostDto {
  @ApiProperty({
    enum: PostType,
    isArray: true,
    description: 'Content types to repurpose this content into',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(PostType, { each: true })
  target_types: PostType[];
}
