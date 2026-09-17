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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AttachStyleProfileDto } from './dto/attach-style-profile.dto';
import { AttachRssFeedDto } from './dto/attach-rss-feed.dto';
import { GenerateProjectDetailsDto } from './dto/generate-project-details.dto';
import { ProjectsQuerySchema, ProjectsQueryType } from './dto/projects-query.schema';
import { ProjectEntity } from './entities/project.entity';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a project' })
  @ApiResponse({ status: 201, type: ProjectEntity })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(userId, dto);
  }

  @Post('generate-details')
  @ApiOperation({
    summary: 'Use AI to suggest content pillars, ideas and instructions for a new project',
  })
  @ApiResponse({ status: 201 })
  generateDetails(
    @CurrentUser('id') userId: string,
    @Body() dto: GenerateProjectDetailsDto,
  ) {
    return this.projectsService.generateDetails(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List projects' })
  @ApiQuery({ name: 'organisation_id', required: false })
  @ApiQuery({ name: 'platform', required: false })
  @ApiQuery({ name: 'is_archived', required: false })
  @ApiResponse({ status: 200 })
  findAll(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(ProjectsQuerySchema)) query: ProjectsQueryType,
  ) {
    return this.projectsService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project, including its attached style profiles' })
  @ApiResponse({ status: 200, type: ProjectEntity })
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.projectsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: 200, type: ProjectEntity })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: 200 })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.projectsService.remove(userId, id);
  }

  @Post(':id/style-profiles')
  @ApiOperation({ summary: 'Attach a style profile to a project' })
  @ApiResponse({ status: 201 })
  attachStyleProfile(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AttachStyleProfileDto,
  ) {
    return this.projectsService.attachStyleProfile(userId, id, dto);
  }

  @Delete(':id/style-profiles/:styleProfileId')
  @ApiOperation({ summary: 'Detach a style profile from a project' })
  @ApiResponse({ status: 200 })
  detachStyleProfile(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Param('styleProfileId') styleProfileId: string,
  ) {
    return this.projectsService.detachStyleProfile(userId, id, styleProfileId);
  }

  @Post(':id/rss-feeds')
  @ApiOperation({ summary: 'Attach an RSS feed to a project' })
  @ApiResponse({ status: 201 })
  attachRssFeed(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AttachRssFeedDto,
  ) {
    return this.projectsService.attachRssFeed(userId, id, dto);
  }

  @Delete(':id/rss-feeds/:rssFeedId')
  @ApiOperation({ summary: 'Detach an RSS feed from a project' })
  @ApiResponse({ status: 200 })
  detachRssFeed(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Param('rssFeedId') rssFeedId: string,
  ) {
    return this.projectsService.detachRssFeed(userId, id, rssFeedId);
  }
}
