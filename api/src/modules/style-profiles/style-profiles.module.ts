import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { AiIntegrationModule } from '@/integrations/ai/ai.module';
import { OwnershipModule } from '@/shared/services/ownership/ownership.module';
import { StyleProfilesController } from './style-profiles.controller';
import { StyleProfilesService } from './style-profiles.service';

@Module({
  imports: [PrismaModule, AiIntegrationModule, OwnershipModule],
  controllers: [StyleProfilesController],
  providers: [StyleProfilesService],
  exports: [StyleProfilesService],
})
export class StyleProfilesModule {}
