import { ApiProperty } from '@nestjs/swagger';
import { AiUsageFeature, AiUsageType } from 'generated/prisma';

class AiUsageEventUserEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

export class AiUsageEventEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true })
  organisation_id: string | null;

  @ApiProperty({ type: AiUsageEventUserEntity, nullable: true })
  user: AiUsageEventUserEntity | null;

  @ApiProperty({ enum: AiUsageType })
  type: AiUsageType;

  @ApiProperty({ enum: AiUsageFeature })
  feature: AiUsageFeature;

  @ApiProperty()
  provider: string;

  @ApiProperty()
  model: string;

  @ApiProperty({ nullable: true })
  input_tokens: number | null;

  @ApiProperty({ nullable: true })
  output_tokens: number | null;

  @ApiProperty({ nullable: true })
  total_tokens: number | null;

  @ApiProperty({ nullable: true })
  image_count: number | null;

  @ApiProperty()
  input_cost: number;

  @ApiProperty()
  output_cost: number;

  @ApiProperty()
  total_cost: number;

  @ApiProperty({ nullable: true })
  generation_run_id: string | null;

  @ApiProperty({ nullable: true })
  post_id: string | null;

  @ApiProperty({ nullable: true })
  metadata: Record<string, unknown> | null;

  @ApiProperty()
  created_at: Date;
}
