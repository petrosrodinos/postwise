import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateStyleProfileDto } from './create-style-profile.dto';

export class UpdateStyleProfileDto extends PartialType(
  OmitType(CreateStyleProfileDto, ['organisation_id'] as const),
) {}
