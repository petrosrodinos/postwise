import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentsQuerySchema, DocumentsQueryType } from './dto/documents-query.schema';
import { DocumentEntity } from './entities/document.entity';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a document / brand asset' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, type: DocumentEntity })
  @UseInterceptors(FileInterceptor('file'))
  create(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: any,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.documentsService.create(userId, file, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List documents' })
  @ApiQuery({ name: 'organisation_id', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200 })
  findAll(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(DocumentsQuerySchema)) query: DocumentsQueryType,
  ) {
    return this.documentsService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a document by id' })
  @ApiResponse({ status: 200, type: DocumentEntity })
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.documentsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a document' })
  @ApiResponse({ status: 200, type: DocumentEntity })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({ status: 200 })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.documentsService.remove(userId, id);
  }
}
