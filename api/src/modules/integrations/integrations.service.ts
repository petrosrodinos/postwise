import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { OwnershipService } from '@/shared/services/ownership/ownership.service';
import { EncryptionService } from '@/shared/services/encryption/encryption.service';
import { SanityService } from '@/integrations/cms/sanity/services/sanity.service';
import {
  ActivityLogAction,
  ActivityLogEntityType,
  IntegrationProvider,
  IntegrationStatus,
  OrganisationRole,
} from 'generated/prisma';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { IntegrationsQueryType } from './dto/integrations-query.schema';
import { paginate, paginationMeta } from '@/shared/schemas/pagination.schema';
import { ErrorCodes } from '@/shared/config/error-codes';
import { ActivityLogsService } from '@/modules/activity-logs/activity-logs.service';
import { diffFields } from '@/modules/activity-logs/utils/activity-log.utils';

const MANAGE_ROLES: OrganisationRole[] = [
  OrganisationRole.OWNER,
  OrganisationRole.ADMIN,
];

const SECRET_FIELDS = [
  'api_token_encrypted',
  'access_token_encrypted',
  'refresh_token_encrypted',
] as const;

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownershipService: OwnershipService,
    private readonly encryptionService: EncryptionService,
    private readonly sanityService: SanityService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  private sanitize<
    T extends {
      api_token_encrypted?: string | null;
      access_token_encrypted?: string | null;
      refresh_token_encrypted?: string | null;
    },
  >(integration: T): Omit<T, (typeof SECRET_FIELDS)[number]> {
    const rest = { ...integration };
    for (const field of SECRET_FIELDS) delete rest[field];
    return rest;
  }

  private async testConnection(dto: {
    provider: IntegrationProvider;
    external_project_id?: string;
    external_dataset?: string;
    api_token?: string;
  }) {
    if (dto.provider !== IntegrationProvider.SANITY) return;

    if (!dto.external_project_id || !dto.external_dataset || !dto.api_token) {
      throw new BadRequestException({
        message:
          'Sanity integrations require a project ID, dataset and API token',
        code: ErrorCodes.Integrations.CONNECTION_TEST_FAILED,
      });
    }

    try {
      await this.sanityService.testConnection({
        projectId: dto.external_project_id,
        dataset: dto.external_dataset,
        apiToken: dto.api_token,
      });
    } catch (error) {
      throw new BadRequestException({
        message: error.message,
        code: ErrorCodes.Integrations.CONNECTION_TEST_FAILED,
      });
    }
  }

  private assertSocialFieldsPresent(dto: {
    provider: IntegrationProvider;
    external_account_id?: string;
    access_token?: string;
  }) {
    if (dto.provider === IntegrationProvider.SANITY) return;

    if (!dto.external_account_id || !dto.access_token) {
      throw new BadRequestException({
        message: `${dto.provider} integrations require an account id and access token`,
        code: ErrorCodes.Integrations.CONNECTION_TEST_FAILED,
      });
    }
  }

  async create(userId: string, dto: CreateIntegrationDto) {
    const context = await this.ownershipService.resolveContext(
      userId,
      dto.organisation_id,
    );
    this.ownershipService.assertRole(context, MANAGE_ROLES);

    await this.testConnection(dto);
    this.assertSocialFieldsPresent(dto);

    if (dto.external_account_id) {
      const existing = await this.prisma.integration.findUnique({
        where: {
          provider_external_account_id: {
            provider: dto.provider,
            external_account_id: dto.external_account_id,
          },
        },
      });
      if (existing) {
        throw new ConflictException({
          message: 'This account is already connected',
          code: ErrorCodes.Integrations.ALREADY_CONNECTED,
        });
      }
    }

    const integration = await this.prisma.integration.create({
      data: {
        organisation_id: context.organisation_id,
        provider: dto.provider,
        name: dto.name,
        external_project_id: dto.external_project_id,
        external_dataset: dto.external_dataset,
        document_type: dto.document_type,
        api_token_encrypted: dto.api_token
          ? this.encryptionService.encrypt(dto.api_token)
          : undefined,
        external_account_id: dto.external_account_id,
        external_account_name: dto.external_account_name,
        access_token_encrypted: dto.access_token
          ? this.encryptionService.encrypt(dto.access_token)
          : undefined,
        refresh_token_encrypted: dto.refresh_token
          ? this.encryptionService.encrypt(dto.refresh_token)
          : undefined,
        token_expires_at: dto.token_expires_at
          ? new Date(dto.token_expires_at)
          : undefined,
        status: IntegrationStatus.CONNECTED,
      },
    });

    this.activityLogsService.log({
      organisation_id: context.organisation_id,
      user_id: userId,
      action: ActivityLogAction.INTEGRATION_CONNECTED,
      entity_type: ActivityLogEntityType.INTEGRATION,
      entity_id: integration.id,
      description: `Connected ${integration.provider.toLowerCase()} integration "${integration.name}"`,
    });

    return this.sanitize(integration);
  }

  async findAll(userId: string, query: IntegrationsQueryType) {
    await this.ownershipService.resolveContext(userId, query.organisation_id);

    const where = {
      organisation_id: query.organisation_id,
      ...(query.provider && { provider: query.provider }),
    };

    const { skip, take } = paginate(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.integration.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.integration.count({ where }),
    ]);

    return {
      data: data.map((integration) => this.sanitize(integration)),
      pagination: paginationMeta(total, query.page, query.limit),
    };
  }

  private async findOwned(userId: string, id: string) {
    const integration = await this.prisma.integration.findUnique({
      where: { id },
    });
    if (!integration) throw new NotFoundException('Integration not found');

    await this.ownershipService.resolveContext(
      userId,
      integration.organisation_id,
    );

    return integration;
  }

  async findOne(userId: string, id: string) {
    return this.sanitize(await this.findOwned(userId, id));
  }

  async findOneRaw(id: string) {
    const integration = await this.prisma.integration.findUnique({
      where: { id },
    });
    if (!integration) throw new NotFoundException('Integration not found');
    return integration;
  }

  async update(userId: string, id: string, dto: UpdateIntegrationDto) {
    const integration = await this.findOwned(userId, id);

    const context = await this.ownershipService.resolveContext(
      userId,
      integration.organisation_id,
    );
    this.ownershipService.assertRole(context, MANAGE_ROLES);

    if (dto.api_token) {
      await this.testConnection({
        provider: integration.provider,
        external_project_id:
          dto.external_project_id ??
          integration.external_project_id ??
          undefined,
        external_dataset:
          dto.external_dataset ?? integration.external_dataset ?? undefined,
        api_token: dto.api_token,
      });
    }

    const updated = await this.prisma.integration.update({
      where: { id },
      data: {
        name: dto.name,
        external_project_id: dto.external_project_id,
        external_dataset: dto.external_dataset,
        document_type: dto.document_type,
        api_token_encrypted: dto.api_token
          ? this.encryptionService.encrypt(dto.api_token)
          : undefined,
        external_account_name: dto.external_account_name,
        access_token_encrypted: dto.access_token
          ? this.encryptionService.encrypt(dto.access_token)
          : undefined,
        refresh_token_encrypted: dto.refresh_token
          ? this.encryptionService.encrypt(dto.refresh_token)
          : undefined,
        token_expires_at: dto.token_expires_at
          ? new Date(dto.token_expires_at)
          : undefined,
        status: dto.status,
      },
    });

    // Never diff secret fields into metadata — only non-secret fields.
    this.activityLogsService.log({
      organisation_id: integration.organisation_id,
      user_id: userId,
      action: ActivityLogAction.INTEGRATION_UPDATED,
      entity_type: ActivityLogEntityType.INTEGRATION,
      entity_id: integration.id,
      description: `Updated ${integration.provider.toLowerCase()} integration "${updated.name}"`,
      metadata: {
        changes: diffFields(integration, updated, [
          'name',
          'external_project_id',
          'external_dataset',
          'document_type',
          'external_account_name',
          'token_expires_at',
          'status',
        ]),
      },
    });

    return this.sanitize(updated);
  }

  async remove(userId: string, id: string) {
    const integration = await this.findOwned(userId, id);

    const context = await this.ownershipService.resolveContext(
      userId,
      integration.organisation_id,
    );
    this.ownershipService.assertRole(context, MANAGE_ROLES);

    await this.prisma.integration.delete({ where: { id } });

    this.activityLogsService.log({
      organisation_id: integration.organisation_id,
      user_id: userId,
      action: ActivityLogAction.INTEGRATION_REMOVED,
      entity_type: ActivityLogEntityType.INTEGRATION,
      entity_id: integration.id,
      description: `Disconnected ${integration.provider.toLowerCase()} integration "${integration.name}"`,
    });

    return { message: 'Integration removed successfully' };
  }
}
