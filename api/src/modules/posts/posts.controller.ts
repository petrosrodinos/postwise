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
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { SchedulePostDto } from './dto/schedule-post.dto';
import { AddPostAttachmentDto } from './dto/add-post-attachment.dto';
import { AddPostChannelDto } from './dto/add-post-channel.dto';
import { RepurposePostDto } from '@/shared/dto/repurpose-content.dto';
import { RevisePostDto } from '@/shared/dto/revise-content.dto';
import { PostsQuerySchema, PostsQueryType } from './dto/posts-query.schema';
import { PostEntity } from './entities/post.entity';

@ApiTags('posts')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a post' })
  @ApiResponse({ status: 201, type: PostEntity })
  create(@CurrentUser('id') userId: string, @Body() dto: CreatePostDto) {
    return this.postsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List posts' })
  @ApiQuery({ name: 'organisation_id', required: false })
  @ApiQuery({ name: 'project_id', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'automation_id', required: false })
  @ApiQuery({
    name: 'source',
    required: false,
    enum: ['MANUAL', 'GENERATED', 'AUTOMATION', 'REPURPOSED'],
  })
  @ApiQuery({
    name: 'order_by',
    required: false,
    enum: ['created_at', 'updated_at', 'scheduled_at'],
  })
  @ApiQuery({ name: 'order_direction', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200 })
  findAll(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(PostsQuerySchema)) query: PostsQueryType,
  ) {
    return this.postsService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a post, including its attachments and channel targets',
  })
  @ApiResponse({ status: 200, type: PostEntity })
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.postsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiResponse({ status: 200, type: PostEntity })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiResponse({ status: 200 })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.postsService.remove(userId, id);
  }

  @Post(':id/schedule')
  @ApiOperation({ summary: 'Schedule a post for future publishing' })
  @ApiResponse({ status: 200, type: PostEntity })
  schedule(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: SchedulePostDto,
  ) {
    return this.postsService.schedule(userId, id, dto);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a post immediately' })
  @ApiResponse({ status: 200, type: PostEntity })
  publish(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.postsService.publish(userId, id);
  }

  @Post(':id/repurpose')
  @ApiOperation({
    summary: 'Use AI to repurpose a post into other content types',
  })
  @ApiResponse({ status: 201, type: [PostEntity] })
  repurpose(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: RepurposePostDto,
  ) {
    return this.postsService.repurpose(userId, id, dto);
  }

  @Post(':id/revise')
  @ApiOperation({
    summary:
      'Use AI to revise a post, returning a draft to review before saving',
  })
  @ApiResponse({ status: 201 })
  revise(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: RevisePostDto,
  ) {
    return this.postsService.revise(userId, id, dto);
  }

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Attach a document to a post' })
  @ApiResponse({ status: 201 })
  addAttachment(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AddPostAttachmentDto,
  ) {
    return this.postsService.addAttachment(userId, id, dto);
  }

  @Delete(':id/attachments/:attachmentId')
  @ApiOperation({ summary: 'Remove an attachment from a post' })
  @ApiResponse({ status: 200 })
  removeAttachment(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.postsService.removeAttachment(userId, id, attachmentId);
  }

  @Post(':id/channels')
  @ApiOperation({ summary: 'Add a social channel target to a post' })
  @ApiResponse({ status: 201 })
  addChannel(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AddPostChannelDto,
  ) {
    return this.postsService.addChannel(userId, id, dto);
  }

  @Delete(':id/channels/:channelId')
  @ApiOperation({ summary: 'Remove a social channel target from a post' })
  @ApiResponse({ status: 200 })
  removeChannel(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Param('channelId') channelId: string,
  ) {
    return this.postsService.removeChannel(userId, id, channelId);
  }
}
