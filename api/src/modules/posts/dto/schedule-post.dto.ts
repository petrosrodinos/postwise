import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class SchedulePostDto {
  @ApiProperty({ description: 'When to publish, ISO 8601' })
  @IsDateString()
  scheduled_at: string;

  @ApiProperty({
    type: [String],
    required: false,
    description: 'Social channel connections to publish to (TWITTER/LINKEDIN posts only)',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  channel_connection_ids?: string[];
}
