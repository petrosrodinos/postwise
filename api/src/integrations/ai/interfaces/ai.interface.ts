import { z } from 'zod';
import { AiUsageFeature } from 'generated/prisma';

// Attribution every AI call must carry so its cost can be recorded against
// an organisation/user. organisation_id is null only for the org-less
// internal admin passthrough; user_id is null for automation/cron-triggered
// runs. Required (not optional) on AIGenerateOptions/GenerateImagesOptions
// so a missing attribution is a compile-time error, not a silently dropped
// cost record.
export interface AiUsageContext {
    organisation_id: string | null;
    user_id: string | null;
    feature: AiUsageFeature;
    generation_run_id?: string | null;
    post_id?: string | null;
    metadata?: Record<string, unknown>;
}

export interface AIGenerateOptions {
    provider?: AiProvider;
    model?: AiModel;
    system?: string;
    prompt: string;
    schema?: z.ZodSchema;
    output?: 'json' | 'no-schema';
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    usage: AiUsageContext;
}

export interface AIGenerateTextResponse {
    response: string;
    usage?: AICostResponse
}

export interface AIGenerateObjectResponse {
    response: z.ZodSchema[] | null;
    usage?: AICostResponse
}



export interface AIStreamTextOptions extends AIGenerateOptions {
    onToken?: (token: string) => void;
    onComplete?: (fullText: string) => void;
}

export interface AIModelInfo {
    provider: AiProvider;
    model: AiModel;
}

export interface AICost {
    provider?: AiProvider,
    model?: AiModel,
    inputTokens: number,
    outputTokens: number,
}

export interface AICostResponse {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    inputRate: number;
    outputRate: number;
    inputCost: number;
    outputCost: number;
    totalCost: number;
}

export const AiProviders = {
    openai: 'openai',
    grok: 'grok',
    gemini: 'gemini',
} as const;

export const AiModels = {
    openai: {
        gpt4o: 'gpt-4o',
        gpt4oMini: 'gpt-4o-mini',
        gpt4Turbo: 'gpt-4-turbo',
        gpt4: 'gpt-4',
        gpt35Turbo: 'gpt-3.5-turbo',
    },
    grok: {
        grokBeta: 'grok-beta',
        grokPro: 'grok-pro',
    },
    gemini: {
        geminiPro: 'gemini-pro',
        geminiProVision: 'gemini-pro-vision',
        gemini15Pro: 'gemini-1.5-pro',
        gemini15Flash: 'gemini-1.5-flash',
    }
}

export type AiProvider = typeof AiProviders[keyof typeof AiProviders];
export type AiModel = string;


