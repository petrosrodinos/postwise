import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { ToolsService } from './tools.service';
import { ReviseToolContentDto } from './dto/revise-tool-content.dto';
import { RepurposeToolContentDto } from './dto/repurpose-tool-content.dto';
import { GenerateTitleVariationsDto } from './dto/generate-title-variations.dto';
import { GenerateMetaTagsDto } from './dto/generate-meta-tags.dto';
import { GenerateToolImagesDto } from './dto/generate-tool-images.dto';

// Stateless AI writing tools for the standalone Tools page. Every endpoint
// takes the content directly in the request body and returns a result —
// nothing is read from or written to a database row.
@ApiTags('tools')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Post('revise')
  @ApiOperation({ summary: 'Use AI to revise the given content' })
  @ApiResponse({ status: 201 })
  revise(@CurrentUser('id') userId: string, @Body() dto: ReviseToolContentDto) {
    return this.toolsService.revise(userId, dto);
  }

  @Post('repurpose')
  @ApiOperation({
    summary: 'Use AI to repurpose the given content into other channel types',
  })
  @ApiResponse({ status: 201 })
  repurpose(
    @CurrentUser('id') userId: string,
    @Body() dto: RepurposeToolContentDto,
  ) {
    return this.toolsService.repurpose(userId, dto);
  }

  @Post('title-variations')
  @ApiOperation({
    summary: 'Use AI to generate alternative titles for the given content',
  })
  @ApiResponse({ status: 201 })
  generateTitleVariations(
    @CurrentUser('id') userId: string,
    @Body() dto: GenerateTitleVariationsDto,
  ) {
    return this.toolsService.generateTitleVariations(userId, dto);
  }

  @Post('meta-tags')
  @ApiOperation({
    summary: 'Use AI to generate SEO meta tags for the given content',
  })
  @ApiResponse({ status: 201 })
  generateMetaTags(
    @CurrentUser('id') userId: string,
    @Body() dto: GenerateMetaTagsDto,
  ) {
    return this.toolsService.generateMetaTags(userId, dto);
  }

  @Post('images')
  @ApiOperation({ summary: 'Use AI to generate candidate images' })
  @ApiResponse({ status: 201 })
  generateImages(
    @CurrentUser('id') userId: string,
    @Body() dto: GenerateToolImagesDto,
  ) {
    return this.toolsService.generateImages(userId, dto);
  }
}
