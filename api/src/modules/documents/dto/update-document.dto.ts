import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DocumentType } from 'generated/prisma';

export class UpdateDocumentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiProperty({ required: false, enum: DocumentType })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;
}
