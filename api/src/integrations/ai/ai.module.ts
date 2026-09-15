import { Module } from '@nestjs/common';
import { AiService } from './services/ai.service';
import { AiImageService } from './services/ai-image.service';
import { AiConfig } from './utils/ai.config';

@Module({
    imports: [],
    providers: [AiService, AiImageService, AiConfig],
    exports: [AiService, AiImageService],
})
export class AiIntegrationModule { }
