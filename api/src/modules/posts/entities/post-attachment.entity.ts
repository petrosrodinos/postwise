import { ApiProperty } from '@nestjs/swagger';

export class PostAttachmentEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  post_id: string;

  @ApiProperty()
  document_id: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  created_at: Date;
}
