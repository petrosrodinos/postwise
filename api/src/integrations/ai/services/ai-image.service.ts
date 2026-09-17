import { Injectable, Logger } from '@nestjs/common';
import { experimental_generateImage as generateImage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { AiUsageType } from 'generated/prisma';
import { AiUsageService } from '@/modules/ai-usage/ai-usage.service';
import { AiUsageContext, AiProviders } from '../interfaces/ai.interface';
import { calculateAiImageCost } from '../utils/ai-cost';

export interface GeneratedImage {
  base64: string;
  mimeType: string;
}

const IMAGE_MODEL = 'gpt-image-1';

export interface GenerateImagesOptions {
  prompt: string;
  count: number;
  size?: `${number}x${number}`;
  usage: AiUsageContext;
}

@Injectable()
export class AiImageService {
  private readonly logger = new Logger(AiImageService.name);

  constructor(private readonly aiUsageService: AiUsageService) {}

  async generateImages(options: GenerateImagesOptions): Promise<GeneratedImage[]> {
    try {
      const { images } = await generateImage({
        model: openai.image(IMAGE_MODEL),
        prompt: options.prompt,
        n: options.count,
        size: options.size,
      });

      const { totalCost } = calculateAiImageCost({
        provider: AiProviders.openai,
        model: IMAGE_MODEL,
        size: options.size,
        count: options.count,
      });

      this.aiUsageService.record({
        ...options.usage,
        type: AiUsageType.IMAGE,
        provider: AiProviders.openai,
        model: IMAGE_MODEL,
        image_count: options.count,
        total_cost: totalCost,
      });

      return images.map((image) => ({
        base64: image.base64,
        mimeType: image.mimeType || 'image/png',
      }));
    } catch (error) {
      this.logger.error(`Error generating images: ${error.message}`);
      throw new Error(`Failed to generate images: ${error.message}`);
    }
  }
}
