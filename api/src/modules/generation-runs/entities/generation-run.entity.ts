import { ApiProperty } from '@nestjs/swagger';

export class GenerationRunEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  project_id: string;

  @ApiProperty({ required: false, nullable: true })
  style_profile_id?: string | null;

  @ApiProperty({ required: false, nullable: true })
  automation_id?: string | null;

  @ApiProperty({ required: false, nullable: true })
  label?: string | null;

  @ApiProperty({ required: false, nullable: true })
  posts_requested?: number | null;

  @ApiProperty()
  language: string;

  @ApiProperty()
  created_at: Date;
}
