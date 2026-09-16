import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { AiIntegrationModule } from '@/integrations/ai/ai.module';
import { AiContentAssistModule } from '@/shared/services/ai-content-assist/ai-content-assist.module';
import { OwnershipModule } from '@/shared/services/ownership/ownership.module';
import { ToolsController } from './tools.controller';
import { ToolsService } from './tools.service';

@Module({
  imports: [
    PrismaModule,
    AiIntegrationModule,
    AiContentAssistModule,
    OwnershipModule,
  ],
  controllers: [ToolsController],
  providers: [ToolsService],
})
export class ToolsModule {}
