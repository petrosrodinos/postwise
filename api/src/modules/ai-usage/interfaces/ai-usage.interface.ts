import { AiUsageFeature, AiUsageType } from 'generated/prisma';

export interface RecordAiUsageParams {
  organisation_id: string | null;
  user_id: string | null;
  type: AiUsageType;
  feature: AiUsageFeature;
  provider: string;
  model: string;
  input_tokens?: number | null;
  output_tokens?: number | null;
  total_tokens?: number | null;
  image_count?: number | null;
  input_cost?: number;
  output_cost?: number;
  total_cost: number;
  generation_run_id?: string | null;
  post_id?: string | null;
  metadata?: Record<string, unknown>;
}
