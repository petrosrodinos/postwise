import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { GcsService } from '@/integrations/storage/gcs/services/gcs.service';
import { OwnershipService } from '@/shared/services/ownership/ownership.service';
import { ActivityLogsService } from '@/modules/activity-logs/activity-logs.service';
import { diffFields } from '@/modules/activity-logs/utils/activity-log.utils';
import { ActivityLogAction, ActivityLogEntityType, DocumentType, OrganisationRole } from 'generated/prisma';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentsQueryType } from './dto/documents-query.schema';
import { paginate, paginationMeta } from '@/shared/schemas/pagination.schema';
import { GcsFolders } from '@/integrations/storage/gcs/config/gcs-folders.config';

const MANAGE_ROLES: OrganisationRole[] = [OrganisationRole.OWNER, OrganisationRole.ADMIN];

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gcsService: GcsService,
    private readonly ownershipService: OwnershipService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async create(userId: string, file: any, dto: CreateDocumentDto) {
    const context = await this.ownershipService.resolveContext(userId, dto.organisation_id);
    this.ownershipService.assertRole(context, MANAGE_ROLES);

    const uploaded = await this.gcsService.uploadImageFromBuffer(
      file.buffer,
      file.originalname,
      file.mimetype,
      GcsFolders.documents,
    );

    const document = await this.prisma.document.create({
      data: {
        organisation_id: context.organisation_id,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: uploaded.size,
        url: uploaded.url,
        path: uploaded.path,
        type: dto.type,
      },
    });

    this.activityLogsService.log({
      organisation_id: context.organisation_id,
      user_id: userId,
      action: ActivityLogAction.DOCUMENT_UPLOADED,
      entity_type: ActivityLogEntityType.DOCUMENT,
      entity_id: document.id,
      description: `Uploaded document "${document.filename}"`,
    });

    return document;
  }

  // Service-to-service creation for AI-generated images (e.g. blog post cover
  // candidates) — bypasses the controller's Multer upload since there is no
  // HTTP file part, only base64 bytes already produced by the caller.
  async createFromGenerated(params: {
    organisationId: string;
    base64Data: string;
    filename: string;
    mimetype: string;
    type?: DocumentType;
  }) {
    const uploaded = await this.gcsService.uploadImageFromBase64(
      params.base64Data,
      params.filename,
      params.mimetype,
      GcsFolders.documents,
    );

    return this.prisma.document.create({
      data: {
        organisation_id: params.organisationId,
        filename: params.filename,
        mimetype: params.mimetype,
        size: uploaded.size,
        url: uploaded.url,
        path: uploaded.path,
        type: params.type ?? DocumentType.IMAGE,
      },
    });
  }

  async findAll(userId: string, query: DocumentsQueryType) {
    await this.ownershipService.resolveContext(userId, query.organisation_id);

    const where = {
      organisation_id: query.organisation_id,
      ...(query.type && { type: query.type }),
    };

    const { skip, take } = paginate(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.document.count({ where }),
    ]);

    return { data, pagination: paginationMeta(total, query.page, query.limit) };
  }

  private async findOwned(userId: string, id: string) {
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document) throw new NotFoundException('Document not found');

    await this.ownershipService.resolveContext(userId, document.organisation_id);

    return document;
  }

  async findOne(userId: string, id: string) {
    return this.findOwned(userId, id);
  }

  async update(userId: string, id: string, dto: UpdateDocumentDto) {
    const document = await this.findOwned(userId, id);

    const context = await this.ownershipService.resolveContext(userId, document.organisation_id);
    this.ownershipService.assertRole(context, MANAGE_ROLES);

    const updated = await this.prisma.document.update({
      where: { id },
      data: { filename: dto.filename, type: dto.type },
    });

    this.activityLogsService.log({
      organisation_id: document.organisation_id,
      user_id: userId,
      action: ActivityLogAction.DOCUMENT_UPDATED,
      entity_type: ActivityLogEntityType.DOCUMENT,
      entity_id: document.id,
      description: `Updated document "${updated.filename}"`,
      metadata: { changes: diffFields(document, updated, ['filename', 'type']) },
    });

    return updated;
  }

  async remove(userId: string, id: string) {
    const document = await this.findOwned(userId, id);

    const context = await this.ownershipService.resolveContext(userId, document.organisation_id);
    this.ownershipService.assertRole(context, MANAGE_ROLES);

    await this.gcsService.deleteImage({ filename: document.path });
    await this.prisma.document.delete({ where: { id } });

    this.activityLogsService.log({
      organisation_id: document.organisation_id,
      user_id: userId,
      action: ActivityLogAction.DOCUMENT_DELETED,
      entity_type: ActivityLogEntityType.DOCUMENT,
      entity_id: document.id,
      description: `Deleted document "${document.filename}"`,
    });

    return { message: 'Document deleted successfully' };
  }
}
