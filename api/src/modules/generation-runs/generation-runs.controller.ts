import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { GenerationRunsService } from './generation-runs.service';
import { AddPostsToGenerationRunDto } from './dto/add-posts-to-generation-run.dto';
import { CreateGenerationRunDto } from './dto/create-generation-run.dto';
import { CreateRssGenerationRunDto } from './dto/create-rss-generation-run.dto';
import {
  GenerationRunsQuerySchema,
  GenerationRunsQueryType,
} from './dto/generation-runs-query.schema';
import { GenerationRunEntity } from './entities/generation-run.entity';

@ApiTags('generation-runs')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('generation-runs')
export class GenerationRunsController {
  constructor(private readonly generationRunsService: GenerationRunsService) {}

  @Post()
  @ApiOperation({ summary: 'Trigger an AI generation run for a project' })
  @ApiResponse({ status: 201, type: GenerationRunEntity })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateGenerationRunDto) {
    return this.generationRunsService.create(userId, dto);
  }

  @Post('from-rss')
  @ApiOperation({ summary: 'Generate blog posts from selected RSS feed items' })
  @ApiResponse({ status: 201, type: GenerationRunEntity })
  createFromRss(@CurrentUser('id') userId: string, @Body() dto: CreateRssGenerationRunDto) {
    return this.generationRunsService.createFromRssItems(userId, dto);
  }

  @Post(':id/generate-more')
  @ApiOperation({ summary: 'Generate more posts into an existing generation run' })
  @ApiResponse({ status: 201, type: GenerationRunEntity })
  addPosts(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AddPostsToGenerationRunDto,
  ) {
    return this.generationRunsService.addPosts(userId, id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List generation runs for a project' })
  @ApiQuery({ name: 'project_id', required: true })
  @ApiResponse({ status: 200 })
  findAll(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(GenerationRunsQuerySchema)) query: GenerationRunsQueryType,
  ) {
    return this.generationRunsService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a generation run and the posts it produced' })
  @ApiResponse({ status: 200, type: GenerationRunEntity })
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.generationRunsService.findOne(userId, id);
  }
}
