import { z } from 'zod';

export const ProjectAiSuggestionsSchema = z.object({
  pillars: z.array(z.string()).min(1).max(8),
  ideas: z.array(z.string()).min(1).max(10),
  instructions: z.array(z.string()).min(1).max(8),
});

export type ProjectAiSuggestions = z.infer<typeof ProjectAiSuggestionsSchema>;
