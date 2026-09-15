import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from 'generated/prisma';

export class DocumentEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false, nullable: true })
  user_uuid?: string | null;

  @ApiProperty({ required: false, nullable: true })
  organisation_id?: string | null;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  mimetype: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  url: string;

  @ApiProperty()
  path: string;

  @ApiProperty({ enum: DocumentType })
  type: DocumentType;

  @ApiProperty()
  created_at: Date;
}
