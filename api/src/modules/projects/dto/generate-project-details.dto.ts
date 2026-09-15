import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PostType } from 'generated/prisma';

export class GenerateProjectDetailsDto {
  @ApiProperty({ description: 'Working project title', example: 'Q1 Product Launch' })
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: PostType, required: false })
  @IsOptional()
  @IsEnum(PostType)
  platform?: PostType;

  @ApiProperty({
    required: false,
    description: 'Freeform directions to guide the AI while planning this content strategy',
  })
  @IsOptional()
  @IsString()
  ai_directions?: string;
}
