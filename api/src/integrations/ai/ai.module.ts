import { Module } from '@nestjs/common';
import { AiService } from './services/ai.service';
import { AiImageService } from './services/ai-image.service';
import { AiConfig } from './utils/ai.config';
import { AiUsageModule } from '@/modules/ai-usage/ai-usage.module';

@Module({
    imports: [AiUsageModule],
    providers: [AiService, AiImageService, AiConfig],
    exports: [AiService, AiImageService],
})
export class AiIntegrationModule { }
