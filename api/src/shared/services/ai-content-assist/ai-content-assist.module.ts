import { Module } from '@nestjs/common';
import { AiIntegrationModule } from '@/integrations/ai/ai.module';
import { AiContentAssistService } from './ai-content-assist.service';

@Module({
  imports: [AiIntegrationModule],
  providers: [AiContentAssistService],
  exports: [AiContentAssistService],
})
export class AiContentAssistModule {}
