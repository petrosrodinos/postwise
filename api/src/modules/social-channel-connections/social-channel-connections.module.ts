import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { OwnershipModule } from '@/shared/services/ownership/ownership.module';
import { ActivityLogsModule } from '@/modules/activity-logs/activity-logs.module';
import { SocialChannelConnectionsController } from './social-channel-connections.controller';
import { SocialChannelConnectionsService } from './social-channel-connections.service';

@Module({
  imports: [PrismaModule, OwnershipModule, ActivityLogsModule],
  controllers: [SocialChannelConnectionsController],
  providers: [SocialChannelConnectionsService],
  exports: [SocialChannelConnectionsService],
})
export class SocialChannelConnectionsModule {}
