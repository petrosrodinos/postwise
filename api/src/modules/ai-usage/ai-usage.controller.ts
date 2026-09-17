import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { AiUsageService } from './ai-usage.service';
import { AiUsageQuerySchema, AiUsageQueryType } from './dto/ai-usage-query.schema';
import { AiUsageSummaryQuerySchema, AiUsageSummaryQueryType } from './dto/ai-usage-summary-query.schema';
import { AiUsageEventEntity } from './entities/ai-usage-event.entity';

@ApiTags('ai-usage')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('organisations/:organisationId/ai-usage')
export class AiUsageController {
  constructor(private readonly aiUsageService: AiUsageService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Aggregate AI usage/cost totals for an organisation' })
  @ApiResponse({ status: 200 })
  getSummary(
    @CurrentUser('id') userId: string,
    @Param('organisationId') organisationId: string,
    @Query(new ZodValidationPipe(AiUsageSummaryQuerySchema)) query: AiUsageSummaryQueryType,
  ) {
    return this.aiUsageService.getSummary(userId, organisationId, query);
  }

  @Get()
  @ApiOperation({ summary: 'List AI usage/cost events for an organisation' })
  @ApiResponse({ status: 200, type: [AiUsageEventEntity] })
  findAll(
    @CurrentUser('id') userId: string,
    @Param('organisationId') organisationId: string,
    @Query(new ZodValidationPipe(AiUsageQuerySchema)) query: AiUsageQueryType,
  ) {
    return this.aiUsageService.findAll(userId, organisationId, query);
  }
}
