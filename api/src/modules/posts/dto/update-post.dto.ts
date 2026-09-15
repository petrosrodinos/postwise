import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PostStatus } from 'generated/prisma';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(
  OmitType(CreatePostDto, ['type', 'organisation_id'] as const),
) {
  @ApiProperty({
    required: false,
    enum: [PostStatus.DRAFT, PostStatus.REVIEW, PostStatus.READY],
    description: 'Editorial status. Use the schedule/publish actions to move past READY.',
  })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}
