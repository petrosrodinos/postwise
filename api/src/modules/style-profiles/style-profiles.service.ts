import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AiService } from '@/integrations/ai/services/ai.service';
import { OwnershipService } from '@/shared/services/ownership/ownership.service';
import { parseAiJson } from '@/shared/utils/ai/parse-ai-json.util';
import { OrganisationRole } from 'generated/prisma';
import { CreateStyleProfileDto } from './dto/create-style-profile.dto';
import { UpdateStyleProfileDto } from './dto/update-style-profile.dto';
import { AnalyzeStyleProfileDto } from './dto/analyze-style-profile.dto';
import { StyleProfilesQueryType } from './dto/style-profiles-query.schema';
import { paginate, paginationMeta } from '@/shared/schemas/pagination.schema';

const MANAGE_ROLES: OrganisationRole[] = [OrganisationRole.OWNER, OrganisationRole.ADMIN];

const AnalysisSchema = z.object({
  tone_score: z.number().min(0).max(100),
  structure_score: z.number().min(0).max(100),
  hooks_score: z.number().min(0).max(100),
  vocabulary_score: z.number().min(0).max(100),
  rhythm_score: z.number().min(0).max(100),
  tone_description: z.string(),
  dominant_hook: z.string(),
  vocabulary: z.array(z.string()),
  pillars: z.array(z.string()),
});

@Injectable()
export class StyleProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly ownershipService: OwnershipService,
  ) {}

  async create(userId: string, dto: CreateStyleProfileDto) {
    const context = await this.ownershipService.resolveContext(userId, dto.organisation_id);
    this.ownershipService.assertRole(context, MANAGE_ROLES);

    return this.prisma.styleProfile.create({
      data: {
        user_id: context.user_id,
        organisation_id: context.organisation_id,
        name: dto.name,
        platform: dto.platform,
        source_url: dto.source_url,
      },
    });
  }

  async findAll(userId: string, query: StyleProfilesQueryType) {
    if (query.organisation_id) {
      await this.ownershipService.resolveContext(userId, query.organisation_id);
    }

    const where = {
      ...(query.organisation_id
        ? { organisation_id: query.organisation_id }
        : { user_id: userId }),
      ...(query.platform && { platform: query.platform }),
    };

    const { skip, take } = paginate(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.styleProfile.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.styleProfile.count({ where }),
    ]);

    return { data, pagination: paginationMeta(total, query.page, query.limit) };
  }

  async findOwned(userId: string, id: string) {
    const profile = await this.prisma.styleProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Style profile not found');

    if (profile.organisation_id) {
      await this.ownershipService.resolveContext(userId, profile.organisation_id);
    } else if (profile.user_id !== userId) {
      throw new ForbiddenException('You do not have access to this style profile');
    }

    return profile;
  }

  async findOne(userId: string, id: string) {
    return this.findOwned(userId, id);
  }

  private async assertManage(userId: string, profile: { organisation_id?: string | null }) {
    if (profile.organisation_id) {
      const context = await this.ownershipService.resolveContext(userId, profile.organisation_id);
      this.ownershipService.assertRole(context, MANAGE_ROLES);
    }
  }

  async update(userId: string, id: string, dto: UpdateStyleProfileDto) {
    const profile = await this.findOwned(userId, id);
    await this.assertManage(userId, profile);

    return this.prisma.styleProfile.update({
      where: { id },
      data: {
        name: dto.name,
        platform: dto.platform,
        source_url: dto.source_url,
      },
    });
  }

  async remove(userId: string, id: string) {
    const profile = await this.findOwned(userId, id);
    await this.assertManage(userId, profile);

    await this.prisma.styleProfile.delete({ where: { id } });
    return { message: 'Style profile deleted successfully' };
  }

  async analyze(userId: string, id: string, dto: AnalyzeStyleProfileDto) {
    const profile = await this.findOwned(userId, id);
    await this.assertManage(userId, profile);

    const prompt = `Analyze the writing style of the following ${profile.platform} posts and return ONLY a raw JSON object (no markdown) with this exact shape:
{
  "tone_score": number (0-100),
  "structure_score": number (0-100),
  "hooks_score": number (0-100),
  "vocabulary_score": number (0-100),
  "rhythm_score": number (0-100),
  "tone_description": string,
  "dominant_hook": string,
  "vocabulary": string[] (10-20 signature words/phrases),
  "pillars": string[] (3-6 recurring content themes)
}

Posts:
${dto.sample_posts.map((post, i) => `[${i + 1}] ${post}`).join('\n\n')}`;

    const { response } = await this.aiService.generateText({
      prompt,
      system: 'You are an expert content strategist who fingerprints writing style for AI drafting.',
      temperature: 0.4,
    });

    const analysis = parseAiJson(response, AnalysisSchema);

    return this.prisma.styleProfile.update({
      where: { id },
      data: {
        ...analysis,
        posts_analyzed: profile.posts_analyzed + dto.sample_posts.length,
        last_analyzed_at: new Date(),
      },
    });
  }
}
