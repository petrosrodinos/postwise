import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { TwitterService } from '@/integrations/social/twitter/services/twitter.service';
import { LinkedInService } from '@/integrations/social/linkedin/services/linkedin.service';
import { SanityService } from '@/integrations/cms/sanity/services/sanity.service';
import { OwnershipService } from '@/shared/services/ownership/ownership.service';
import { EncryptionService } from '@/shared/services/encryption/encryption.service';
import { AiContentAssistService } from '@/shared/services/ai-content-assist/ai-content-assist.service';
import { paginate, paginationMeta } from '@/shared/schemas/pagination.schema';
import { ErrorCodes } from '@/shared/config/error-codes';
import { ActivityLogsService } from '@/modules/activity-logs/activity-logs.service';
import { diffFields } from '@/modules/activity-logs/utils/activity-log.utils';
import {
  ActivityLogAction,
  ActivityLogEntityType,
  Integration,
  IntegrationProvider,
  IntegrationStatus,
  OrganisationRole,
  PostIntegrationStatus,
  PostStatus,
  PostType,
  Prisma,
} from 'generated/prisma';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { SchedulePostDto } from './dto/schedule-post.dto';
import { AddPostAttachmentDto } from './dto/add-post-attachment.dto';
import { RepurposePostDto } from '@/shared/dto/repurpose-content.dto';
import { RevisePostDto } from '@/shared/dto/revise-content.dto';
import { PostsQueryType } from './dto/posts-query.schema';

type PostWithAttachments = Prisma.PostGetPayload<{
  include: { attachments: { include: { document: true } } };
}>;

const MANAGE_ROLES: OrganisationRole[] = [
  OrganisationRole.OWNER,
  OrganisationRole.ADMIN,
];

