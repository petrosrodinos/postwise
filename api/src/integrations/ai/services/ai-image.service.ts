import { Injectable, Logger } from '@nestjs/common';
import { experimental_generateImage as generateImage } from 'ai';
import { openai } from '@ai-sdk/openai';

export interface GeneratedImage {
  base64: string;
  mimeType: string;
}

export interface GenerateImagesOptions {
  prompt: string;
  count: number;
  size?: `${number}x${number}`;
}

@Injectable()
export class AiImageService {
  private readonly logger = new Logger(AiImageService.name);

  async generateImages(options: GenerateImagesOptions): Promise<GeneratedImage[]> {
    try {
      const { images } = await generateImage({
        model: openai.image('gpt-image-1'),
        prompt: options.prompt,
        n: options.count,
        size: options.size,
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
