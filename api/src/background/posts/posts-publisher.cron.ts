import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { PostsService } from '@/modules/posts/posts.service';
import { PostStatus } from 'generated/prisma';

@Injectable()
export class PostsPublisherCronService {
  private readonly logger = new Logger(PostsPublisherCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly postsService: PostsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleDuePosts() {
    const due = await this.prisma.post.findMany({
      where: { status: PostStatus.SCHEDULED, scheduled_at: { lte: new Date() } },
    });

    for (const post of due) {
      try {
        await this.postsService.publishNow(post.id);
      } catch (error) {
        this.logger.error(`Post ${post.id} failed to publish: ${error.message}`);
        await this.prisma.post
          .update({
            where: { id: post.id },
            data: { status: PostStatus.FAILED, failed_reason: error.message },
          })
          .catch(() => {});
      }
    }
  }
}
