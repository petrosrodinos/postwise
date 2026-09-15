import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { OwnershipService } from '@/shared/services/ownership/ownership.service';
import { OrganisationRole, SocialChannelConnectionStatus } from 'generated/prisma';
import { CreateSocialChannelConnectionDto } from './dto/create-social-channel-connection.dto';
import { UpdateSocialChannelConnectionDto } from './dto/update-social-channel-connection.dto';
import { SocialChannelConnectionsQueryType } from './dto/social-channel-connections-query.schema';
import { paginate, paginationMeta } from '@/shared/schemas/pagination.schema';
import { ErrorCodes } from '@/shared/config/error-codes';

const MANAGE_ROLES: OrganisationRole[] = [OrganisationRole.OWNER, OrganisationRole.ADMIN];

@Injectable()
export class SocialChannelConnectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownershipService: OwnershipService,
  ) {}

  private sanitize<T extends { access_token?: string; refresh_token?: string }>(
    connection: T,
  ): Omit<T, 'access_token' | 'refresh_token'> {
    const { access_token, refresh_token, ...rest } = connection;
    return rest;
  }

  async create(userId: string, dto: CreateSocialChannelConnectionDto) {
    const context = await this.ownershipService.resolveContext(userId, dto.organisation_id);
    this.ownershipService.assertRole(context, MANAGE_ROLES);

    const existing = await this.prisma.socialChannelConnection.findUnique({
      where: {
        channel_external_account_id: {
          channel: dto.channel,
          external_account_id: dto.external_account_id,
        },
      },
    });
    if (existing) {
      throw new ConflictException({
        message: 'This account is already connected',
        code: ErrorCodes.SocialChannels.CHANNEL_ALREADY_CONNECTED,
      });
    }

    const connection = await this.prisma.socialChannelConnection.create({
      data: {
        organisation_id: context.organisation_id,
        channel: dto.channel,
        external_account_id: dto.external_account_id,
        external_account_name: dto.external_account_name,
        access_token: dto.access_token,
        refresh_token: dto.refresh_token,
        token_expires_at: dto.token_expires_at ? new Date(dto.token_expires_at) : undefined,
        status: SocialChannelConnectionStatus.CONNECTED,
      },
    });

    return this.sanitize(connection);
  }

  async findAll(userId: string, query: SocialChannelConnectionsQueryType) {
    await this.ownershipService.resolveContext(userId, query.organisation_id);

    const where = {
      organisation_id: query.organisation_id,
      ...(query.channel && { channel: query.channel }),
    };

    const { skip, take } = paginate(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.socialChannelConnection.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.socialChannelConnection.count({ where }),
    ]);

    return {
      data: data.map((c) => this.sanitize(c)),
      pagination: paginationMeta(total, query.page, query.limit),
    };
  }

  private async findOwned(userId: string, id: string) {
    const connection = await this.prisma.socialChannelConnection.findUnique({ where: { id } });
    if (!connection) throw new NotFoundException('Social channel connection not found');

    await this.ownershipService.resolveContext(userId, connection.organisation_id);

    return connection;
  }

  async findOne(userId: string, id: string) {
    return this.sanitize(await this.findOwned(userId, id));
  }

  async findOneRaw(id: string) {
    const connection = await this.prisma.socialChannelConnection.findUnique({ where: { id } });
    if (!connection) throw new NotFoundException('Social channel connection not found');
    return connection;
  }

  async update(userId: string, id: string, dto: UpdateSocialChannelConnectionDto) {
    const connection = await this.findOwned(userId, id);

    const context = await this.ownershipService.resolveContext(
      userId,
      connection.organisation_id,
    );
    this.ownershipService.assertRole(context, MANAGE_ROLES);

    const updated = await this.prisma.socialChannelConnection.update({
      where: { id },
      data: {
        external_account_name: dto.external_account_name,
        access_token: dto.access_token,
        refresh_token: dto.refresh_token,
        token_expires_at: dto.token_expires_at ? new Date(dto.token_expires_at) : undefined,
        status: dto.status,
      },
    });

    return this.sanitize(updated);
  }

  async remove(userId: string, id: string) {
    const connection = await this.findOwned(userId, id);

    const context = await this.ownershipService.resolveContext(
      userId,
      connection.organisation_id,
    );
    this.ownershipService.assertRole(context, MANAGE_ROLES);

    await this.prisma.socialChannelConnection.delete({ where: { id } });
    return { message: 'Social channel connection removed successfully' };
  }
}
