import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class SchedulePostDto {
  @ApiProperty({ description: 'When to publish, ISO 8601' })
  @IsDateString()
  scheduled_at: string;
}
