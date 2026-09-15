import { BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

// AI text responses sometimes wrap JSON in markdown code fences — strip those
// before parsing, then validate the shape against the caller's schema so an
// untrusted model response never reaches the database unchecked.
export function parseAiJson<T>(raw: string, schema: ZodSchema<T>): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new BadRequestException('AI returned a response that was not valid JSON');
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new BadRequestException({
      message: 'AI response did not match the expected shape',
      errors: result.error.errors,
    });
  }

  return result.data;
}
