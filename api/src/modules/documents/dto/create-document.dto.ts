import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DocumentType } from 'generated/prisma';

export class CreateDocumentDto {
  @ApiProperty({ enum: DocumentType, default: DocumentType.LOGO })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @ApiProperty({ description: 'Organisation workspace that owns this document' })
  @IsNotEmpty()
  @IsString()
  organisation_id: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
