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
import { SocialChannelConnectionsService } from './social-channel-connections.service';
import { CreateSocialChannelConnectionDto } from './dto/create-social-channel-connection.dto';
import { UpdateSocialChannelConnectionDto } from './dto/update-social-channel-connection.dto';
import {
  SocialChannelConnectionsQuerySchema,
  SocialChannelConnectionsQueryType,
} from './dto/social-channel-connections-query.schema';
import { SocialChannelConnectionEntity } from './entities/social-channel-connection.entity';

@ApiTags('social-channel-connections')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('social-channel-connections')
export class SocialChannelConnectionsController {
  constructor(
    private readonly connectionsService: SocialChannelConnectionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Connect a social channel account' })
  @ApiResponse({ status: 201, type: SocialChannelConnectionEntity })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSocialChannelConnectionDto,
  ) {
    return this.connectionsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List connected social channels' })
  @ApiQuery({ name: 'organisation_id', required: false })
  @ApiQuery({ name: 'channel', required: false })
  @ApiResponse({ status: 200 })
  findAll(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(SocialChannelConnectionsQuerySchema))
    query: SocialChannelConnectionsQueryType,
  ) {
    return this.connectionsService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a social channel connection' })
  @ApiResponse({ status: 200, type: SocialChannelConnectionEntity })
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.connectionsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a social channel connection' })
  @ApiResponse({ status: 200, type: SocialChannelConnectionEntity })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSocialChannelConnectionDto,
  ) {
    return this.connectionsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Disconnect a social channel' })
  @ApiResponse({ status: 200 })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.connectionsService.remove(userId, id);
  }
}
