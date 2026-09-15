import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';

export class FetchRssItemsDto {
  @ApiProperty({
    required: false,
    minimum: 1,
    maximum: 50,
    default: 20,
    description: 'Max number of items to return, newest first',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiProperty({ required: false, description: 'Only return items published after this date' })
  @IsOptional()
  @IsDateString()
  since?: string;

  @ApiProperty({
    required: false,
    default: true,
    description: 'Exclude items already turned into a post',
  })
  @IsOptional()
  @IsBoolean()
  unused_only?: boolean;
}
