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
import { ActivityLogsService } from '@/modules/activity-logs/activity-logs.service';
import { diffFields } from '@/modules/activity-logs/utils/activity-log.utils';
import {
  ActivityLogAction,
  ActivityLogEntityType,
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
import { RevisePostDto, RevisePreset } from './dto/revise-post.dto';
import { PostsQueryType } from './dto/posts-query.schema';
import { z } from 'zod';

const MANAGE_ROLES: OrganisationRole[] = [OrganisationRole.OWNER, OrganisationRole.ADMIN];

const RepurposeDraftSchema = z.object({
  hook: z.string().optional(),
  body: z.string(),
  title: z.string().optional(),
  excerpt: z.string().optional(),
});

const ReviseDraftSchema = z.object({
  hook: z.string().optional(),
  body: z.string(),
  title: z.string().optional(),
  excerpt: z.string().optional(),
});

const REVISE_PRESET_INSTRUCTIONS: Record<RevisePreset, string> = {
  [RevisePreset.FRIENDLIER]: 'Rewrite it in a warmer, more approachable and friendly tone.',
  [RevisePreset.MORE_FORMAL]: 'Rewrite it in a more formal, professional tone.',
  [RevisePreset.LESS_FORMAL]: 'Rewrite it in a more casual, conversational tone.',
  [RevisePreset.SHORTER]: 'Make it significantly shorter and more concise while keeping the key message.',
  [RevisePreset.LONGER]: 'Expand it with more detail, examples or context while keeping the same core message.',
  [RevisePreset.SIMPLIFY]: 'Simplify the language — shorter sentences, plainer words, easier to read.',
  [RevisePreset.PUNCHIER]: 'Make the opening/hook more attention-grabbing and punchy, and tighten the rest.',
  [RevisePreset.FIX_GRAMMAR]: 'Fix any grammar, spelling and clarity issues without changing the meaning or tone.',
};

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownershipService: OwnershipService,
    private readonly twitterService: TwitterService,
    private readonly linkedInService: LinkedInService,
    private readonly aiService: AiService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  private postLabel(post: { title?: string | null; hook?: string | null; type: PostType }): string {
    return post.title ?? post.hook ?? `Untitled ${post.type.toLowerCase()} post`;
  }

  private assertSameOrganisation(
    resource: { organisation_id: string },
    organisationId: string,
  ) {
    if (resource.organisation_id !== organisationId) {
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
      this.assertSameOrganisation(project, context.organisation_id);
    }

    if (dto.style_profile_id) {
      const styleProfile = await this.prisma.styleProfile.findUnique({
        where: { id: dto.style_profile_id },
      });
      if (!styleProfile) throw new NotFoundException('Style profile not found');
      this.assertSameOrganisation(styleProfile, context.organisation_id);
    }

    const post = await this.prisma.post.create({
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

    this.activityLogsService.log({
      organisation_id: context.organisation_id,
      user_id: userId,
      action: ActivityLogAction.POST_CREATED,
      entity_type: ActivityLogEntityType.POST,
      entity_id: post.id,
      description: `Created ${post.type.toLowerCase()} post "${this.postLabel(post)}"`,
    });

    return post;
  }

  private sourceWhere(source: PostsQueryType['source']) {
    switch (source) {
      case 'AUTOMATION':
        return { automation_id: { not: null } };
      case 'REPURPOSED':
        return { source_post_id: { not: null }, automation_id: null };
      case 'GENERATED':
        return { generation_run_id: { not: null }, automation_id: null, source_post_id: null };
      case 'MANUAL':
        return { generation_run_id: null, automation_id: null, source_post_id: null };
      default:
        return {};
    }
  }

  async findAll(userId: string, query: PostsQueryType) {
    await this.ownershipService.resolveContext(userId, query.organisation_id);

    const where = {
      organisation_id: query.organisation_id,
      ...(query.project_id && { project_id: query.project_id }),
      ...(query.status && { status: query.status }),
      ...(query.type && { type: query.type }),
      ...(query.automation_id && { automation_id: query.automation_id }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' as const } },
          { hook: { contains: query.search, mode: 'insensitive' as const } },
          { body: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
      ...this.sourceWhere(query.source),
    };

    const { skip, take } = paginate(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take,
        orderBy: { [query.order_by]: query.order_direction },
        include: {
          automation: { select: { id: true, name: true } },
          project: { select: { id: true, title: true } },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return { data, pagination: paginationMeta(total, query.page, query.limit) };
  }

  private async findOwned(userId: string, id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        attachments: true,
        channels: true,
        automation: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } },
      },
    });
    if (!post) throw new NotFoundException('Post not found');

    const context = await this.ownershipService.resolveContext(userId, post.organisation_id);

    return { post, role: context.role };
  }

  private canManage(post: { user_id: string; organisation_id: string }, userId: string, role?: OrganisationRole) {
    if (post.user_id === userId) return true;
    return !!role && MANAGE_ROLES.includes(role);
  }

  private assertCanManage(post: { user_id: string; organisation_id: string }, userId: string, role?: OrganisationRole) {
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

    const updated = await this.prisma.post.update({
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

    this.activityLogsService.log({
      organisation_id: post.organisation_id,
      user_id: userId,
      action: ActivityLogAction.POST_UPDATED,
      entity_type: ActivityLogEntityType.POST,
      entity_id: post.id,
      description: `Updated ${updated.type.toLowerCase()} post "${this.postLabel(updated)}"`,
      metadata: {
        changes: diffFields(post, updated, [
          'project_id',
          'style_profile_id',
          'hook',
          'body',
          'title',
          'excerpt',
          'cover_document_id',
          'seo_title',
          'seo_description',
          'canonical_url',
          'status',
        ]),
      },
    });

    return updated;
  }

  async remove(userId: string, id: string) {
    const { post, role } = await this.findOwned(userId, id);
    this.assertCanManage(post, userId, role);

    await this.prisma.post.delete({ where: { id } });

    this.activityLogsService.log({
      organisation_id: post.organisation_id,
      user_id: userId,
      action: ActivityLogAction.POST_DELETED,
      entity_type: ActivityLogEntityType.POST,
      entity_id: post.id,
      description: `Deleted ${post.type.toLowerCase()} post "${this.postLabel(post)}"`,
    });

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

      for (const connectionId of dto.channel_connection_ids) {
        const connection = await this.prisma.socialChannelConnection.findUnique({
          where: { id: connectionId },
        });
        if (!connection) throw new NotFoundException(`Channel connection ${connectionId} not found`);
        this.assertSameOrganisation(connection, post.organisation_id);

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

    const scheduledAt = new Date(dto.scheduled_at);
    const updated = await this.prisma.post.update({
      where: { id },
      data: { status: PostStatus.SCHEDULED, scheduled_at: scheduledAt },
    });

    this.activityLogsService.log({
      organisation_id: post.organisation_id,
      user_id: userId,
      action: ActivityLogAction.POST_SCHEDULED,
      entity_type: ActivityLogEntityType.POST,
      entity_id: post.id,
      description: `Scheduled "${this.postLabel(post)}" for ${scheduledAt.toISOString()}`,
      metadata: { changes: { scheduled_at: { from: post.scheduled_at, to: scheduledAt } } },
    });

    return updated;
  }

  async publish(userId: string, id: string) {
    const { post, role } = await this.findOwned(userId, id);
    this.assertCanManage(post, userId, role);

    const published = await this.publishNow(id);

    this.activityLogsService.log({
      organisation_id: post.organisation_id,
      user_id: userId,
      action:
        published.status === PostStatus.FAILED
          ? ActivityLogAction.POST_PUBLISH_FAILED
          : ActivityLogAction.POST_PUBLISHED,
      entity_type: ActivityLogEntityType.POST,
      entity_id: post.id,
      description:
        published.status === PostStatus.FAILED
          ? `Failed to publish "${this.postLabel(post)}": ${published.failed_reason ?? 'unknown error'}`
          : `Published "${this.postLabel(post)}"`,
    });

    return published;
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
    this.assertSameOrganisation(document, post.organisation_id);

    const created = await this.prisma.postAttachment.create({
      data: { post_id: id, document_id: dto.document_id, order: dto.order ?? 0 },
    });

    this.activityLogsService.log({
      organisation_id: post.organisation_id,
      user_id: userId,
      action: ActivityLogAction.POST_ATTACHMENT_ADDED,
      entity_type: ActivityLogEntityType.POST,
      entity_id: post.id,
      description: `Added an attachment to "${this.postLabel(post)}"`,
      metadata: { document_id: dto.document_id },
    });

    return created;
  }

  async removeAttachment(userId: string, id: string, attachmentId: string) {
    const { post, role } = await this.findOwned(userId, id);
    this.assertCanManage(post, userId, role);

    const attachment = await this.prisma.postAttachment.findUnique({ where: { id: attachmentId } });
    if (!attachment || attachment.post_id !== id) throw new NotFoundException('Attachment not found');

    await this.prisma.postAttachment.delete({ where: { id: attachmentId } });

    this.activityLogsService.log({
      organisation_id: post.organisation_id,
      user_id: userId,
      action: ActivityLogAction.POST_ATTACHMENT_REMOVED,
      entity_type: ActivityLogEntityType.POST,
      entity_id: post.id,
      description: `Removed an attachment from "${this.postLabel(post)}"`,
      metadata: { document_id: attachment.document_id },
    });

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
    this.assertSameOrganisation(connection, post.organisation_id);

    if (String(connection.channel) !== String(post.type)) {
      throw new BadRequestException("This channel connection does not match the post's content type");
    }

    const created = await this.prisma.postChannel.create({
      data: { post_id: id, channel_connection_id: dto.channel_connection_id },
    });

    this.activityLogsService.log({
      organisation_id: post.organisation_id,
      user_id: userId,
      action: ActivityLogAction.POST_CHANNEL_ADDED,
      entity_type: ActivityLogEntityType.POST,
      entity_id: post.id,
      description: `Added a ${connection.channel.toLowerCase()} channel target to "${this.postLabel(post)}"`,
    });

    return created;
  }

  async removeChannel(userId: string, id: string, channelId: string) {
    const { post, role } = await this.findOwned(userId, id);
    this.assertCanManage(post, userId, role);

    const channel = await this.prisma.postChannel.findUnique({ where: { id: channelId } });
    if (!channel || channel.post_id !== id) throw new NotFoundException('Channel target not found');

    await this.prisma.postChannel.delete({ where: { id: channelId } });

    this.activityLogsService.log({
      organisation_id: post.organisation_id,
      user_id: userId,
      action: ActivityLogAction.POST_CHANNEL_REMOVED,
      entity_type: ActivityLogEntityType.POST,
      entity_id: post.id,
      description: `Removed a channel target from "${this.postLabel(post)}"`,
    });

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

    this.activityLogsService.log({
      organisation_id: post.organisation_id,
      user_id: userId,
      action: ActivityLogAction.POST_REPURPOSED,
      entity_type: ActivityLogEntityType.POST,
      entity_id: post.id,
      description: `Repurposed "${this.postLabel(post)}" into ${created.length} new post${created.length === 1 ? '' : 's'}`,
      metadata: { target_types: dto.target_types, new_post_ids: created.map((c) => c.id) },
    });

    return created;
  }

  // Returns an AI-revised draft of the post without persisting it — the
  // caller reviews/edits the result client-side and saves it explicitly via
  // the regular update endpoint, same as any other manual edit.
  async revise(userId: string, id: string, dto: RevisePostDto) {
    if (!dto.preset && !dto.instructions) {
      throw new BadRequestException('Provide a preset or instructions to revise this post');
    }

    const { post, role } = await this.findOwned(userId, id);
    this.assertCanManage(post, userId, role);

    const directions = [
      dto.preset ? REVISE_PRESET_INSTRUCTIONS[dto.preset] : null,
      dto.instructions ? `Additional instructions: ${dto.instructions}` : null,
    ]
      .filter(Boolean)
      .join(' ');

    const isBlog = post.type === PostType.BLOG;
    const shape = isBlog
      ? '{ "title": string, "excerpt": string, "body": string }'
      : '{ "hook": string, "body": string }';

    const prompt = `Revise the following ${post.type} post. ${directions}

Return ONLY a raw JSON object (no markdown) shaped exactly like ${shape}. Preserve the author's core message and intent.

${isBlog ? `Current title: ${post.title ?? 'n/a'}\nCurrent excerpt: ${post.excerpt ?? 'n/a'}\n` : post.hook ? `Current hook: ${post.hook}\n` : ''}Current body:
${post.body ?? ''}`;

    const { response } = await this.aiService.generateText({
      prompt,
      system: 'You are an expert editor who revises social media and blog content on request.',
      temperature: 0.6,
    });

    return parseAiJson(response, ReviseDraftSchema);
  }
}
