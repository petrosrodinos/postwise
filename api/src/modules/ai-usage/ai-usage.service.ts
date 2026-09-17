import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { OwnershipService } from '@/shared/services/ownership/ownership.service';
import { paginate, paginationMeta } from '@/shared/schemas/pagination.schema';
import { RecordAiUsageParams } from './interfaces/ai-usage.interface';
import { AiUsageQueryType } from './dto/ai-usage-query.schema';
import { AiUsageSummaryQueryType } from './dto/ai-usage-summary-query.schema';

const AI_USAGE_USER_SELECT = { id: true, name: true, email: true } as const;

interface AiUsageFilters {
  type?: AiUsageQueryType['type'];
  feature?: AiUsageQueryType['feature'];
  provider?: string;
  model?: string;
  user_id?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class AiUsageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownershipService: OwnershipService,
  ) {}

  // Fire-and-forget — callers (AiService/AiImageService) never await this,
  // and a failure here must never break the AI call that triggered it.
  record(params: RecordAiUsageParams): void {
    setImmediate(async () => {
      try {
        await this.prisma.aiUsageEvent.create({
          data: {
            organisation_id: params.organisation_id,
            user_id: params.user_id,
            type: params.type,
            feature: params.feature,
            provider: params.provider,
            model: params.model,
            input_tokens: params.input_tokens ?? null,
            output_tokens: params.output_tokens ?? null,
            total_tokens: params.total_tokens ?? null,
            image_count: params.image_count ?? null,
            input_cost: params.input_cost ?? 0,
            output_cost: params.output_cost ?? 0,
            total_cost: params.total_cost,
            generation_run_id: params.generation_run_id ?? null,
            post_id: params.post_id ?? null,
            metadata: params.metadata as any,
          },
        });
      } catch {}
    });
  }

  private buildWhere(organisationId: string, query: AiUsageFilters) {
    return {
      organisation_id: organisationId,
      ...(query.type && { type: query.type }),
      ...(query.feature && { feature: query.feature }),
      ...(query.provider && { provider: query.provider }),
      ...(query.model && { model: query.model }),
      ...(query.user_id && { user_id: query.user_id }),
      ...((query.from || query.to) && {
        created_at: {
          ...(query.from && { gte: new Date(query.from) }),
          ...(query.to && { lte: new Date(query.to) }),
        },
      }),
    };
  }

  async findAll(userId: string, organisationId: string, query: AiUsageQueryType) {
    await this.ownershipService.resolveContext(userId, organisationId);

    const where = this.buildWhere(organisationId, query);
    const { skip, take } = paginate(query.page, query.limit);

    const [events, total] = await Promise.all([
      this.prisma.aiUsageEvent.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
        include: { user: { select: AI_USAGE_USER_SELECT } },
      }),
      this.prisma.aiUsageEvent.count({ where }),
    ]);

    // Prisma Decimal serializes to a string via its own toJSON() — convert
    // to plain numbers here so API consumers get numeric cost fields.
    const data = events.map((event) => ({
      ...event,
      input_cost: Number(event.input_cost),
      output_cost: Number(event.output_cost),
      total_cost: Number(event.total_cost),
    }));

    return { data, pagination: paginationMeta(total, query.page, query.limit) };
  }

  async getSummary(userId: string, organisationId: string, query: AiUsageSummaryQueryType) {
    await this.ownershipService.resolveContext(userId, organisationId);

    const where = this.buildWhere(organisationId, query);
    const toNumber = (value: unknown) => (value ? Number(value) : 0);

    const [totals, byFeature, byType, byProvider] = await Promise.all([
      this.prisma.aiUsageEvent.aggregate({
        where,
        _sum: { total_cost: true, input_tokens: true, output_tokens: true, total_tokens: true, image_count: true },
        _count: true,
      }),
      this.prisma.aiUsageEvent.groupBy({
        by: ['feature'],
        where,
        _sum: { total_cost: true },
        _count: true,
      }),
      this.prisma.aiUsageEvent.groupBy({
        by: ['type'],
        where,
        _sum: { total_cost: true },
        _count: true,
      }),
      this.prisma.aiUsageEvent.groupBy({
        by: ['provider'],
        where,
        _sum: { total_cost: true },
        _count: true,
      }),
    ]);

    return {
      total_cost: toNumber(totals._sum.total_cost),
      total_input_tokens: totals._sum.input_tokens ?? 0,
      total_output_tokens: totals._sum.output_tokens ?? 0,
      total_tokens: totals._sum.total_tokens ?? 0,
      total_image_count: totals._sum.image_count ?? 0,
      total_generations: totals._count,
      by_feature: byFeature.map((row) => ({
        feature: row.feature,
        count: row._count,
        total_cost: toNumber(row._sum.total_cost),
      })),
      by_type: byType.map((row) => ({
        type: row.type,
        count: row._count,
        total_cost: toNumber(row._sum.total_cost),
      })),
      by_provider: byProvider.map((row) => ({
        provider: row.provider,
        count: row._count,
        total_cost: toNumber(row._sum.total_cost),
      })),
    };
  }
}
