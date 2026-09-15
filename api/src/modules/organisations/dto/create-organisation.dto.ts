import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class CreateOrganisationDto {
  @ApiProperty({ description: 'Organisation display name', example: 'Acme Inc' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({
    description: 'URL-safe unique slug',
    example: 'acme-inc',
  })
  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase, alphanumeric, and hyphen-separated',
  })
  slug: string;
}
