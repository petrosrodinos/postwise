import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLogsQuerySchema, ActivityLogsQueryType } from './dto/activity-logs-query.schema';
import { ActivityLogEntity } from './entities/activity-log.entity';

@ApiTags('activity-logs')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('organisations/:organisationId/activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List activity for an organisation' })
  @ApiResponse({ status: 200, type: [ActivityLogEntity] })
  findAll(
    @CurrentUser('id') userId: string,
    @Param('organisationId') organisationId: string,
    @Query(new ZodValidationPipe(ActivityLogsQuerySchema)) query: ActivityLogsQueryType,
  ) {
    return this.activityLogsService.findAll(userId, organisationId, query);
  }
}
