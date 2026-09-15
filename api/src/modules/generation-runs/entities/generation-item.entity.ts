import { ApiProperty } from '@nestjs/swagger';
import { PostEntity } from '@/modules/posts/entities/post.entity';

export class GenerationItemEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  generation_run_id: string;

  @ApiProperty()
  order: number;

  @ApiProperty({ required: false, nullable: true })
  topic?: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty({
    type: [PostEntity],
    description: 'One post per target channel (or a single BLOG post for blog projects)',
  })
  posts: PostEntity[];
}
