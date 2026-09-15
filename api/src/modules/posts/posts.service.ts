import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AiService } from '@/integrations/ai/services/ai.service';
import { TwitterService } from '@/integrations/social/twitter/services/twitter.service';
import { LinkedInService } from '@/integrations/social/linkedin/services/linkedin.service';
import { OwnershipService } from '@/shared/services/ownership/ownership.service';
import { parseAiJson } from '@/shared/utils/ai/parse-ai-json.util';
import { paginate, paginationMeta } from '@/shared/schemas/pagination.schema';
import { ErrorCodes } from '@/shared/config/error-codes';
import {
  OrganisationRole,
  PostChannelStatus,
  PostStatus,
  PostType,
} from 'generated/prisma';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { SchedulePostDto } from './dto/schedule-post.dto';
import { AddPostAttachmentDto } from './dto/add-post-attachment.dto';
import { AddPostChannelDto } from './dto/add-post-channel.dto';
import { RepurposePostDto } from './dto/repurpose-post.dto';
import { PostsQueryType } from './dto/posts-query.schema';
import { z } from 'zod';

const MANAGE_ROLES: OrganisationRole[] = [OrganisationRole.OWNER, OrganisationRole.ADMIN];

const RepurposeDraftSchema = z.object({
  hook: z.string().optional(),
  body: z.string(),
  title: z.string().optional(),
  excerpt: z.string().optional(),
});

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownershipService: OwnershipService,
    private readonly twitterService: TwitterService,
    private readonly linkedInService: LinkedInService,
    private readonly aiService: AiService,
  ) {}

  private async assertSameOwnerContext(
    resourceOwner: { organisation_id?: string | null; user_id?: string | null; user_uuid?: string | null },
    context: { organisation_id?: string; user_id?: string },
  ) {
    const resourceUserId = resourceOwner.user_id ?? resourceOwner.user_uuid ?? null;
    const matches = context.organisation_id
      ? resourceOwner.organisation_id === context.organisation_id
      : resourceUserId === context.user_id;

    if (!matches) {
      throw new BadRequestException({
        message: 'Resource must belong to the same owner context as the post',
        code: ErrorCodes.Posts.INVALID_OWNER_CONTEXT,
      });
    }
  }

  async create(userId: string, dto: CreatePostDto) {
    const context = await this.ownershipService.resolveContext(userId, dto.organisation_id);

    if (dto.project_id) {
      const project = await this.prisma.project.findUnique({ where: { id: dto.project_id } });
      if (!project) throw new NotFoundException('Project not found');
      await this.assertSameOwnerContext(project, context);
    }

    if (dto.style_profile_id) {
      const styleProfile = await this.prisma.styleProfile.findUnique({
        where: { id: dto.style_profile_id },
      });
      if (!styleProfile) throw new NotFoundException('Style profile not found');
      await this.assertSameOwnerContext(styleProfile, context);
    }

    return this.prisma.post.create({
      data: {
        user_id: userId,
        organisation_id: context.organisation_id,
        project_id: dto.project_id,
        style_profile_id: dto.style_profile_id,
        type: dto.type,
        hook: dto.hook,
        body: dto.body,
        title: dto.title,
        excerpt: dto.excerpt,
        cover_document_id: dto.cover_document_id,
        seo_title: dto.seo_title,
        seo_description: dto.seo_description,
        canonical_url: dto.canonical_url,
        metadata: dto.metadata as any,
      },
    });
  }

  async findAll(userId: string, query: PostsQueryType) {
    if (query.organisation_id) {
      await this.ownershipService.resolveContext(userId, query.organisation_id);
    }

    const where = {
      ...(query.organisation_id
        ? { organisation_id: query.organisation_id }
        : { user_id: userId }),
      ...(query.project_id && { project_id: query.project_id }),
      ...(query.status && { status: query.status }),
      ...(query.type && { type: query.type }),
    };

    const { skip, take } = paginate(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.post.count({ where }),
    ]);

    return { data, pagination: paginationMeta(total, query.page, query.limit) };
  }

  private async findOwned(userId: string, id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { attachments: true, channels: true },
    });
    if (!post) throw new NotFoundException('Post not found');

    let role: OrganisationRole | undefined;
    if (post.organisation_id) {
      const context = await this.ownershipService.resolveContext(userId, post.organisation_id);
      role = context.role;
    } else if (post.user_id !== userId) {
      throw new ForbiddenException('You do not have access to this post');
    }

    return { post, role };
  }

  private canManage(post: { user_id: string; organisation_id?: string | null }, userId: string, role?: OrganisationRole) {
    if (post.user_id === userId) return true;
    return !!post.organisation_id && !!role && MANAGE_ROLES.includes(role);
  }

  private assertCanManage(post: { user_id: string; organisation_id?: string | null }, userId: string, role?: OrganisationRole) {
    if (!this.canManage(post, userId, role)) {
      throw new ForbiddenException('You do not have permission to modify this post');
    }
  }

  async findOne(userId: string, id: string) {
    const { post } = await this.findOwned(userId, id);
    return post;
  }

  async update(userId: string, id: string, dto: UpdatePostDto) {
    const { post, role } = await this.findOwned(userId, id);
    this.assertCanManage(post, userId, role);

    return this.prisma.post.update({
      where: { id },
      data: {
        project_id: dto.project_id,
        style_profile_id: dto.style_profile_id,
        hook: dto.hook,
        body: dto.body,
        title: dto.title,
        excerpt: dto.excerpt,
        cover_document_id: dto.cover_document_id,
        seo_title: dto.seo_title,
        seo_description: dto.seo_description,
        canonical_url: dto.canonical_url,
        metadata: dto.metadata as any,
        status: dto.status,
      },
    });
  }

  async remove(userId: string, id: string) {
    const { post, role } = await this.findOwned(userId, id);
    this.assertCanManage(post, userId, role);

    await this.prisma.post.delete({ where: { id } });
    return { message: 'Post deleted successfully' };
  }

  async schedule(userId: string, id: string, dto: SchedulePostDto) {
    const { post, role } = await this.findOwned(userId, id);
    this.assertCanManage(post, userId, role);

    if (post.type !== PostType.BLOG) {
      if (!dto.channel_connection_ids || dto.channel_connection_ids.length === 0) {
        throw new BadRequestException({
          message: 'At least one channel connection is required to schedule this post',
          code: ErrorCodes.Posts.NO_CHANNELS_TO_PUBLISH,
        });
      }

      const context = { organisation_id: post.organisation_id ?? undefined, user_id: post.user_id };

      for (const connectionId of dto.channel_connection_ids) {
        const connection = await this.prisma.socialChannelConnection.findUnique({
          where: { id: connectionId },
        });
        if (!connection) throw new NotFoundException(`Channel connection ${connectionId} not found`);
        await this.assertSameOwnerContext(connection, context);

        if (String(connection.channel) !== String(post.type)) {
          throw new BadRequestException(
            `Channel connection ${connectionId} does not match the post's content type`,
          );
        }

        const existing = await this.prisma.postChannel.findUnique({
          where: {
            post_id_channel_connection_id: { post_id: id, channel_connection_id: connectionId },
          },
        });
        if (!existing) {
          await this.prisma.postChannel.create({
            data: { post_id: id, channel_connection_id: connectionId },
          });
        }
      }
    }

    return this.prisma.post.update({
      where: { id },
      data: { status: PostStatus.SCHEDULED, scheduled_at: new Date(dto.scheduled_at) },
    });
  }

  async publish(userId: string, id: string) {
    const { post, role } = await this.findOwned(userId, id);
    this.assertCanManage(post, userId, role);

    return this.publishNow(id);
  }

  // Shared by the manual publish action and the scheduled-post background job.
  async publishNow(postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    if (post.type === PostType.BLOG) {
      return this.prisma.post.update({
        where: { id: postId },
        data: { status: PostStatus.PUBLISHED, published_at: new Date(), failed_reason: null },
      });
    }

    const channels = await this.prisma.postChannel.findMany({
      where: { post_id: postId },
      include: { channel_connection: true },
    });

    if (channels.length === 0) {
      throw new BadRequestException({
        message: 'This post has no channels to publish to',
        code: ErrorCodes.Posts.NO_CHANNELS_TO_PUBLISH,
      });
    }

    await this.prisma.post.update({ where: { id: postId }, data: { status: PostStatus.PUBLISHING } });

    let successCount = 0;

    for (const channel of channels) {
      try {
        const connection = channel.channel_connection;
        const result =
          String(connection.channel) === PostType.TWITTER
            ? await this.twitterService.publishTweet({
                accessToken: connection.access_token,
                text: [post.hook, post.body].filter(Boolean).join('\n\n'),
              })
            : await this.linkedInService.publishPost({
                accessToken: connection.access_token,
                authorUrn: connection.external_account_id,
                text: [post.hook, post.body].filter(Boolean).join('\n\n'),
              });

        await this.prisma.postChannel.update({
          where: { id: channel.id },
          data: {
            status: PostChannelStatus.PUBLISHED,
            external_post_id: result.external_post_id,
            external_post_url: result.external_post_url,
            published_at: new Date(),
            failed_reason: null,
          },
        });
        successCount++;
      } catch (error) {
        await this.prisma.postChannel.update({
          where: { id: channel.id },
          data: { status: PostChannelStatus.FAILED, failed_reason: error.message },
        });
      }
    }

    const allFailed = successCount === 0;

    return this.prisma.post.update({
      where: { id: postId },
      data: allFailed
        ? {
            status: PostStatus.FAILED,
            failed_reason: 'All channels failed to publish',
          }
        : {
            status: PostStatus.PUBLISHED,
            published_at: new Date(),
            failed_reason:
              successCount < channels.length
                ? `${channels.length - successCount} channel(s) failed to publish`
                : null,
          },
    });
  }

  async addAttachment(userId: string, id: string, dto: AddPostAttachmentDto) {
    const { post, role } = await this.findOwned(userId, id);
    this.assertCanManage(post, userId, role);

    const document = await this.prisma.document.findUnique({ where: { id: dto.document_id } });
    if (!document) throw new NotFoundException('Document not found');
    await this.assertSameOwnerContext(document, {
      organisation_id: post.organisation_id ?? undefined,
      user_id: post.user_id,
    });

    return this.prisma.postAttachment.create({
      data: { post_id: id, document_id: dto.document_id, order: dto.order ?? 0 },
    });
  }

  async removeAttachment(userId: string, id: string, attachmentId: string) {
    const { post, role } = await this.findOwned(userId, id);
    this.assertCanManage(post, userId, role);

    const attachment = await this.prisma.postAttachment.findUnique({ where: { id: attachmentId } });
    if (!attachment || attachment.post_id !== id) throw new NotFoundException('Attachment not found');

    await this.prisma.postAttachment.delete({ where: { id: attachmentId } });
    return { message: 'Attachment removed successfully' };
  }

  async addChannel(userId: string, id: string, dto: AddPostChannelDto) {
    const { post, role } = await this.findOwned(userId, id);
    this.assertCanManage(post, userId, role);

    if (post.type === PostType.BLOG) {
      throw new BadRequestException('Blog posts do not publish to social channels');
    }

    const connection = await this.prisma.socialChannelConnection.findUnique({
      where: { id: dto.channel_connection_id },
    });
    if (!connection) throw new NotFoundException('Channel connection not found');
    await this.assertSameOwnerContext(connection, {
      organisation_id: post.organisation_id ?? undefined,
      user_id: post.user_id,
    });

    if (String(connection.channel) !== String(post.type)) {
      throw new BadRequestException("This channel connection does not match the post's content type");
    }

    return this.prisma.postChannel.create({
      data: { post_id: id, channel_connection_id: dto.channel_connection_id },
    });
  }

  async removeChannel(userId: string, id: string, channelId: string) {
    const { post, role } = await this.findOwned(userId, id);
    this.assertCanManage(post, userId, role);

    const channel = await this.prisma.postChannel.findUnique({ where: { id: channelId } });
    if (!channel || channel.post_id !== id) throw new NotFoundException('Channel target not found');

    await this.prisma.postChannel.delete({ where: { id: channelId } });
    return { message: 'Channel target removed successfully' };
  }

  async repurpose(userId: string, id: string, dto: RepurposePostDto) {
    const { post, role } = await this.findOwned(userId, id);
    this.assertCanManage(post, userId, role);

    const source = [post.title, post.hook, post.body].filter(Boolean).join('\n\n');

    const created = await Promise.all(
      dto.target_types.map(async (targetType) => {
        const shape =
          targetType === PostType.BLOG
            ? '{ "title": string, "excerpt": string, "body": string }'
            : '{ "hook": string, "body": string }';

        const { response } = await this.aiService.generateText({
          prompt: `Repurpose the following content into a single ${targetType} post. Return ONLY a raw JSON object (no markdown) shaped exactly like ${shape}.\n\nSource content:\n${source}`,
          system: 'You are an expert content repurposing assistant.',
          temperature: 0.7,
        });

        const draft = parseAiJson(response, RepurposeDraftSchema);

        return this.prisma.post.create({
          data: {
            user_id: userId,
            organisation_id: post.organisation_id,
            project_id: post.project_id,
            style_profile_id: post.style_profile_id,
            source_post_id: post.id,
            type: targetType,
            status: PostStatus.DRAFT,
            hook: draft.hook,
            body: draft.body,
            title: draft.title,
            excerpt: draft.excerpt,
          },
        });
      }),
    );

    return created;
  }
}
