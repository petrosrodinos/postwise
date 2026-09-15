import { ApiProperty } from '@nestjs/swagger';
import { AutomationFrequency, AutomationOutputStage } from 'generated/prisma';

export class AutomationEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  project_id: string;

  @ApiProperty({ required: false, nullable: true })
  style_profile_id?: string | null;

  @ApiProperty()
  name: string;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty({ enum: AutomationFrequency })
  frequency: AutomationFrequency;

  @ApiProperty({ type: [Number] })
  days_of_week: number[];

  @ApiProperty()
  time_of_day: string;

  @ApiProperty()
  timezone: string;

  @ApiProperty()
  posts_per_run: number;

  @ApiProperty({ enum: AutomationOutputStage })
  output_stage: AutomationOutputStage;

  @ApiProperty({ required: false, nullable: true })
  last_run_at?: Date | null;

  @ApiProperty({ required: false, nullable: true })
  next_run_at?: Date | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
