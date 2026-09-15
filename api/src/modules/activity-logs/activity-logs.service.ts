import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { OwnershipService } from '@/shared/services/ownership/ownership.service';
import { paginate, paginationMeta } from '@/shared/schemas/pagination.schema';
import { LogActivityParams } from './interfaces/activity-log.interface';
import { ActivityLogsQueryType } from './dto/activity-logs-query.schema';

const ACTIVITY_LOG_USER_SELECT = { id: true, name: true, email: true } as const;

@Injectable()
export class ActivityLogsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownershipService: OwnershipService,
  ) {}

  // Fire-and-forget — callers never await this, and a failure here must
  // never break the action that triggered it.
  log(params: LogActivityParams): void {
    setImmediate(async () => {
      try {
        await this.prisma.activityLog.create({
          data: {
            organisation_id: params.organisation_id,
            user_id: params.user_id,
            action: params.action,
            entity_type: params.entity_type,
            entity_id: params.entity_id,
            description: params.description,
            metadata: params.metadata as any,
          },
        });
      } catch {}
    });
  }

  async findAll(userId: string, organisationId: string, query: ActivityLogsQueryType) {
    await this.ownershipService.resolveContext(userId, organisationId);

    const where = {
      organisation_id: organisationId,
      ...(query.action && { action: query.action }),
      ...(query.entity_type && { entity_type: query.entity_type }),
      ...(query.user_id && { user_id: query.user_id }),
      ...((query.from || query.to) && {
        created_at: {
          ...(query.from && { gte: new Date(query.from) }),
          ...(query.to && { lte: new Date(query.to) }),
        },
      }),
    };

    const { skip, take } = paginate(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
        include: { user: { select: ACTIVITY_LOG_USER_SELECT } },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return { data, pagination: paginationMeta(total, query.page, query.limit) };
  }
}
