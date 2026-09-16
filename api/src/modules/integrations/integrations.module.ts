import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { OwnershipModule } from '@/shared/services/ownership/ownership.module';
import { EncryptionModule } from '@/shared/services/encryption/encryption.module';
import { ActivityLogsModule } from '@/modules/activity-logs/activity-logs.module';
import { SanityIntegrationModule } from '@/integrations/cms/sanity/sanity.module';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';

@Module({
  imports: [
    PrismaModule,
    OwnershipModule,
    EncryptionModule,
    ActivityLogsModule,
    SanityIntegrationModule,
  ],
  controllers: [IntegrationsController],
  providers: [IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
