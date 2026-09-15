import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { PostsService } from '@/modules/posts/posts.service';
import { ActivityLogsService } from '@/modules/activity-logs/activity-logs.service';
import { ActivityLogAction, ActivityLogEntityType, PostStatus } from 'generated/prisma';

@Injectable()
export class PostsPublisherCronService {
  private readonly logger = new Logger(PostsPublisherCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly postsService: PostsService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleDuePosts() {
    const due = await this.prisma.post.findMany({
      where: { status: PostStatus.SCHEDULED, scheduled_at: { lte: new Date() } },
    });

    for (const post of due) {
      try {
        const published = await this.postsService.publishNow(post.id);

        this.activityLogsService.log({
          organisation_id: post.organisation_id,
          user_id: null,
          action:
            published.status === PostStatus.FAILED
              ? ActivityLogAction.POST_PUBLISH_FAILED
              : ActivityLogAction.POST_PUBLISHED,
          entity_type: ActivityLogEntityType.POST,
          entity_id: post.id,
          description:
            published.status === PostStatus.FAILED
              ? `System failed to auto-publish "${post.title ?? post.hook ?? 'a scheduled post'}": ${published.failed_reason ?? 'unknown error'}`
              : `System auto-published "${post.title ?? post.hook ?? 'a scheduled post'}"`,
        });
      } catch (error) {
        this.logger.error(`Post ${post.id} failed to publish: ${error.message}`);
        await this.prisma.post
          .update({
            where: { id: post.id },
            data: { status: PostStatus.FAILED, failed_reason: error.message },
          })
          .catch(() => {});

        this.activityLogsService.log({
          organisation_id: post.organisation_id,
          user_id: null,
          action: ActivityLogAction.POST_PUBLISH_FAILED,
          entity_type: ActivityLogEntityType.POST,
          entity_id: post.id,
          description: `System failed to auto-publish "${post.title ?? post.hook ?? 'a scheduled post'}": ${error.message}`,
        });
      }
    }
  }
}
