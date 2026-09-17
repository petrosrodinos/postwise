import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailModule } from './modules/internal/mail/mail.module';
import { SmsModule } from './modules/internal/sms/sms.module';
import { AiModule } from './modules/internal/ai/ai.module';
import { RedisModule } from './core/databases/redis/redis.module';
import { RedisCacheModule } from './modules/internal/redis-cache/redis-cache.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { ConfigModule } from './shared/config/env/env.module';
import { UsersModule } from './modules/users/users.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { OrganisationsModule } from './modules/organisations/organisations.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { StyleProfilesModule } from './modules/style-profiles/style-profiles.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { GenerationRunsModule } from './modules/generation-runs/generation-runs.module';
import { AutomationsModule } from './modules/automations/automations.module';
import { PostsModule } from './modules/posts/posts.module';
import { ToolsModule } from './modules/tools/tools.module';
import { RssFeedsModule } from './modules/rss-feeds/rss-feeds.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { AiUsageModule } from './modules/ai-usage/ai-usage.module';
import { BackgroundModule } from './background/background.module';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    MailModule,
    SmsModule,
    AiModule,
    RedisModule,
    RedisCacheModule,
    // GraphQLModule,
    AuthModule,
    HealthModule,
    UsersModule,
    DocumentsModule,
    OrganisationsModule,
    IntegrationsModule,
    StyleProfilesModule,
    ProjectsModule,
    GenerationRunsModule,
    AutomationsModule,
    PostsModule,
    ToolsModule,
    RssFeedsModule,
    ActivityLogsModule,
    AiUsageModule,
    BackgroundModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
