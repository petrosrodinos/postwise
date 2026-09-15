import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(
  OmitType(CreateProjectDto, ['organisation_id'] as const),
) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_archived?: boolean;
}
