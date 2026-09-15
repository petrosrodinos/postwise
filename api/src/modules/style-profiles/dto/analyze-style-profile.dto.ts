import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class AnalyzeStyleProfileDto {
  @ApiProperty({
    type: [String],
    description: "Sample posts written by the creator, used to fingerprint their style",
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  sample_posts: string[];
}
