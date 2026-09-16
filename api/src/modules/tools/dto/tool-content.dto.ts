import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// Tools has its own content-type set, deliberately separate from the
// Prisma `PostType` enum shared by Post/Project/StyleProfile: EMAIL is a
// Tools-only concept (a draftable content type with no real publishing
// integration) and must never become a valid Post/Project/StyleProfile
// platform, so it's kept out of that shared enum entirely.
export const TOOL_CONTENT_TYPES = [
  'TWITTER',
  'LINKEDIN',
  'BLOG',
  'EMAIL',
] as const;
export type ToolContentType = (typeof TOOL_CONTENT_TYPES)[number];

// The content a stateless tool operates on — typed in by the user in the
// Tools page, never persisted. Every tool endpoint takes this shape (plus
// its own extra fields) and returns a result for the client to apply
// in-place; nothing here is saved server-side.
export class ToolContentDto {
  @ApiProperty({ description: 'Organisation workspace to run this tool under' })
  @IsNotEmpty()
  @IsString()
  organisation_id: string;

  @ApiProperty({ enum: TOOL_CONTENT_TYPES })
  @IsIn(TOOL_CONTENT_TYPES)
  type: ToolContentType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    required: false,
    description: 'Opening hook / short-form copy',
  })
  @IsOptional()
  @IsString()
  hook?: string;

  @ApiProperty({ required: false, description: 'Main body content' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  excerpt?: string;
}