// Which provider a post's own connected integrations must match to publish.
const PROVIDER_BY_TYPE: Record<PostType, IntegrationProvider> = {
  [PostType.BLOG]: IntegrationProvider.SANITY,
  [PostType.TWITTER]: IntegrationProvider.TWITTER,
  [PostType.LINKEDIN]: IntegrationProvider.LINKEDIN,
};

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownershipService: OwnershipService,
    private readonly twitterService: TwitterService,
    private readonly linkedInService: LinkedInService,
    private readonly sanityService: SanityService,
    private readonly encryptionService: EncryptionService,
    private readonly aiContentAssistService: AiContentAssistService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  private postLabel(post: {
    title?: string | null;
    hook?: string | null;
    type: PostType;
  }): string {
    return (
      post.title ?? post.hook ?? `Untitled ${post.type.toLowerCase()} post`
    );
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
    const context = await this.ownershipService.resolveContext(
      userId,
      dto.organisation_id,
    );

    if (dto.project_id) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.project_id },
      });
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
        return {
          generation_run_id: { not: null },
          automation_id: null,
          source_post_id: null,
        };
      case 'MANUAL':
        return {
          generation_run_id: null,
          automation_id: null,
          source_post_id: null,
        };
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
          generation_run: {
            select: {
              id: true,
              label: true,
              created_at: true,
              project_id: true,
            },
          },
          generation_item: { select: { id: true, topic: true, order: true } },
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
        integrations: true,
        automation: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } },
      },
    });
    if (!post) throw new NotFoundException('Post not found');

    const context = await this.ownershipService.resolveContext(
      userId,
      post.organisation_id,
    );

    return { post, role: context.role };
  }

  private canManage(
    post: { user_id: string; organisation_id: string },
    userId: string,
    role?: OrganisationRole,
  ) {
    if (post.user_id === userId) return true;
    return !!role && MANAGE_ROLES.includes(role);
  }

  private assertCanManage(
    post: { user_id: string; organisation_id: string },
    userId: string,
    role?: OrganisationRole,
  ) {
    if (!this.canManage(post, userId, role)) {
      throw new ForbiddenException(
        'You do not have permission to modify this post',
      );
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
      metadata: {
        changes: { scheduled_at: { from: post.scheduled_at, to: scheduledAt } },
      },
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

  // Calls the right provider wrapper for one connected integration, and
  // normalizes every provider's response into the same {external_id,
  // external_url} shape PostIntegration stores.
  private async publishToIntegration(
    post: PostWithAttachments,
    integration: Integration,
    coverImageUrl?: string,
  ): Promise<{ external_id: string; external_url: string }> {
    switch (integration.provider) {
      case IntegrationProvider.SANITY: {
        if (
          !integration.api_token_encrypted ||
          !integration.external_project_id ||
          !integration.external_dataset
        ) {
          throw new Error('Sanity integration is not fully configured');
        }
        return this.sanityService.publishDocument({
          projectId: integration.external_project_id,
          dataset: integration.external_dataset,
          apiToken: this.encryptionService.decrypt(
            integration.api_token_encrypted,
          ),
          documentType: integration.document_type ?? 'post',
          documentId: post.id,
          title: post.title,
          bodyHtml: post.body,
          excerpt: post.excerpt,
          seoTitle: post.seo_title,
          seoDescription: post.seo_description,
          canonicalUrl: post.canonical_url,
          coverImageUrl,
        });
      }
      case IntegrationProvider.TWITTER: {
        if (!integration.access_token_encrypted) {
          throw new Error('Twitter integration is not fully configured');
        }
        const result = await this.twitterService.publishTweet({
          accessToken: this.encryptionService.decrypt(
            integration.access_token_encrypted,
          ),
          text: [post.hook, post.body].filter(Boolean).join('\n\n'),
        });
        return {
          external_id: result.external_post_id,
          external_url: result.external_post_url,
        };
      }
      case IntegrationProvider.LINKEDIN: {
        if (
          !integration.access_token_encrypted ||
          !integration.external_account_id
        ) {
          throw new Error('LinkedIn integration is not fully configured');
        }
        const result = await this.linkedInService.publishPost({
          accessToken: this.encryptionService.decrypt(
            integration.access_token_encrypted,
          ),
          authorUrn: integration.external_account_id,
          text: [post.hook, post.body].filter(Boolean).join('\n\n'),
        });
        return {
          external_id: result.external_post_id,
          external_url: result.external_post_url,
        };
      }
    }
  }

  // Shared by the manual publish action and the scheduled-post background
  // job. Auto-targets every one of the post's organisation's CONNECTED
  // integrations matching the post's type — there is no manual per-post
  // target picker (an org typically has one account per provider). BLOG
  // posts with no connected Sanity integration just get an internal status
  // flip; TWITTER/LINKEDIN posts require at least one connected integration,
  // since a social post has no meaning without an external destination.
  async publishNow(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { attachments: { include: { document: true } } },
    });
    if (!post) throw new NotFoundException('Post not found');

    const provider = PROVIDER_BY_TYPE[post.type];
    const integrations = await this.prisma.integration.findMany({
      where: {
        organisation_id: post.organisation_id,
        provider,
        status: IntegrationStatus.CONNECTED,
      },
    });

    if (integrations.length === 0) {
      if (post.type === PostType.BLOG) {
        return this.prisma.post.update({
          where: { id: postId },
          data: {
            status: PostStatus.PUBLISHED,
            published_at: new Date(),
            failed_reason: null,
          },
        });
      }

      throw new BadRequestException({
        message: 'This post has no connected integrations to publish to',
        code: ErrorCodes.Posts.NO_INTEGRATIONS_TO_PUBLISH,
      });
    }

    for (const integration of integrations) {
      await this.prisma.postIntegration.upsert({
        where: {
          post_id_integration_id: {
            post_id: postId,
            integration_id: integration.id,
          },
        },
        update: {},
        create: { post_id: postId, integration_id: integration.id },
      });
    }

    await this.prisma.post.update({
      where: { id: postId },
      data: { status: PostStatus.PUBLISHING },
    });

    const targets = await this.prisma.postIntegration.findMany({
      where: { post_id: postId },
      include: { integration: true },
    });

    const coverImageUrl = post.attachments.find(
      (attachment) => attachment.document_id === post.cover_document_id,
    )?.document?.url;

    let successCount = 0;

    for (const target of targets) {
      try {
        const result = await this.publishToIntegration(
          post,
          target.integration,
          coverImageUrl,
        );

        await this.prisma.postIntegration.update({
          where: { id: target.id },
          data: {
            status: PostIntegrationStatus.PUBLISHED,
            external_id: result.external_id,
            external_url: result.external_url,
            published_at: new Date(),
            failed_reason: null,
          },
        });
        successCount++;
      } catch (error) {
        await this.prisma.postIntegration.update({
          where: { id: target.id },
          data: {
            status: PostIntegrationStatus.FAILED,
            failed_reason: error.message,
          },
        });
      }
    }

    const allFailed = successCount === 0;

    return this.prisma.post.update({
      where: { id: postId },
      data: allFailed
        ? {
            status: PostStatus.FAILED,
            failed_reason: 'All integrations failed to publish',
          }
        : {
            status: PostStatus.PUBLISHED,
            published_at: new Date(),
            failed_reason:
              successCount < targets.length
                ? `${targets.length - successCount} integration(s) failed to publish`
                : null,
          },
    });
  }

  async addAttachment(userId: string, id: string, dto: AddPostAttachmentDto) {
    const { post, role } = await this.findOwned(userId, id);
    this.assertCanManage(post, userId, role);

    const document = await this.prisma.document.findUnique({
      where: { id: dto.document_id },
    });
    if (!document) throw new NotFoundException('Document not found');
    this.assertSameOrganisation(document, post.organisation_id);

    const created = await this.prisma.postAttachment.create({
      data: {
        post_id: id,
        document_id: dto.document_id,
        order: dto.order ?? 0,
      },
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

    const attachment = await this.prisma.postAttachment.findUnique({
      where: { id: attachmentId },
    });
    if (!attachment || attachment.post_id !== id)
      throw new NotFoundException('Attachment not found');

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

  async repurpose(userId: string, id: string, dto: RepurposePostDto) {
    const { post, role } = await this.findOwned(userId, id);
    this.assertCanManage(post, userId, role);

    const created = await Promise.all(
      dto.target_types.map(async (targetType) => {
        const draft = await this.aiContentAssistService.repurposeContent({
          sourceType: post.type,
          targetType,
          title: post.title,
          hook: post.hook,
          body: post.body,
          excerpt: post.excerpt,
        });

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
            seo_title: draft.seo_title,
            seo_description: draft.seo_description,
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
      metadata: {
        target_types: dto.target_types,
        new_post_ids: created.map((c) => c.id),
      },
    });

    return created;
  }

  // Returns an AI-revised draft of the post without persisting it — the
  // caller reviews/edits the result client-side and saves it explicitly via
  // the regular update endpoint, same as any other manual edit.
  async revise(userId: string, id: string, dto: RevisePostDto) {
    if (!dto.preset && !dto.instructions) {
      throw new BadRequestException(
        'Provide a preset or instructions to revise this post',
      );
    }

    const { post, role } = await this.findOwned(userId, id);
    this.assertCanManage(post, userId, role);

    return this.aiContentAssistService.reviseContent({
      type: post.type,
      title: post.title,
      hook: post.hook,
      body: post.body,
      excerpt: post.excerpt,
      preset: dto.preset,
      instructions: dto.instructions,
    });
  }
}
