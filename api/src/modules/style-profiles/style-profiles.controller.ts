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
import { StyleProfilesService } from './style-profiles.service';
import { CreateStyleProfileDto } from './dto/create-style-profile.dto';
import { UpdateStyleProfileDto } from './dto/update-style-profile.dto';
import { AnalyzeStyleProfileDto } from './dto/analyze-style-profile.dto';
import { ScrapeLinkedInPostsDto } from './dto/scrape-linkedin-posts.dto';
import {
  StyleProfilesQuerySchema,
  StyleProfilesQueryType,
} from './dto/style-profiles-query.schema';
import { StyleProfileEntity } from './entities/style-profile.entity';

@ApiTags('style-profiles')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('style-profiles')
export class StyleProfilesController {
  constructor(private readonly styleProfilesService: StyleProfilesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a style profile' })
  @ApiResponse({ status: 201, type: StyleProfileEntity })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateStyleProfileDto,
  ) {
    return this.styleProfilesService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List style profiles' })
  @ApiQuery({ name: 'organisation_id', required: false })
  @ApiQuery({ name: 'platform', required: false })
  @ApiResponse({ status: 200 })
  findAll(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(StyleProfilesQuerySchema))
    query: StyleProfilesQueryType,
  ) {
    return this.styleProfilesService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a style profile' })
  @ApiResponse({ status: 200, type: StyleProfileEntity })
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.styleProfilesService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a style profile' })
  @ApiResponse({ status: 200, type: StyleProfileEntity })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStyleProfileDto,
  ) {
    return this.styleProfilesService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a style profile' })
  @ApiResponse({ status: 200 })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.styleProfilesService.remove(userId, id);
  }

  @Post(':id/analyze')
  @ApiOperation({
    summary: "Re-analyze a style profile's tone/structure from sample posts",
  })
  @ApiResponse({ status: 200, type: StyleProfileEntity })
  analyze(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AnalyzeStyleProfileDto,
  ) {
    return this.styleProfilesService.analyze(userId, id, dto);
  }

  @Post(':id/scrape-posts')
  @ApiOperation({
    summary:
      "Scrape a LinkedIn style profile's recent posts for review before analysis",
  })
  @ApiResponse({ status: 200 })
  scrapePosts(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ScrapeLinkedInPostsDto,
  ) {
    return this.styleProfilesService.scrapeLinkedInPosts(userId, id, dto);
  }
}
