import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { AutomationsService } from './automations.service';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';
import { AutomationsQuerySchema, AutomationsQueryType } from './dto/automations-query.schema';
import { AutomationEntity } from './entities/automation.entity';

@ApiTags('automations')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('automations')
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a recurring generation automation for a project' })
  @ApiResponse({ status: 201, type: AutomationEntity })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateAutomationDto) {
    return this.automationsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List automations for a project' })
  @ApiQuery({ name: 'project_id', required: true })
  @ApiResponse({ status: 200 })
  findAll(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(AutomationsQuerySchema)) query: AutomationsQueryType,
  ) {
    return this.automationsService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an automation' })
  @ApiResponse({ status: 200, type: AutomationEntity })
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.automationsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an automation' })
  @ApiResponse({ status: 200, type: AutomationEntity })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAutomationDto,
  ) {
    return this.automationsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an automation' })
  @ApiResponse({ status: 200 })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.automationsService.remove(userId, id);
  }
}
