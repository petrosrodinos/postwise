import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAiDto } from './dto/create-ai.dto';
import { AiService } from '@/integrations/ai/services/ai.service';
import { AiUsageFeature } from 'generated/prisma';

@Injectable()
export class InternalAiService {

  constructor(private readonly aiService: AiService) { }

  create(userId: string, createAiDto: CreateAiDto) {
    try {
      return this.aiService.generateText({
        provider: createAiDto.provider,
        model: createAiDto.model,
        system: createAiDto.system,
        prompt: createAiDto.prompt,
        temperature: createAiDto.temperature,
        maxTokens: createAiDto.maxTokens,
        topP: createAiDto.topP,
        usage: {
          organisation_id: null,
          user_id: userId,
          feature: AiUsageFeature.INTERNAL_PASSTHROUGH,
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }


}
