import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { OrganisationsService } from './organisations.service';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { OrganisationEntity } from './entities/organisation.entity';

@ApiTags('organisations')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('organisations')
export class OrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an organisation workspace' })
  @ApiResponse({ status: 201, type: OrganisationEntity })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateOrganisationDto) {
    return this.organisationsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List organisations the current user belongs to' })
  @ApiResponse({ status: 200, type: [OrganisationEntity] })
  findAll(@CurrentUser('id') userId: string) {
    return this.organisationsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an organisation by id' })
  @ApiResponse({ status: 200, type: OrganisationEntity })
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.organisationsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an organisation (Owner/Admin only)' })
  @ApiResponse({ status: 200, type: OrganisationEntity })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateOrganisationDto,
  ) {
    return this.organisationsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an organisation (Owner only)' })
  @ApiResponse({ status: 200 })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.organisationsService.remove(userId, id);
  }
}
