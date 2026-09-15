import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEnum } from 'class-validator';
import { PostType } from 'generated/prisma';

export class RepurposePostDto {
  @ApiProperty({ enum: PostType, isArray: true, description: 'Content types to repurpose this post into' })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(PostType, { each: true })
  target_types: PostType[];
}
