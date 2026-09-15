import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { GcsService } from '@/integrations/storage/gcs/services/gcs.service';
import { OwnershipService } from '@/shared/services/ownership/ownership.service';
import { OrganisationRole } from 'generated/prisma';
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
  ) {}

  private async ownerWhere(userId: string, organisationId?: string) {
    const context = await this.ownershipService.resolveContext(userId, organisationId);
    if (context.organisation_id) {
      this.ownershipService.assertRole(context, MANAGE_ROLES);
      return { organisation_id: context.organisation_id };
    }
    return { user_uuid: context.user_id };
  }

  async create(userId: string, file: any, dto: CreateDocumentDto) {
    const owner = await this.ownerWhere(userId, dto.organisation_id);

    const uploaded = await this.gcsService.uploadImageFromBuffer(
      file.buffer,
      file.originalname,
      file.mimetype,
      GcsFolders.documents,
    );

    return this.prisma.document.create({
      data: {
        ...owner,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: uploaded.size,
        url: uploaded.url,
        path: uploaded.path,
        type: dto.type,
      },
    });
  }

  async findAll(userId: string, query: DocumentsQueryType) {
    if (query.organisation_id) {
      await this.ownershipService.resolveContext(userId, query.organisation_id);
    }

    const where = {
      ...(query.organisation_id
        ? { organisation_id: query.organisation_id }
        : { user_uuid: userId }),
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

    if (document.organisation_id) {
      await this.ownershipService.resolveContext(userId, document.organisation_id);
    } else if (document.user_uuid !== userId) {
      throw new ForbiddenException('You do not have access to this document');
    }

    return document;
  }

  async findOne(userId: string, id: string) {
    return this.findOwned(userId, id);
  }

  async update(userId: string, id: string, dto: UpdateDocumentDto) {
    const document = await this.findOwned(userId, id);

    if (document.organisation_id) {
      const context = await this.ownershipService.resolveContext(
        userId,
        document.organisation_id,
      );
      this.ownershipService.assertRole(context, MANAGE_ROLES);
    }

    return this.prisma.document.update({
      where: { id },
      data: { filename: dto.filename, type: dto.type },
    });
  }

  async remove(userId: string, id: string) {
    const document = await this.findOwned(userId, id);

    if (document.organisation_id) {
      const context = await this.ownershipService.resolveContext(
        userId,
        document.organisation_id,
      );
      this.ownershipService.assertRole(context, MANAGE_ROLES);
    }

    await this.gcsService.deleteImage({ filename: document.path });
    await this.prisma.document.delete({ where: { id } });

    return { message: 'Document deleted successfully' };
  }
}
