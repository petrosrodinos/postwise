import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DocumentType } from 'generated/prisma';

export class CreateDocumentDto {
  @ApiProperty({ enum: DocumentType, default: DocumentType.LOGO })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @ApiProperty({
    required: false,
    description:
      'Organisation workspace to own this document. Omit to own it under the personal account.',
  })
  @IsOptional()
  @IsString()
  organisation_id?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
