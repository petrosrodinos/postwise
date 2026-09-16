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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import {
  IntegrationsQuerySchema,
  IntegrationsQueryType,
} from './dto/integrations-query.schema';
import { IntegrationEntity } from './entities/integration.entity';

@ApiTags('integrations')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post()
  @ApiOperation({ summary: 'Connect an integration (e.g. Sanity)' })
  @ApiResponse({ status: 201, type: IntegrationEntity })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateIntegrationDto) {
    return this.integrationsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List connected integrations' })
  @ApiQuery({ name: 'organisation_id', required: false })
  @ApiQuery({ name: 'provider', required: false })
  @ApiResponse({ status: 200 })
  findAll(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(IntegrationsQuerySchema))
    query: IntegrationsQueryType,
  ) {
    return this.integrationsService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an integration' })
  @ApiResponse({ status: 200, type: IntegrationEntity })
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.integrationsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an integration' })
  @ApiResponse({ status: 200, type: IntegrationEntity })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateIntegrationDto,
  ) {
    return this.integrationsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Disconnect an integration' })
  @ApiResponse({ status: 200 })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.integrationsService.remove(userId, id);
  }
}
