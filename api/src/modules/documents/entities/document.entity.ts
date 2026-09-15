import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from 'generated/prisma';

export class DocumentEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organisation_id: string;

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
